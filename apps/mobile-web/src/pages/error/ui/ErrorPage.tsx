import { useBibleVerse } from "@/features/bible-verse";
import {
  DEFAULT_ERROR_MESSAGE,
  ERROR_TYPES,
  ROUTE_PATHS,
} from "@/shared/consts";
import Button from "@/shared/ui/Button";
import PageShell from "@/shared/ui/PageShell";
import { useNavigate, useSearch } from "@tanstack/react-router";
import styles from "./ErrorPage.module.css";

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
    <PageShell
      className={styles.shell}
      footerPlacement="flow"
      footerClassName={styles.footer}
      footer={
        <>
          <div className={styles.ctaArea}>
            <Button onClick={handleCtaClick}>처음으로</Button>
          </div>
          <div className={styles.verse}>
            <p className={styles.verseReference}>
              {book} {chapter}:{verse}
            </p>
            <p className={styles.verseText}>{text}</p>
          </div>
        </>
      }
    >
      <p className={styles.description}>
        {ERROR_TYPES[errorType as keyof typeof ERROR_TYPES]?.message ??
          DEFAULT_ERROR_MESSAGE}
        <br />
        다시 시도해주세요.
      </p>
    </PageShell>
  );
};

export default ErrorPage;
