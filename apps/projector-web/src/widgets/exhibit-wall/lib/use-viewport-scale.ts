import { useEffect, useState } from "react";
import { WALL_VIEWPORT_HEIGHT } from "@/shared/consts";

const getScale = () => window.innerHeight / WALL_VIEWPORT_HEIGHT;

/**
 * 벽 좌표계를 실제 화면에 맞추는 축소 비율.
 *
 * 세로(높이)에만 맞춘다 — 벽의 화면 한 판 높이가 실제 화면 높이가 되도록.
 * 가로는 그 결과로 따라오고, 16:9 화면에서는 좌우에 검은 여백이 남는다(의도).
 */
export const useViewportScale = (): number => {
  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    const handleResize = () => setScale(getScale());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return scale;
};
