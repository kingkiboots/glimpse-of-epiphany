// liquid-glass-react 튜닝 값도 cornerRadius와 마찬가지로 숫자 prop이라 CSS 변수를 못 쓴다.
// 모든 유리 표면(Panel)이 이 프로필 하나를 공유해서 통일된 "리퀴드 글래스" 느낌을 유지한다.
export const GLASS_EFFECT = {
  displacementScale: 100,
  blurAmount: 0.5,
  saturation: 140,
  aberrationIntensity: 2,
  elasticity: 0.0,
  overLight: true,
} as const;
