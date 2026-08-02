import { useState } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import ScreenBackground from "@/shared/ui/ScreenBackground";
import { getRandomBackgroundImageUrl, ROUTE_PATHS } from "@/shared/consts";
import { ExhibitDraftProvider } from "@/entities/exhibit";

const RootLayout = () => {
  const [backgroundImageUrl] = useState(getRandomBackgroundImageUrl);
  const { pathname } = useLocation();

  return (
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
  );
};

export default RootLayout;
