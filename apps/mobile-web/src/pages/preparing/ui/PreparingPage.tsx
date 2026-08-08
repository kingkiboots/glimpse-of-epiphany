import { ROUTE_PATHS } from "@/shared/consts";
import PageShell from "@/shared/ui/PageShell";
import Spinner from "@/shared/ui/Spinner";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import styles from "./PreparingPage.module.css";
import { useBibleVerse } from "@/features/bible-verse";
import { useExhibitDraft } from "@/entities/exhibit";
import { compressForUpload } from "@/shared/lib/image";

/** 성구를 읽을 시간을 주기 위한 최소 노출 시간. 변환이 더 걸리면 끝날 때까지 기다린다. */
const MINIMUM_DURATION_MS = 5000;

const PreparingPage = () => {
  const { book, chapter, verse, text } = useBibleVerse();
  const { file, setCompressedFile } = useExhibitDraft();

  const navigate = useNavigate();

  /**
   * 5초는 조금 짧을 수도 있으니깐 3초 뒤 __skip->__ 버튼이 뜨게 하는건 어떨까?
   */
  useEffect(() => {
    // 새로고침 등으로 사진 없이 들어온 경우 되돌린다.
    if (!file) {
      navigate({ to: ROUTE_PATHS.home, replace: true });
      return;
    }

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const minimumWait = new Promise<void>((resolve) => {
      timeoutId = setTimeout(resolve, MINIMUM_DURATION_MS);
    });

    // 이 화면이 떠 있는 동안 실제로 변환을 돌린다. 덕분에 제출 때는 업로드만 남는다.
    // 업로드까지 당기지는 않는다. 참가자가 아직 전시에 동의하지 않은 시점이다.
    Promise.all([compressForUpload(file), minimumWait])
      .then(([compressed]) => {
        if (!active) {
          return;
        }

        setCompressedFile(compressed);
        navigate({ to: ROUTE_PATHS.compose, replace: true });
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }

        console.error("사진 준비 실패", cause);

        navigate({
          to: ROUTE_PATHS.error,
          search: { type: "prepare-failed" },
          replace: true,
        });
      });

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [file, navigate, setCompressedFile]);

  return (
    <PageShell
      className={styles.shell}
      footer={
        <div className={styles.verse}>
          <p className={styles.verseReference}>
            {book} {chapter}:{verse}
          </p>
          <p className={styles.verseText}>{text}</p>
        </div>
      }
    >
      <div className={styles.loading}>
        <Spinner size={48} />
        <span className={styles.loadingLabel}>Loading...</span>
      </div>
    </PageShell>
  );
};

export default PreparingPage;
