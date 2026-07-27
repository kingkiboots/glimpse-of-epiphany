import Button from "@/shared/ui/Button";
import ImageBox from "@/shared/ui/ImageBox";
import Input from "@/shared/ui/Input";
import Panel from "@/shared/ui/Panel";
import { useId, useState } from "react";

import styles from "./ComposePage.module.css";

const ComposePage = () => {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [value, setValue] = useState("");

  return (
    <div className={styles.content}>
      <header className={styles.textArea}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
      </header>
      <div className={styles.imageBoxArea}>
        <Panel radius="panel" padding="8px" width={272} height={247}>
          <ImageBox file={file} onChange={setFile} />
        </Panel>
      </div>
      <div className={styles.inputArea}>
        <label htmlFor={id} className={styles.label}>
          이 순간 하나님께
          <br />
          어떤 감사를 드릴 수 있었나요?
        </label>
        <Panel radius="panel" padding="10px 12px" width={272} height={134}>
          <Input
            id={id}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </Panel>
      </div>
      <div className={styles.ctaArea}>
        <p id="cta-caption" className={styles.ctaCaption}>
          *내용은 공유되지 않습니다.
        </p>
        <Button aria-describedby="cta-caption" onClick={() => {}}>
          작성 완료
        </Button>
      </div>
    </div>
  );
};

export default ComposePage;
