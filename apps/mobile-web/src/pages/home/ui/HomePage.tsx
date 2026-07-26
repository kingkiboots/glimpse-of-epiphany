import Typography from "@/shared/ui/Typography";
import styles from "./HomePage.module.css";
import Button from "@/shared/ui/Button";

const HomePage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.textArea}>
        <Typography as={"h1"} variant="title">
          일상 속 감사 찾기
        </Typography>
        <Typography as={"p"} variant="body">
          최근 찍은 사진을 천천히 돌아보며
          <br />
          하나님께 감사하게 되는
          <br />한 장의 사진을 선택해 보세요.
        </Typography>
      </div>
      <div className={styles.ctaArea}>
        <Button aria-describedby="cta-caption">일상 속 감사 찾기</Button>
        <Typography
          as={"p"}
          variant="caption"
          id="cta-caption"
          className={styles.ctaCaption}
        >
          선택 후 바로 공유되지 않습니다.
        </Typography>
      </div>
    </div>
  );
};

export default HomePage;
