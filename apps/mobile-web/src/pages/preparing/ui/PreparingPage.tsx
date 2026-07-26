import Typography from "@/shared/ui/Typography";
import styles from "./PreparingPage.module.css";
import { useState } from "react";
import { getRandomBibleVerse } from "@/features/bible-verse/consts";
import Spinner from "@/shared/ui/Spinner";

const PreparingPage = () => {
  const [bibleVerse] = useState(getRandomBibleVerse);
  const { book, chapter, verse, text } = bibleVerse;
  return (
    <div className={styles.container}>
      <div className={styles.textArea}>
        <Typography as={"h1"} variant="title">
          일상 속 감사 찾기
        </Typography>
      </div>
      <Spinner size={48} />
      <div className={styles.bibleVerseArea}>
        <Typography as={"p"} variant="caption">
          {book} {chapter}:{verse}
        </Typography>
        <Typography
          as={"p"}
          variant="caption"
          className={styles.bibleVerseContent}
        >
          {text}
        </Typography>
      </div>
    </div>
  );
};

export default PreparingPage;
