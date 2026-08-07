import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentDate } from "@packages/utils";
import { useExhibitDraft } from "@/entities/exhibit";
import { useScreenBackgroundUrl } from "@/shared/lib/screen-background";
import { renderExhibitCard } from "../model/render-exhibit-card";
import { saveImageFile } from "../model/save-image-file";

/**
 * 미리보기 카드를 이미지로 만들어 사용자에게 넘긴다.
 *
 * 이미지는 버튼을 누른 뒤가 아니라 화면에 들어오는 시점에 미리 만들어 둔다.
 * navigator.share()는 사용자 제스처의 유효 시간 안에 호출되어야 하는데,
 * 클릭 후에 합성을 시작하면 그 사이에 활성화가 만료되어 iOS에서 공유 시트가
 * 열리지 않을 수 있다. 클릭 핸들러는 준비된 파일을 넘기기만 한다.
 */
export const useSaveExhibitImage = () => {
  const { compressedFile, message } = useExhibitDraft();
  const backgroundImageUrl = useScreenBackgroundUrl();

  const imageRef = useRef<Blob | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!compressedFile) {
      return;
    }

    let active = true;

    void renderExhibitCard({
      photo: compressedFile,
      message,
      dateText: getCurrentDate(),
      backgroundImageUrl,
    })
      .then((blob) => {
        if (!active) {
          return;
        }

        imageRef.current = blob;
        setIsReady(true);
      })
      .catch((cause: unknown) => {
        // 저장은 부가 기능이다. 실패해도 전시 흐름을 막지 않는다.
        console.error("저장용 이미지 생성 실패", cause);
      });

    return () => {
      active = false;
    };
  }, [compressedFile, message, backgroundImageUrl]);

  const save = useCallback(async () => {
    const image = imageRef.current;

    if (!image || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await saveImageFile(image, `일상속감사_${getCurrentDate()}.png`);
    } catch (cause) {
      console.error("이미지 저장 실패", cause);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  return { save, isReady, isSaving };
};
