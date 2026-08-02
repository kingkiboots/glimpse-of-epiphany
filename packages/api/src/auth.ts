import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";

/** 앱이 supabase-js를 직접 import 하지 않아도 되도록 재노출한다. */
export type { Session };

/**
 * 관리자 인증. 대시보드에서 만든 계정 하나만 사용하며 회원가입 경로는 열지 않는다.
 * exhibits 삭제 권한은 RLS에서 authenticated 롤에만 열려 있다.
 */
export const signInAdmin = async (
  email: string,
  password: string,
): Promise<Session> => {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `로그인에 실패했습니다: ${error?.message ?? "세션을 받지 못했습니다"}`,
    );
  }

  return data.session;
};

export const signOutAdmin = async (): Promise<void> => {
  const { error } = await getSupabaseClient().auth.signOut();

  if (error) {
    throw new Error(`로그아웃에 실패했습니다: ${error.message}`);
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await getSupabaseClient().auth.getSession();

  return data.session;
};

/**
 * 로그인 상태 변화를 구독한다. 반환된 함수를 호출해 구독을 해제한다.
 * 토큰 자동 갱신·다른 탭에서의 로그아웃까지 함께 반영된다.
 */
export const subscribeToAuthState = (
  onChange: (session: Session | null) => void,
): (() => void) => {
  const { data } = getSupabaseClient().auth.onAuthStateChange(
    (_event, session) => onChange(session),
  );

  return () => data.subscription.unsubscribe();
};
