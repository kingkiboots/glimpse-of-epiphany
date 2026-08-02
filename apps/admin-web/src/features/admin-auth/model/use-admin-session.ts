import { useCallback, useEffect, useState } from "react";
import {
  getCurrentSession,
  signOutAdmin,
  subscribeToAuthState,
  type Session,
} from "@packages/api";

/**
 * 관리자 로그인 상태. 새로고침해도 유지되며 다른 탭에서의 로그아웃도 따라온다.
 * 세션이 준비되기 전에 로그인 화면을 깜빡이지 않도록 isReady를 함께 돌려준다.
 */
export const useAdminSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    void getCurrentSession()
      .then((current) => {
        if (active) {
          setSession(current);
          setIsReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setIsReady(true);
        }
      });

    const unsubscribe = subscribeToAuthState((next) => {
      setSession(next);
      setIsReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin();
  }, []);

  return { session, isReady, signOut };
};
