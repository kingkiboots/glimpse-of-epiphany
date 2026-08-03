import { createContext, useContext } from "react";

/**
 * 이번 세션에서 사용 중인 배경 이미지 URL.
 * 저장용 이미지를 만들 때 화면과 같은 배경을 써야 하므로 밖으로 노출한다.
 */
export const ScreenBackgroundContext = createContext<string | null>(null);

export const useScreenBackgroundUrl = (): string => {
  const url = useContext(ScreenBackgroundContext);

  if (!url) {
    throw new Error(
      "useScreenBackgroundUrl은 ScreenBackgroundContext.Provider 안에서만 사용할 수 있습니다.",
    );
  }

  return url;
};
