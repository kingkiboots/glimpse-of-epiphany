import type { RealtimeChannel } from "@supabase/supabase-js";
import { randomUuid } from "@packages/utils";
import { getSupabaseClient } from "./client";
import type { ExhibitRow } from "./types";

/** Supabase Storage 버킷 이름. 마이그레이션의 버킷 id와 동일해야 한다. */
export const EXHIBIT_IMAGE_BUCKET = "exhibit-images";

/**
 * 업로드를 허용하는 이미지 타입. 마이그레이션의 `allowed_mime_types`와 같아야 한다.
 *
 * webp가 기본이지만 jpeg도 받는다. 일부 인앱 브라우저(카카오톡 등)는 캔버스로 webp를
 * 인코딩하지 못하는데, 그 경우 브라우저가 오류 없이 PNG를 돌려주고 무손실이라 압축이
 * 되지 않아 업로드가 통째로 막힌다. jpeg를 열어두면 그런 기기도 전시에 참여할 수 있다.
 */
export const UPLOAD_IMAGE_TYPES: readonly string[] = ["image/webp", "image/jpeg"];

/**
 * 파일 하나의 상한. 마이그레이션의 `file_size_limit`과 같아야 한다.
 * 클라이언트 목표치는 300KB이고, 이 값은 그것을 못 맞췄을 때 걸리는 최종 방어선이다.
 */
export const MAX_UPLOAD_BYTES = 1_048_576;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

/**
 * 전시물이 남아 있는 시간(시간 단위).
 *
 * 전시가 2시간 반이라 초반에 올린 사진은 행사가 끝나기 전에 사라진다. 다만 프로젝터
 * 자리가 18칸뿐이라 그 사진들은 이미 뒤 사진에 밀려나 있을 시점이다.
 *
 * 화면 문구가 이 값을 그대로 쓰므로, 바꿀 때는
 * `20260804000100_schedule_exhibit_expiry_2h.sql`의 interval도 함께 맞춰야 한다.
 * 실제 삭제는 크론이 10분마다 돌기 때문에 2시간에서 10분쯤 늦게 일어난다.
 */
export const EXHIBIT_TTL_HOURS = 2;

/**
 * CDN 캐시 수명(초).
 *
 * 수명이 2시간이어도 캐시는 짧게 잡는다. 길게 잡으면 관리자가 내린 사진이 한동안
 * CDN 엣지에서 계속 서빙되어 하드킬이 성립하지 않는다. 부적절한 사진을 즉시
 * 내려야 하는 것이 관리자 화면의 존재 이유다.
 */
const EXHIBIT_CACHE_SECONDS = 300;

/** 두 앱이 공유하는 도메인 모델. DB row(snake_case)를 화면에서 쓰기 좋은 형태로 변환한 값. */
export type Exhibit = {
  id: string;
  imageUrl: string;
  message: string;
  createdAt: string;
  /** 업로드한 기기 식별자. 값이 없을 수 있다. */
  clientId: string | null;
};

export type CreateExhibitInput = {
  /** 변환·압축이 끝난 이미지 파일 (UPLOAD_IMAGE_TYPES 중 하나) */
  imageFile: File;
  message: string;
  /**
   * 업로드한 기기 식별자(localStorage의 임의 UUID).
   * 운영자가 기기 단위로 정리할 때 쓰는 부가 정보라 없어도 업로드는 진행한다.
   */
  clientId?: string | null;
};

export type ExhibitSubscriptionHandlers = {
  onInsert?: (exhibit: Exhibit) => void;
  /** 관리자 삭제 또는 2시간 만료. 페이로드에 기본키만 오므로 id만 넘긴다. */
  onDelete?: (id: string) => void;
};

/** Storage 경로를 CDN 공개 URL로 변환한다. */
export const getExhibitImageUrl = (imagePath: string): string =>
  getSupabaseClient().storage.from(EXHIBIT_IMAGE_BUCKET).getPublicUrl(imagePath)
    .data.publicUrl;

const toExhibit = (row: ExhibitRow): Exhibit => ({
  id: row.id,
  imageUrl: getExhibitImageUrl(row.image_path),
  message: row.message,
  createdAt: row.created_at,
  clientId: row.client_id,
});

/**
 * 이미지를 Storage에 올리고 exhibits 레코드를 만든다.
 * 레코드 생성이 실패해 남은 파일은 cleanup-orphan-images Edge Function이 정리한다.
 */
export const createExhibit = async ({
  imageFile,
  message,
  clientId = null,
}: CreateExhibitInput): Promise<Exhibit> => {
  const supabase = getSupabaseClient();

  // 타입을 여기서 다시 확인한다. 잘못된 값이 오면 Storage가 413이나 400으로
  // 되돌려주는데, 그 메시지만으로는 무엇이 잘못됐는지 알 수 없다.
  if (!UPLOAD_IMAGE_TYPES.includes(imageFile.type)) {
    throw new Error(`지원하지 않는 이미지 형식입니다: ${imageFile.type}`);
  }

  if (imageFile.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `이미지가 너무 큽니다: ${Math.round(imageFile.size / 1024)}KB ` +
        `(최대 ${Math.round(MAX_UPLOAD_BYTES / 1024)}KB)`,
    );
  }

  const imagePath = `${randomUuid()}.${EXTENSION_BY_TYPE[imageFile.type]}`;

  const { error: uploadError } = await supabase.storage
    .from(EXHIBIT_IMAGE_BUCKET)
    .upload(imagePath, imageFile, {
      contentType: imageFile.type,
      cacheControl: `${EXHIBIT_CACHE_SECONDS}`,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드에 실패했습니다: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("exhibits")
    .insert({ image_path: imagePath, message, client_id: clientId })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `전시 정보 저장에 실패했습니다: ${error?.message ?? "unknown error"}`,
    );
  }

  return toExhibit(data);
};

/** 최신순으로 가져온다. 프로젝터 초기 렌더와 관리자 목록이 함께 쓴다. */
export const fetchExhibits = async (limit = 100): Promise<Exhibit[]> => {
  const { data, error } = await getSupabaseClient()
    .from("exhibits")
    .select()
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`전시 목록을 불러오지 못했습니다: ${error.message}`);
  }

  return (data ?? []).map(toExhibit);
};

/**
 * 전시물을 삭제한다(하드킬). RLS상 로그인한 관리자만 성공한다.
 * Storage 파일은 cleanup-orphan-images Edge Function이 뒤따라 정리한다.
 */
export const deleteExhibit = async (id: string): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from("exhibits")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`전시물을 삭제하지 못했습니다: ${error.message}`);
  }
};

/**
 * 전시물의 추가·삭제를 구독한다. 반환된 함수를 호출해 구독을 해제한다.
 * (프로젝터 앱에서 useEffect cleanup으로 호출)
 */
export const subscribeToExhibits = (
  handlers: ExhibitSubscriptionHandlers,
): (() => void) => {
  const supabase = getSupabaseClient();

  const channel: RealtimeChannel = supabase
    .channel("exhibits-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "exhibits" },
      (payload) => {
        handlers.onInsert?.(toExhibit(payload.new as ExhibitRow));
      },
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "exhibits" },
      (payload) => {
        // replica identity가 default라 old에는 기본키만 들어 있다.
        const { id } = payload.old as Pick<ExhibitRow, "id">;

        if (id) {
          handlers.onDelete?.(id);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};
