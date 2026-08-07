import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/** 정지 지점(아래끝·맨위)에서 머무는 시간(초) */
const HOLD_SECONDS = 3;

type WallScrollOptions = {
  /** 벽 좌표계 기준 내려갈 거리(px). 0 이하면 움직이지 않는다. */
  distance: number;
  /** 벽 좌표계 기준 속도(px/s) */
  speed: number;
};

/**
 * 벽 스트립을 위아래로 왕복시키는 루프.
 *
 * distance가 바뀌어도(사진이 늘어 정지 구간이 내려갔을 때) 처음부터 다시 시작하지
 * 않고 현재 위치에서 새 목표를 향해 이어 간다. 목표까지 간 뒤에는
 * 맨위 ↔ 아래끝 왕복을 무한 반복한다.
 *
 * 이전 루프는 revert가 아니라 kill로 정리한다. revert는 y를 원래 값으로 되돌려
 * 관객이 보는 화면이 그 순간 맨 위로 튄다.
 */
export const useWallScroll = (
  stripRef: RefObject<HTMLDivElement | null>,
  { distance, speed }: WallScrollOptions,
) => {
  const animationsRef = useRef<(gsap.core.Tween | gsap.core.Timeline)[]>([]);

  useGSAP(
    (_, contextSafe) => {
      const strip = stripRef.current;

      if (!strip || !contextSafe) {
        return;
      }

      animationsRef.current.forEach((animation) => animation.kill());
      animationsRef.current = [];

      // 8칸 이하로 돌아온 경우(운영자 삭제 등). 부드럽게 맨 위로 복귀만 한다.
      if (distance <= 0 || speed <= 0) {
        animationsRef.current.push(
          gsap.to(strip, { y: 0, duration: 0.8, ease: "power2.out" }),
        );
        return;
      }

      const travelSeconds = distance / speed;

      // 비동기 콜백에서 만드는 트윈도 useGSAP 컨텍스트가 추적하도록 감싼다.
      const startLoop = contextSafe(() => {
        animationsRef.current.push(
          gsap
            .timeline({
              repeat: -1,
              delay: HOLD_SECONDS,
              repeatDelay: HOLD_SECONDS,
            })
            .to(strip, { y: 0, duration: travelSeconds, ease: "none" })
            .to(
              strip,
              { y: -distance, duration: travelSeconds, ease: "none" },
              `+=${HOLD_SECONDS}`,
            ),
        );
      });

      const currentY = Number(gsap.getProperty(strip, "y"));

      animationsRef.current.push(
        gsap.to(strip, {
          y: -distance,
          duration: Math.abs(-distance - currentY) / speed,
          ease: "none",
          delay: HOLD_SECONDS,
          onComplete: startLoop,
        }),
      );
    },
    { dependencies: [distance, speed] },
  );
};
