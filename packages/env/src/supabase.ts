import { assertPublishableKey } from "./assert-publishable-key";
import { sanitizeEnvValue } from "./sanitize-env-value";

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

let cached: SupabaseEnv | null = null;

/**
 * 세 앱(mobile-web / projector-web / admin-web)이 같은 Supabase 프로젝트를 바라보므로
 * 환경변수를 읽고 검증하는 곳을 여기 하나로 모은다.
 *
 * 값이 없는 상태에서 모듈만 import 해도 터지지 않도록 최초 호출 시점에 읽고,
 * 한 번 검증한 결과를 재사용한다.
 *
 * 참고: VITE_ 접두사가 붙은 값은 빌드 시점에 번들에 문자열로 박히므로,
 * 이 패키지로 옮긴다고 브라우저에서 값이 감춰지지는 않는다. anon 키는 원래
 * 공개되는 값이고 실제 접근 통제는 supabase/migrations 의 RLS가 담당한다.
 */
export const getSupabaseEnv = (): SupabaseEnv => {
  if (cached) {
    return cached;
  }

  const rawUrl = import.meta.env.VITE_SUPABASE_URL;
  const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!rawUrl || !rawAnonKey) {
    throw new Error(
      "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. 레포 루트의 .env 파일을 확인하세요.",
    );
  }

  // 이 두 값은 매 요청의 HTTP 헤더로 들어간다. 붙여넣기 사고로 줄바꿈이 섞이면
  // 첫 요청에서야 정체불명의 Headers 에러로 터지므로 여기서 미리 정리한다.
  const url = sanitizeEnvValue("VITE_SUPABASE_URL", rawUrl);
  const anonKey = sanitizeEnvValue("VITE_SUPABASE_ANON_KEY", rawAnonKey);

  // 비밀 키가 클라이언트 번들에 실려 나가는 사고를 여기서 막는다.
  assertPublishableKey(anonKey);

  cached = { url, anonKey };

  return cached;
};

/** 값이 채워져 있는지만 본다. 형식 검증은 하지 않는다. */
export const isSupabaseConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
