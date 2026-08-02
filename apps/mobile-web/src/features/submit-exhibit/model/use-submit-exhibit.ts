import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createExhibit } from "@packages/api";
import { useExhibitDraft } from "@/entities/exhibit";
import { ROUTE_PATHS } from "@/shared/consts";

/**
 * 준비 화면에서 변환해둔 webp와 작성한 메시지를 Supabase(Storage + DB)에 올린다.
 * 성공하면 완료 화면으로, 실패하면 에러 화면으로 이동시킨다.
 */
export const useSubmitExhibit = () => {
  const { compressedFile, message, reset } = useExhibitDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = useCallback(async () => {
    // 사진은 홈에서만 고르고 준비 화면에서 변환까지 끝나므로,
    // 여기까지 왔다면 변환된 파일이 반드시 있다.
    if (!compressedFile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createExhibit({ imageFile: compressedFile, message });

      // 화면을 먼저 전환한 뒤 초기화한다.
      // 순서를 바꾸면 confirm 화면이 "사진 없음"으로 판단해 홈으로 되돌린다.
      await navigate({ to: ROUTE_PATHS.complete });
      reset();
    } catch (error) {
      console.error("전시물 업로드 실패", error);

      await navigate({
        to: ROUTE_PATHS.error,
        search: { type: "upload-failed" },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [compressedFile, message, isSubmitting, navigate, reset]);

  return { submit, isSubmitting };
};
