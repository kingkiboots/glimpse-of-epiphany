import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { WALL_VIEWPORT_HEIGHT } from "@/shared/consts";

type WallScrollOptions = {
  /** 벽 좌표계 기준, 처음 줄이 이어 붙기까지 내려갈 거리(px). 0 이하면 움직이지 않는다. */
  distance: number;
  /** 벽 좌표계 기준 속도(px/s) */
  speed: number;
};

/**
 * 벽 스트립을 멈춤 없이 한 방향으로 흘리는 순환 루프.
 *
 * 위젯이 스트립을 distance + 화면 한 판만큼 아래에 한 벌 더 그려 두므로,
 * 마지막 줄 아래에서 처음 줄이 올라온다. 복제 한 판이 화면에 꽉 찬 순간 y를
 * 0으로 되돌린다 — 그 프레임이 직전 프레임과 똑같아서 관객에게는 끊김이
 * 보이지 않는다.
 *
 * distance가 바뀌어도(사진이 늘어 순환 구간이 길어졌을 때) 처음부터 다시
 * 시작하지 않고 현재 위치에서 이어 간다.
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

      // 한 바퀴 = 맨 위(0)부터 복제 한 판이 화면에 꽉 차는 지점까지.
      const loopHeight = distance + WALL_VIEWPORT_HEIGHT;

      // 비동기 콜백에서 만드는 트윈도 useGSAP 컨텍스트가 추적하도록 감싼다.
      const startLoop = contextSafe(() => {
        animationsRef.current.push(
          gsap
            .timeline({ repeat: -1 })
            .set(strip, { y: 0 })
            .to(strip, {
              y: -loopHeight,
              duration: loopHeight / speed,
              ease: "none",
            }),
        );
      });

      // 현재 위치에서 이어서 첫 바퀴를 마저 돌고, 그 다음부터 무한 반복한다.
      const currentY = Number(gsap.getProperty(strip, "y"));

      animationsRef.current.push(
        gsap.to(strip, {
          y: -loopHeight,
          duration: Math.abs(-loopHeight - currentY) / speed,
          ease: "none",
          onComplete: startLoop,
        }),
      );
    },
    { dependencies: [distance, speed] },
  );
};
