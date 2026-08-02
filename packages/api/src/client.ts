import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@packages/env";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Supabase 클라이언트 싱글턴.
 * 환경변수가 없는 상태에서 모듈만 import 해도 터지지 않도록 최초 호출 시점에 생성한다.
 * 환경변수를 읽고 검증하는 일은 @packages/env 가 맡는다.
 */
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (client) {
    return client;
  }

  const { url, anonKey } = getSupabaseEnv();

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
