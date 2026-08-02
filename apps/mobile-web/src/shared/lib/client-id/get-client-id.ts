import { randomUuid } from "@packages/utils";

const STORAGE_KEY = "glimpse-of-epiphany:client-id";

let cached: string | null = null;

/**
 * 이 기기를 구분하는 임의 UUID. 한 사람이 반복해서 올릴 때 운영자가
 * 기기 단위로 정리할 수 있게 하는 용도이며, 개인을 식별하지는 않는다.
 *
 * localStorage를 쓸 수 없는 환경(시크릿 모드 등)에서는 이번 세션에서만
 * 유효한 값을 쓴다. 값을 못 만들어서 업로드가 막히는 일은 없어야 한다.
 */
export const getClientId = (): string => {
  if (cached) {
    return cached;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      cached = stored;
      return cached;
    }

    const created = randomUuid();
    localStorage.setItem(STORAGE_KEY, created);
    cached = created;

    return cached;
  } catch {
    cached = randomUuid();

    return cached;
  }
};
