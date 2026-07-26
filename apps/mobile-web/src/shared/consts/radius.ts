// liquid-glass-react의 cornerRadius prop은 숫자만 받아 CSS 변수를 그대로 쓸 수 없다.
// app/styles/global.css의 --radius-* 값과 항상 동일하게 유지할 것.
export const RADIUS = {
  panel: 20,
  pill: 40,
  image: 10,
  container: 40,
} as const;
