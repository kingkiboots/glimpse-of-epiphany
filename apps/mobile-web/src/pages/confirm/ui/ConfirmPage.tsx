import Button from "@/shared/ui/Button";
import Panel from "@/shared/ui/Panel";
import styles from "./ConfirmPage.module.css";

type ConfirmPageProps = {
  photoUrl?: string | null;
  message?: string;
};

const ConfirmPage = ({ photoUrl = null, message = "" }: ConfirmPageProps) => {
  return (
    <div className={styles.content}>
      <header className={styles.textArea}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
      </header>
      <div className={styles.imageBoxArea}>
        <Panel radius="panel" padding="8px" width={272} height={247}>
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
        </Panel>
      </div>
      <div className={styles.inputArea}>
        <p className={styles.label}>작성한 감사 내용</p>
        <Panel radius="panel" padding="10px 12px" width={272} height={134}>
          <p className={styles.messagePreview}>
            {message || "작성한 문구가 없어요"}
          </p>
        </Panel>
      </div>
      <div className={styles.ctaArea}>
        <p id="cta-caption" className={styles.ctaCaption}>
          *공유하면 빔프로젝터 화면에 바로 표시돼요.
        </p>
        <Button aria-describedby="cta-caption" onClick={() => {}}>
          공유하기
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPage;
