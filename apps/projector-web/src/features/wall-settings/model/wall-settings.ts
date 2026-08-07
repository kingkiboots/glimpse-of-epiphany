export type WallSettings = {
  /** 사진 칸 수. 18칸 패턴을 세로로 반복해 늘린다. */
  slotCount: number;
  /** 슬라이드 속도 (벽 좌표계 px/s) */
  speed: number;
};

/**
 * 입력 범위. UI(range)와 저장값 검증이 같은 값을 쓴다.
 * slotCount 상한은 초기 로드 장수(INITIAL_FETCH_LIMIT = 100)를 넘지 않게 잡았다.
 */
export const SETTING_BOUNDS = {
  slotCount: { min: 6, max: 72, step: 1 },
  speed: { min: 20, max: 200, step: 10 },
} as const;

const STORAGE_KEY = "projector-wall-settings";

const DEFAULT_SETTINGS: WallSettings = { slotCount: 18, speed: 60 };

const sanitize = (
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

export const loadSettings = (): WallSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<WallSettings>;

    return {
      slotCount: sanitize(
        parsed.slotCount,
        SETTING_BOUNDS.slotCount,
        DEFAULT_SETTINGS.slotCount,
      ),
      speed: sanitize(parsed.speed, SETTING_BOUNDS.speed, DEFAULT_SETTINGS.speed),
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
