import { ROUTE_PATHS } from "@/shared/consts";
import Button from "@/shared/ui/Button";
import Panel from "@/shared/ui/Panel";
import { getCurrentDate } from "@packages/utils";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useExhibitDraft } from "@/entities/exhibit";
import { useSubmitExhibit } from "@/features/submit-exhibit";
import styles from "./ConfirmPage.module.css";

const ConfirmPage = () => {
  const [currentDate] = useState(getCurrentDate);
  const { file, message, previewUrl } = useExhibitDraft();
  const { submit, isSubmitting } = useSubmitExhibit();

  const navigate = useNavigate();

  const router = useRouter();
  const canGoBack = useCanGoBack();

  // 새로고침 등으로 작성 내용이 사라진 채 이 화면에 들어온 경우 작성 화면으로 되돌린다.
  useEffect(() => {
    if (!file) {
      navigate({ to: ROUTE_PATHS.compose, replace: true });
    }
  }, [file, navigate]);

  const handleSubmitClick = () => {
    /*void*/ submit();
  };

  const handlePrevStepClick = () => {
    if (!canGoBack) {
      navigate({ to: ROUTE_PATHS.compose });
      return;
    }

    router.history.back();
  };

  if (!file) {
    return null;
  }

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
      </header>
      <div className={styles.previewContainer}>
        <Panel
          radius="panel"
          padding="11px"
          width={272}
          height={388}
          style={{
            maxHeight: "388px",
          }}
        >
          <div className={styles.previewArea}>
            <div className={styles.imagePreview}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="선택한 사진"
                  className={styles.previewImage}
                />
              ) : (
                <span className={styles.placeholderLabel}>
                  선택한 사진이 없어요
                </span>
              )}
            </div>
            <div className={styles.messagePreview}>
              <p className={styles.previewMessage}>{message}</p>
              <p className={styles.previewMessageCaption}>
                {currentDate}
                <br /> 삶으로 쓰는 예배전 (展)
              </p>
            </div>
          </div>
        </Panel>
      </div>
      <div className={styles.ctaArea}>
        <p id="cta-caption" className={styles.ctaCaption}>
          *내용은 공유되지 않습니다.
        </p>
        <div className={styles.ctaButtonGroup}>
          <Button
            aria-describedby="cta-caption"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? "전시하는 중..." : "이미지 전시하기"}
          </Button>
          {/* STUB - 이 기능은 없어짐 */}
          {/* <Button onClick={() => {}}>저장하기</Button> */}
          <Button onClick={handlePrevStepClick} disabled={isSubmitting}>
            이전으로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPage;
