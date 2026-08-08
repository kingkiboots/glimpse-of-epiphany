import { useCallback, useEffect, useState } from "react";
import type { WallLayout } from "@/shared/consts";

/**
 * 벽 좌표계를 실제 화면에 맞추는 축소 비율.
 *
 * 세로 스크롤: 화면 한 판 높이(주축)에 맞춘다 — 컬럼 수가 바뀌어도 카드가
 * 보이는 크기가 흔들리지 않는다. 다만 컬럼·간격을 키워 벽이 화면보다 넓어지면
 * 좌우가 잘리지 않도록 폭 기준으로 한 번 더 줄인다.
 *
 * 가로 스크롤: 벽 높이(교차축)를 화면 높이에 맞춘다. 주축은 그 결과로 따라오고
 * 화면 밖으로 흘러 나간다(스크롤 대상).
 */
export const useViewportScale = (layout: WallLayout): number => {
  const getScale = useCallback(
    () =>
      layout.horizontal
        ? window.innerHeight / layout.crossExtent
        : Math.min(
            window.innerHeight / layout.viewportMain,
            window.innerWidth / layout.crossExtent,
          ),
    [layout],
  );

  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    const handleResize = () => setScale(getScale());

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getScale]);

  return scale;
};
