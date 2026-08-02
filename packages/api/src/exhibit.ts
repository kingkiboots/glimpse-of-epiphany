import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";
import type { ExhibitRow } from "./types";

/** Supabase Storage 버킷 이름. 마이그레이션의 버킷 id와 동일해야 한다. */
export const EXHIBIT_IMAGE_BUCKET = "exhibit-images";

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
 * anon에게는 delete 권한이 없으므로(RLS) 레코드 생성이 실패하면 이미지는 고아 파일로 남는다.
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
      cacheControl: "31536000",
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

/** 프로젝터 초기 렌더용. 최신순으로 가져온다. */
export const fetchExhibits = async (limit = 100): Promise<Exhibit[]> => {
  const { data, error } = await getSupabaseClient()
    .from("exhibits")
    .select()
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`전시 목록을 불러오지 못했습니다: ${error.message}`);
  }

  return (data ?? []).map(toExhibit);
};

/**
 * 신규 전시물 INSERT를 구독한다. 반환된 함수를 호출해 구독을 해제한다.
 * (프로젝터 앱에서 useEffect cleanup으로 호출)
 */
export const subscribeToExhibits = (
  onInsert: (exhibit: Exhibit) => void,
): (() => void) => {
  const supabase = getSupabaseClient();

  const channel: RealtimeChannel = supabase
    .channel("exhibits-insert")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "exhibits" },
      (payload) => {
        const row = payload.new as ExhibitRow;

        if (row.is_hidden) {
          return;
        }

        onInsert(toExhibit(row));
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};
