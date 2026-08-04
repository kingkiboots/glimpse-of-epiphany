import { useBibleVerse } from "@/features/bible-verse/lib/use-bible-verse";
import { ROUTE_PATHS } from "@/shared/consts";
import Button from "@/shared/ui/Button";
import { useNavigate } from "@tanstack/react-router";
import { EXHIBIT_TTL_HOURS } from "@packages/api";
import styles from "./CompletePage.module.css";

const CompletePage = () => {
  const { book, chapter, verse, text } = useBibleVerse();

  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate({ to: ROUTE_PATHS.home });
  };

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
        <p className={styles.body}>
          이미지 업로드에 성공했어요.
          <br />
          {EXHIBIT_TTL_HOURS}시간 뒤에는 사라지니, 간직하고 싶다면 미리보기
          화면에서 저장해 두세요.
        </p>
      </header>
      <div className={styles.ctaArea}>
        <Button onClick={handleCtaClick}>처음으로</Button>
      </div>
      <div className={styles.verse}>
        <p className={styles.verseReference}>
          {book} {chapter}:{verse}
        </p>
        <p className={styles.verseText}>{text}</p>
      </div>
    </div>
  );
};

export default CompletePage;
