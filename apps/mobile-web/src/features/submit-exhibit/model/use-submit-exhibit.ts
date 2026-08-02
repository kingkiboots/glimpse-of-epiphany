import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createExhibit } from "@packages/api";
import { useExhibitDraft } from "@/entities/exhibit";
import { ROUTE_PATHS } from "@/shared/consts";
import { compressToWebp } from "@/shared/lib/image";

/**
 * 작성한 사진·메시지를 webp로 변환해 Supabase(Storage + DB)에 올린다.
 * 성공하면 완료 화면으로, 실패하면 에러 화면으로 이동시킨다.
 */
export const useSubmitExhibit = () => {
  const { file, message, reset } = useExhibitDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = useCallback(async () => {
    if (!file || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const webpFile = await compressToWebp(file);

      await createExhibit({ imageFile: webpFile, message });

      // 화면을 먼저 전환한 뒤 초기화한다.
      // 순서를 바꾸면 confirm 화면이 "사진 없음"으로 판단해 작성 화면으로 되돌린다.
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
  }, [file, message, isSubmitting, navigate, reset]);

  return { submit, isSubmitting };
};
