import { useState } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import ScreenBackground from "@/shared/ui/ScreenBackground";
import { getRandomBackgroundImageUrl, ROUTE_PATHS } from "@/shared/consts";
import { ExhibitDraftProvider } from "@/entities/exhibit";
import { ScreenBackgroundContext } from "@/shared/lib/screen-background";

const RootLayout = () => {
  const [backgroundImageUrl] = useState(getRandomBackgroundImageUrl);
  const { pathname } = useLocation();

  return (
    // 저장용 이미지를 화면과 같은 배경으로 합성해야 하므로 아래 화면들이 읽을 수 있게 한다.
    <ScreenBackgroundContext.Provider value={backgroundImageUrl}>
      <ScreenBackground
        backgroundImageUrl={backgroundImageUrl}
        scrim={pathname !== ROUTE_PATHS.home}
      >
        {/* display: contents로 레이아웃엔 관여하지 않고 접근성 트리에만 본문 랜드마크를 추가 */}
        <main style={{ display: "contents" }}>
          {/* 작성 중인 사진·메시지를 라우트 전환 사이에 유지하기 위해 Outlet 바깥에 둔다 */}
          <ExhibitDraftProvider>
            <Outlet />
          </ExhibitDraftProvider>
        </main>
      </ScreenBackground>
    </ScreenBackgroundContext.Provider>
  );
};

export default RootLayout;
