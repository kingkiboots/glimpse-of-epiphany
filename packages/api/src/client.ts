import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertPublishableKey } from "./assert-publishable-key";
import { sanitizeEnvValue } from "./sanitize-env-value";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Supabase 클라이언트 싱글턴.
 * 환경변수가 없는 상태에서 모듈만 import 해도 터지지 않도록 최초 호출 시점에 생성한다.
 */
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (client) {
    return client;
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

  client = createClient<Database>(url, anonKey, {
    auth: {
      // admin-web이 로그인 상태를 새로고침 후에도 유지해야 한다.
      // 참가자·프로젝터는 로그인하지 않으므로 저장될 세션 자체가 없다.
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
};

export const isSupabaseConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
