import { ROUTE_PATHS } from "@/shared/consts";
import Button from "@/shared/ui/Button";
import { useNavigate } from "@tanstack/react-router";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate({ to: ROUTE_PATHS.preparing });
  };

  return (
    <div className={styles.content}>
      <div className={styles.textArea}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
        <p className={styles.body}>
          최근 찍은 사진을 천천히 돌아보며
          <br />
          하나님께 감사하게 되는
          <br />한 장의 사진을 선택해 보세요.
        </p>
      </div>
      <div className={styles.ctaArea}>
        <Button aria-describedby="cta-caption" onClick={handleCtaClick}>
          일상 속 감사 찾기
        </Button>
        <p id="cta-caption" className={styles.ctaCaption}>
          선택 후 바로 공유되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
