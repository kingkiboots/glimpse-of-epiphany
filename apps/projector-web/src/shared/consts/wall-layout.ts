/**
 * 사진 벽의 좌표계. 기획 전체는 앱 루트의 README.md 참고.
 *
 * 칸이 불규칙하게 흩어진 배치라 Flex/Grid로 재현할 수 없고, 대응할 화면도
 * 16:9 스크린 한 대뿐이라 좌표 테이블 + 절대 배치로 간다(CLAUDE.md의 예외 항목).
 * 여기 값은 전부 "벽 좌표계(px)"이고, 화면에 맞추는 축소는 위젯이 transform
 * scale 한 번으로 처리한다.
 */

/** 카드(사진) 크기. 디자인 확정값. */
export const CARD_WIDTH = 409;
export const CARD_HEIGHT = 371;
export const CARD_RADIUS = 10;

const COLUMN_COUNT = 4;
const COLUMN_GAP = 33;
const WALL_MARGIN = 126;

const COLUMN_X: readonly number[] = Array.from(
  { length: COLUMN_COUNT },
  (_, index) => WALL_MARGIN + index * (CARD_WIDTH + COLUMN_GAP),
);

export const WALL_WIDTH =
  WALL_MARGIN * 2 + COLUMN_COUNT * CARD_WIDTH + (COLUMN_COUNT - 1) * COLUMN_GAP;

/**
 * 한 벌(18칸)의 열 배정과 y좌표. 순번은 윗변이 높은 칸부터다.
 *
 * 디자인 시안(1440폭 캔버스, 카드 296×279)에서 읽은 좌표를 카드 확정 크기
 * (409×371)에 맞춰 축별로 환산한 값이다. 열 배치가 묶음마다 달라 규칙으로
 * 뽑아낼 수 없어 테이블로 둔다. 실제로 띄워 보고 어긋나면 이 표를 고친다.
 */
const PATTERN_COLUMNS: readonly number[] = [
  2, 1, 4, 3, 2, 1, 3, 4, 1, 2, 4, 3, 1, 2, 3, 4, 1, 2,
];
const PATTERN_Y: readonly number[] = [
  221, 411, 441, 691, 1100, 1231, 1324, 1512, 1925, 1997, 2174, 2351, 2491,
  2737, 3146, 3307, 3509, 3642,
];

const PATTERN_SIZE = PATTERN_COLUMNS.length;

/**
 * 칸 수를 18개보다 늘리면 이 패턴을 세로로 반복해 이어 붙인다.
 * 19번 칸은 1번 칸을 이 높이만큼 아래로 내린 자리다.
 */
const PATTERN_HEIGHT =
  PATTERN_Y[PATTERN_SIZE - 1] + CARD_HEIGHT - PATTERN_Y[0];

/** index는 0부터 시작하는 칸 번호다 (0 = 1번 칸). */
export const getSlotPosition = (index: number): { x: number; y: number } => {
  const cycle = Math.floor(index / PATTERN_SIZE);
  const withinCycle = index % PATTERN_SIZE;

  return {
    x: COLUMN_X[PATTERN_COLUMNS[withinCycle] - 1],
    y: PATTERN_Y[withinCycle] + cycle * PATTERN_HEIGHT,
  };
};

/**
 * 화면 한 판에 해당하는 벽 기준 높이. 첫 묶음(1~8번 칸)이 정확히 화면에 차도록
 * 8번 칸의 아랫변으로 잡는다. 위젯은 이 높이가 실제 화면 높이가 되도록 벽을
 * 축소한다 — "8칸까지는 슬라이딩하지 않는다"는 규칙이 여기서 성립한다.
 */
export const WALL_VIEWPORT_HEIGHT = PATTERN_Y[7] + CARD_HEIGHT;

/**
 * 슬라이딩 정지 지점은 칸 단위가 아니라 묶음 단위로 끊긴다(9~12칸 → A,
 * 13~16칸 → B, 17~18칸 → 끝). 어긋난 격자라 묶음 중간에서 멈추면 잘린 것처럼
 * 보이기 때문이다. 첫 묶음(0~7)의 끝이 정확히 화면 한 판 높이와 같아서,
 * "8칸까지는 움직이지 않는다"도 같은 식 하나로 계산된다.
 */
const GROUP_END_INDICES: readonly number[] = [7, 11, 15, 17];

/**
 * 채워진 마지막 칸이 화면 바닥에 닿을 때까지 내려가야 하는 거리(벽 좌표계 px).
 * 0이면 슬라이딩하지 않는다.
 */
export const getScrollDistance = (maxOccupiedIndex: number): number => {
  if (maxOccupiedIndex < 0) {
    return 0;
  }

  const cycle = Math.floor(maxOccupiedIndex / PATTERN_SIZE);
  const withinCycle = maxOccupiedIndex % PATTERN_SIZE;
  const groupEnd =
    GROUP_END_INDICES.find((end) => withinCycle <= end) ?? PATTERN_SIZE - 1;
  const stop = getSlotPosition(cycle * PATTERN_SIZE + groupEnd);

  return Math.max(0, stop.y + CARD_HEIGHT - WALL_VIEWPORT_HEIGHT);
};
