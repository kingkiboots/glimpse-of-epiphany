import { ROUTE_PATHS } from "@/shared/consts";
import Button from "@/shared/ui/Button";
import { useExhibitDraft } from "@/entities/exhibit";
import { useNavigate } from "@tanstack/react-router";
import { useRef, type ChangeEventHandler } from "react";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { setFile } = useExhibitDraft();
  const inputRef = useRef<HTMLInputElement>(null);

  // 갤러리는 반드시 이 클릭에서 바로 열어야 한다. 먼저 화면을 옮긴 뒤 코드로 열면
  // 모바일 브라우저가 사용자 제스처 없는 파일 선택으로 보고 막는다.
  const handleCtaClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const selected = event.target.files?.[0];

    // 갤러리에서 취소하면 change가 오지 않거나 파일이 비어 있다. 홈에 그대로 머문다.
    if (!selected) {
      return;
    }

    setFile(selected);

    // 같은 사진을 다시 골랐을 때도 change가 발생하도록 비워둔다.
    event.target.value = "";

    navigate({ to: ROUTE_PATHS.preparing });
  };

  return (
    <div className={styles.content}>
      <header className={styles.textArea}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
        <p className={styles.body}>
          최근 찍은 사진을 천천히 돌아보며
          <br />
          하나님께 감사하게 되는
          <br />한 장의 사진을 선택해 보세요.
        </p>
      </header>
      <div className={styles.ctaArea}>
        <Button aria-describedby="cta-caption" onClick={handleCtaClick}>
          일상 속 감사 찾기
        </Button>
        <p id="cta-caption" className={styles.ctaCaption}>
          선택 후 바로 공유되지 않습니다.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default HomePage;
