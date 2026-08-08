/**
 * 사진 벽의 좌표계. 기획 전체는 앱 루트의 README.md 참고.
 *
 * 칸이 불규칙하게 흩어진 배치라 Flex/Grid로 재현할 수 없고, 대응할 화면도
 * 16:9 스크린 한 대뿐이라 좌표 테이블 + 절대 배치로 간다(CLAUDE.md의 예외 항목).
 * 여기 값은 전부 "벽 좌표계(px)"이고, 화면에 맞추는 축소는 위젯이 transform
 * scale 한 번으로 처리한다.
 *
 * 컬럼 간격과 방향이 현장 설정이 되면서 좌표는 상수가 아니라
 * createWallLayout()이 설정값으로 계산한다. 스크롤 방향과 무관하게 좌표 생성은
 * "주축(main, 흐르는 축)·교차축(cross, 컬럼이 놓이는 축)"으로 계산한 뒤 마지막에
 * x/y로 바꾼다 — 가로 방향은 세로 배치를 눕힌 것이다.
 */

/** 카드(사진) 크기. 디자인 확정값. 방향이 바뀌어도 카드 자체는 눕지 않는다. */
export const CARD_WIDTH = 409;
export const CARD_HEIGHT = 371;
export const CARD_RADIUS = 10;

/** 교차축 양끝 여백. 디자인 확정값. */
const WALL_MARGIN = 126;

/** 대응 화면은 16:9 한 대뿐이다(README "화면 배치"). 가로 방향의 화면 한 판 계산에 쓴다. */
const SCREEN_ASPECT = 16 / 9;

const COLUMN_COUNT = 4;

/**
 * 한 벌(18칸)의 컬럼 배정과 주축 좌표. 순번은 주축 윗변이 높은 칸부터이고,
 * 주축 값은 카드 주축 크기가 371(세로 기준)일 때의 좌표다.
 *
 * 디자인 시안(1440폭 캔버스, 카드 296×279)에서 읽은 좌표를 카드 확정 크기
 * (409×371)에 맞춰 환산한 값이다. 컬럼 배치가 묶음마다 달라 규칙으로 뽑아낼 수
 * 없어 테이블로 둔다. 실제로 띄워 보고 어긋나면 이 표를 고친다.
 */
const PATTERN_COLUMNS: readonly number[] = [
  2, 1, 4, 3, 2, 1, 3, 4, 1, 2, 4, 3, 1, 2, 3, 4, 1, 2,
];
const PATTERN_MAIN: readonly number[] = [
  221, 411, 441, 691, 1100, 1231, 1324, 1512, 1925, 1997, 2174, 2351, 2491,
  2737, 3146, 3307, 3509, 3642,
];

const PATTERN_SIZE = PATTERN_COLUMNS.length;

/**
 * 칸 수를 18개보다 늘리면 이 패턴을 주축으로 반복해 이어 붙인다.
 * 19번 칸은 1번 칸을 이 길이만큼 뒤로 민 자리다.
 */
const PATTERN_PERIOD =
  PATTERN_MAIN[PATTERN_SIZE - 1] + CARD_HEIGHT - PATTERN_MAIN[0];

/**
 * 처음 줄이 다시 이어 붙는 지점은 칸 단위가 아니라 묶음 단위로 끊긴다
 * (9~12칸 → A, 13~16칸 → B, 17~18칸 → 끝). 어긋난 격자라 묶음 중간에서
 * 잘라 붙이면 격자가 어색하게 섞여 보이기 때문이다. 첫 묶음(0~7)의 끝이
 * 정확히 화면 한 판 길이와 같아서, "8칸까지는 움직이지 않는다"도 같은 식
 * 하나로 계산된다.
 */
const GROUP_END_INDICES: readonly number[] = [7, 11, 15, 17];

/**
 * 화면 한 판에 해당하는 주축 길이(세로 기준). 첫 두 묶음(1~8번 칸)이 정확히
 * 화면에 차도록 8번 칸의 아랫변으로 잡는다 — "8칸까지는 슬라이딩하지 않는다"는
 * 규칙이 여기서 성립한다.
 */
const VIEWPORT_MAIN = PATTERN_MAIN[7] + CARD_HEIGHT;

export type WallLayoutOptions = {
  /** 컬럼 사이 간격 (벽 좌표계 px) */
  columnGap: number;
  /** true면 벽을 눕혀 주축이 x가 된다 (왼쪽·오른쪽 방향) */
  horizontal: boolean;
};

export type WallLayout = {
  horizontal: boolean;
  /** 교차축 벽 크기. 세로 스크롤이면 벽 폭, 가로 스크롤이면 벽 높이. */
  crossExtent: number;
  /** 화면 한 판에 해당하는 주축 길이(벽 좌표계 px). 순환 복제 스트립의 간격 계산에도 쓴다. */
  viewportMain: number;
  /** index는 0부터 시작하는 칸 번호다 (0 = 1번 칸). */
  getSlotPosition: (index: number) => { x: number; y: number };
  /**
   * 채워진 마지막 묶음이 화면 끝에 닿을 때까지 흘러갈 거리(벽 좌표계 px).
   * 순환 스크롤은 이 지점 뒤에 복제 스트립을 이어 붙인다. 0이면 슬라이딩하지 않는다.
   */
  getScrollDistance: (maxOccupiedIndex: number) => number;
};

export const createWallLayout = ({
  columnGap,
  horizontal,
}: WallLayoutOptions): WallLayout => {
  // 패턴 주축 좌표는 카드 주축 크기 371(세로 기준)로 적혀 있다. 가로로 눕히면
  // 주축 카드 크기가 409가 되므로 그 비율로 늘려 리듬을 유지한다.
  const mainScale = horizontal ? CARD_WIDTH / CARD_HEIGHT : 1;
  const toMain = (raw: number) => Math.round(raw * mainScale);

  // 컬럼이 놓이는 축의 카드 크기도 눕으면 바뀐다(폭 409 → 높이 371).
  const crossCard = horizontal ? CARD_HEIGHT : CARD_WIDTH;
  const crossExtent =
    WALL_MARGIN * 2 + COLUMN_COUNT * crossCard + (COLUMN_COUNT - 1) * columnGap;
  const crossOf = (column: number) =>
    WALL_MARGIN + (column - 1) * (crossCard + columnGap);

  // 세로는 디자인 확정값(8칸 한 판). 가로는 벽 높이가 화면 높이에 맞춰
  // 축소됐을 때 16:9 화면에 실제로 보이는 주축 길이다.
  const viewportMain = horizontal
    ? Math.ceil(crossExtent * SCREEN_ASPECT)
    : VIEWPORT_MAIN;

  const getSlotPosition = (index: number): { x: number; y: number } => {
    const cycle = Math.floor(index / PATTERN_SIZE);
    const withinCycle = index % PATTERN_SIZE;
    const main = toMain(PATTERN_MAIN[withinCycle] + cycle * PATTERN_PERIOD);
    const cross = crossOf(PATTERN_COLUMNS[withinCycle]);

    return horizontal ? { x: main, y: cross } : { x: cross, y: main };
  };

  const getScrollDistance = (maxOccupiedIndex: number): number => {
    if (maxOccupiedIndex < 0) {
      return 0;
    }

    const cycle = Math.floor(maxOccupiedIndex / PATTERN_SIZE);
    const withinCycle = maxOccupiedIndex % PATTERN_SIZE;
    const groupEnd =
      GROUP_END_INDICES.find((end) => withinCycle <= end) ?? PATTERN_SIZE - 1;
    const stopMain =
      PATTERN_MAIN[groupEnd] + cycle * PATTERN_PERIOD + CARD_HEIGHT;

    return Math.max(0, toMain(stopMain) - viewportMain);
  };

  return {
    horizontal,
    crossExtent,
    viewportMain,
    getSlotPosition,
    getScrollDistance,
  };
};
