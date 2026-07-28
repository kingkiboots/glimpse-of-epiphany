import Button from "@/shared/ui/Button";
import Panel from "@/shared/ui/Panel";
import { getCurrentDate } from "@packages/utils";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./ConfirmPage.module.css";
import { ERROR_TYPES, ROUTE_PATHS } from "@/shared/consts";

type ConfirmPageProps = {
  photoUrl?: string | null;
  message?: string;
};

const ConfirmPage = ({
  photoUrl = null,
  message = `감사한 날이었다~~\n너무 좋다~~~~\n행복하고 하나님 너무 좋다~~~~\n조금 안감사했지만 돌아보니 감사하다`,
}: ConfirmPageProps) => {
  const [currentDate] = useState(getCurrentDate);

  const navigate = useNavigate();

  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handlePrevStepClick = () => {
    if (!canGoBack) {
      return;
    }

    router.history.back();
  };

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
              {photoUrl ? (
                <img
                  src={photoUrl}
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
          <Button aria-describedby="cta-caption" onClick={() => {}}>
            이미지 전시하기
          </Button>
          {/* STUB - 이 기능은 없어짐 */}
          {/* <Button onClick={() => {}}>저장하기</Button> */}
          <Button onClick={handlePrevStepClick}>이전으로</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPage;
