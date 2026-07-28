import { useNavigate, useSearch } from "@tanstack/react-router";
import Button from "@/shared/ui/Button";
import styles from "./ErrorPage.module.css";
import {
  DEFAULT_ERROR_MESSAGE,
  ERROR_TYPES,
  ROUTE_PATHS,
} from "@/shared/consts";
import { useBibleVerse } from "@/features/bible-verse/lib/use-bible-verse";

const ErrorPage = () => {
  const { book, chapter, verse, text } = useBibleVerse();

  const errorType = useSearch({
    from: "/error",
    select: (s) => s.type,
  });

  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate({ to: ROUTE_PATHS.home, replace: true });
  };

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
        <p className={styles.body}>
          {ERROR_TYPES[errorType as keyof typeof ERROR_TYPES]?.message ??
            DEFAULT_ERROR_MESSAGE}
          <br />
          다시 시도해주세요.
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

export default ErrorPage;
