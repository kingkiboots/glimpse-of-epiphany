export const BACKGROUND_IMAGES = [
  "감성.webp",
  "공통.webp",
  "날씨.webp",
  "연인.webp",
  "자연.webp",
  "친구.webp",
] as const;

export const getRandomBackgroundImageUrl = () => {
  const file =
    BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
  return `/img/${encodeURIComponent(file)}`;
};
