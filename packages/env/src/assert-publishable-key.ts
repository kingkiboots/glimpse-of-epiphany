/**
 * VITE_ 접두사가 붙은 값은 번들에 문자열로 박혀 누구나 볼 수 있다.
 * 여기에 service_role 키가 들어가면 앱은 정상 동작하는 것처럼 보이면서
 * RLS가 통째로 우회되어 아무나 전체 데이터를 읽고 지울 수 있게 된다.
 *
 * 조용히 망가지는 대신 즉시 터지도록, 클라이언트를 만들기 전에 키 종류를 검사한다.
 */

const SECRET_KEY_MESSAGE = [
  "VITE_SUPABASE_ANON_KEY에 비밀 키(service_role / sb_secret_)가 들어 있습니다.",
  "이 값은 클라이언트 번들에 그대로 노출되며 RLS를 우회합니다.",
  "Supabase 대시보드 > 프로젝트 설정 > API Keys 에서 anon(publishable) 키로 교체하세요.",
].join(" ");

/** JWT payload를 디코딩한다. 형식이 아니거나 실패하면 null. */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    // 디코딩에 실패했다면 판단할 근거가 없으므로 통과시킨다.
    return null;
  }
};

export const assertPublishableKey = (key: string): void => {
  // 신형 키 포맷
  if (key.startsWith("sb_secret_")) {
    throw new Error(SECRET_KEY_MESSAGE);
  }

  // 구형(JWT) 키 포맷
  const payload = decodeJwtPayload(key);

  if (payload?.role === "service_role") {
    throw new Error(SECRET_KEY_MESSAGE);
  }
};
