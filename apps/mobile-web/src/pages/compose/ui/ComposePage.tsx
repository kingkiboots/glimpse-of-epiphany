import Button from "@/shared/ui/Button";
import ImageBox from "@/shared/ui/ImageBox";
import Input from "@/shared/ui/Input";
import Panel from "@/shared/ui/Panel";
import { useEffect, useId } from "react";

import styles from "./ComposePage.module.css";
import { useNavigate } from "@tanstack/react-router";
import { ROUTE_PATHS } from "@/shared/consts";
import { useExhibitDraft } from "@/entities/exhibit";

const ComposePage = () => {
  const id = useId();
  const { file, message, previewUrl, setMessage } = useExhibitDraft();

  const navigate = useNavigate();

  // 사진 선택은 홈에서만 한다. 새로고침 등으로 사진 없이 들어오면 여기서는
  // 다시 고를 방법이 없으므로 처음으로 되돌린다.
  useEffect(() => {
    if (!file) {
      navigate({ to: ROUTE_PATHS.home, replace: true });
    }
  }, [file, navigate]);

  const handleSubmit = () => {
    navigate({ to: ROUTE_PATHS.confirm });
  };

  if (!file) {
    return null;
  }

  return (
    <div className={styles.content}>
      <header className={styles.textArea}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
      </header>
      <div className={styles.imageBoxArea}>
        <Panel radius="panel" padding="8px" width={272} height={247}>
          <ImageBox src={previewUrl} />
        </Panel>
      </div>
      <div className={styles.inputArea}>
        <label htmlFor={id} className={styles.label}>
          이 순간 하나님께
          <br />
          어떤 감사를 드릴 수 있었나요?
        </label>
        <Panel radius="panel" padding="10px 12px" width={272} height={134}>
          <Input id={id} value={message} onChange={setMessage} />
        </Panel>
      </div>
      <div className={styles.ctaArea}>
        <p id="cta-caption" className={styles.ctaCaption}>
          *내용은 공유되지 않습니다.
        </p>
        <Button aria-describedby="cta-caption" onClick={handleSubmit}>
          작성 완료
        </Button>
      </div>
    </div>
  );
};

export default ComposePage;
