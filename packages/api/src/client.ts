import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertPublishableKey } from "./assert-publishable-key";
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

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. 앱의 .env 파일을 확인하세요.",
    );
  }

  // 비밀 키가 클라이언트 번들에 실려 나가는 사고를 여기서 막는다.
  assertPublishableKey(anonKey);

  client = createClient<Database>(url, anonKey, {
    auth: {
      // 익명 접근만 사용하므로 세션을 저장하지 않는다.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
};

export const isSupabaseConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
