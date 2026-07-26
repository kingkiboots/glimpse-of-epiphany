import { useState } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import ScreenBackground from "@/shared/ui/ScreenBackground";
import { getRandomBackgroundImageUrl, ROUTE_PATHS } from "@/shared/consts";

const RootLayout = () => {
  const [backgroundImageUrl] = useState(getRandomBackgroundImageUrl);
  const { pathname } = useLocation();

  return (
    <ScreenBackground
      backgroundImageUrl={backgroundImageUrl}
      scrim={pathname !== ROUTE_PATHS.home}
    >
      <Outlet />
    </ScreenBackground>
  );
};

export default RootLayout;
