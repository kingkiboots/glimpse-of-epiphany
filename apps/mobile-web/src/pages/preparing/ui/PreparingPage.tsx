import { getRandomBibleVerse } from "@/features/bible-verse/consts";
import Spinner from "@/shared/ui/Spinner";
import { useEffect, useState } from "react";
import styles from "./PreparingPage.module.css";
import { useNavigate } from "@tanstack/react-router";
import { ROUTE_PATHS } from "@/shared/consts";

const PreparingPage = () => {
  const [bibleVerse] = useState(getRandomBibleVerse);
  const { book, chapter, verse, text } = bibleVerse;

  const navigate = useNavigate();

  /**
   * 5초는 조금 짧을 수도 있으니깐 3초 뒤 __skip->__ 버튼이 뜨게 하는건 어떨까? 
   */
  useEffect(() => {
    setTimeout(() => {
      navigate({ to: ROUTE_PATHS.compose, replace: true });
    }, 5000);
  }, []);

  return (
    <div className={styles.content}>
      <header >
        <h1 className={styles.title}>일상 속 감사 찾기</h1>
      </header>
      <div className={styles.loading}>
        <Spinner size={48} />
        <span className={styles.loadingLabel}>Loading...</span>
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

export default PreparingPage;
