import Typography from "@/shared/ui/Typography";
import styles from "./PreparingPage.module.css";
import { useState } from "react";
import Spinner from "@/shared/ui/Spinner";

const PreparingPage = () => {
  const [bibleVerse] = useState({
    book: "에베소서",
    chapter: 5,
    verse: 20,
    text: "범사에 우리 주 예수 그리스도의 이름으로 항상 아버지 하나님께 감사하며",
  });
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
