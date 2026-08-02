import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";
import type { ExhibitRow } from "./types";

/** Supabase Storage 버킷 이름. 마이그레이션의 버킷 id와 동일해야 한다. */
export const EXHIBIT_IMAGE_BUCKET = "exhibit-images";

/**
 * 전시물이 화면에 살아있는 시간(분).
 * 실제 삭제는 pg_cron이 1분마다 돌기 때문에 5~6분 사이에 일어난다.
 * 마이그레이션의 interval 값과 함께 맞춰야 한다.
 */
export const EXHIBIT_TTL_MINUTES = 5;

/** 두 앱이 공유하는 도메인 모델. DB row(snake_case)를 화면에서 쓰기 좋은 형태로 변환한 값. */
export type Exhibit = {
  id: string;
  imageUrl: string;
  message: string;
  createdAt: string;
};

export type CreateExhibitInput = {
  /** webp로 변환·압축이 끝난 이미지 파일 */
  imageFile: File;
  message: string;
};

export type ExhibitSubscriptionHandlers = {
  onInsert?: (exhibit: Exhibit) => void;
  /** 관리자 삭제 또는 5분 만료. 페이로드에 기본키만 오므로 id만 넘긴다. */
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
});

/**
 * 이미지를 Storage에 올리고 exhibits 레코드를 만든다.
 * 레코드 생성이 실패해 남은 파일은 cleanup-orphan-images Edge Function이 정리한다.
 */
export const createExhibit = async ({
  imageFile,
  message,
}: CreateExhibitInput): Promise<Exhibit> => {
  const supabase = getSupabaseClient();
  const imagePath = `${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(EXHIBIT_IMAGE_BUCKET)
    .upload(imagePath, imageFile, {
      contentType: "image/webp",
      // 5분이면 사라지는 이미지다. 캐시를 길게 잡으면 삭제 후에도
      // CDN 엣지에서 한동안 계속 서빙되어 하드킬이 성립하지 않는다.
      cacheControl: `${EXHIBIT_TTL_MINUTES * 60}`,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드에 실패했습니다: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("exhibits")
    .insert({ image_path: imagePath, message })
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
