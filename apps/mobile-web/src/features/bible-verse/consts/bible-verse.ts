type BibleVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export const BIBLE_VERSES: BibleVerse[] = [
  {
    book: "에베소서",
    chapter: 5,
    verse: 20,
    text: "범사에 우리 주 예수 그리스도의 이름으로 항상 아버지 하나님께 감사하며",
  },
  {
    book: "골로새서",
    chapter: 3,
    verse: 17,
    text: `또 무엇을 하든지 말에나 일에나\n다 주 예수의 이름으로 하고\n그를 힘입어 하나님 아버지께 감사하라.`,
  },
  {
    book: "시편",
    chapter: 100,
    verse: 4,
    text: `감사함으로 그의 문에 들어가며\n찬송함으로 그의 궁정에 들어가서\n그에게 감사하며 그의 이름을 송축할지어다.`,
  },
  {
    book: "시편",
    chapter: 136,
    verse: 1,
    text: `여호와께 감사하라\n그는 선하시며 그 인자하심이 영원함이로다.`,
  },
  {
    book: "데살로니가전서",
    chapter: 5,
    verse: 18,
    text: `범사에 감사하라\n이것이 그리스도 예수 안에서\n너희를 향하신 하나님의 뜻이니라.`,
  },
  {
    book: "골로새서",
    chapter: 4,
    verse: 2,
    text: `기도를 계속하고\n기도에 감사함으로 깨어 있으라.`,
  },
];

export const getRandomBibleVerse = (): BibleVerse => {
  const bibleVerse =
    BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
  return bibleVerse;
};
