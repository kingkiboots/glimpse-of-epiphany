import { useState } from "react";
import { getRandomBibleVerse } from "../consts";

export const useBibleVerse = () => {
  const [bibleVerse] = useState(getRandomBibleVerse);
  return bibleVerse;
};
