/** 사진이 흘러가는 방향. up이 기본(디자인 시안 기준)이다. */
export type WallDirection = "up" | "down" | "left" | "right";

export type WallSettings = {
  /** 사진 칸 수. 기본 패턴을 스크롤 방향으로 반복해 늘린다. */
  slotCount: number;
  /** 슬라이드 속도 (벽 좌표계 px/s) */
  speed: number;
  /** 컬럼 사이 간격 (벽 좌표계 px) */
  columnGap: number;
  /** 사진이 흘러가는 방향 */
  direction: WallDirection;
};

/**
 * 입력 범위. UI(range)와 저장값 검증이 같은 값을 쓴다.
 * slotCount 상한은 초기 로드 장수(INITIAL_FETCH_LIMIT = 100)를 넘지 않게 잡았다.
 */
export const SETTING_BOUNDS = {
  slotCount: { min: 6, max: 72, step: 1 },
  speed: { min: 20, max: 200, step: 10 },
  columnGap: { min: 0, max: 150, step: 1 },
} as const;

export const DIRECTION_OPTIONS: { value: WallDirection; label: string }[] = [
  { value: "up", label: "위로 (기본)" },
  { value: "down", label: "아래로" },
  { value: "left", label: "왼쪽으로" },
  { value: "right", label: "오른쪽으로" },
];

const STORAGE_KEY = "projector-wall-settings";

const DEFAULT_SETTINGS: WallSettings = {
  slotCount: 18,
  speed: 60,
  columnGap: 33,
  direction: "up",
};

const sanitizeNumber = (
  value: unknown,
  bounds: { min: number; max: number },
  fallback: number,
): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(bounds.max, Math.max(bounds.min, Math.round(parsed)));
};

const sanitizeDirection = (value: unknown): WallDirection =>
  DIRECTION_OPTIONS.some((option) => option.value === value)
    ? (value as WallDirection)
    : DEFAULT_SETTINGS.direction;

export const loadSettings = (): WallSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<WallSettings>;

    return {
      slotCount: sanitizeNumber(
        parsed.slotCount,
        SETTING_BOUNDS.slotCount,
        DEFAULT_SETTINGS.slotCount,
      ),
      speed: sanitizeNumber(
        parsed.speed,
        SETTING_BOUNDS.speed,
        DEFAULT_SETTINGS.speed,
      ),
      columnGap: sanitizeNumber(
        parsed.columnGap,
        SETTING_BOUNDS.columnGap,
        DEFAULT_SETTINGS.columnGap,
      ),
      direction: sanitizeDirection(parsed.direction),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: WallSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 저장이 안 되면 새로고침 때 기본값으로 돌아갈 뿐이다. 화면을 막지 않는다.
  }
};
