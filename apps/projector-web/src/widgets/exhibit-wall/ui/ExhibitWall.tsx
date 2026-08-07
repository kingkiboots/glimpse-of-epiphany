import { useRef } from "react";
import type { WallSlot } from "@/features/sync-exhibit-wall";
import { useWallScroll } from "@/features/wall-scroll";
import { WALL_WIDTH, getSlotPosition, getScrollDistance } from "@/shared/consts";
import { useViewportScale } from "../lib/use-viewport-scale";
import ExhibitCard from "./ExhibitCard";
import styles from "./ExhibitWall.module.css";

type ExhibitWallProps = {
  slots: WallSlot[];
  /** 슬라이드 속도 (벽 좌표계 px/s) */
  speed: number;
};

/**
 * 사진 벽 전체. 벽 좌표계(카드 409×371) 그대로 그린 뒤 scale 한 번으로 화면
 * 높이에 맞춰 축소한다 — 사진이 늘어도 배율이 변하지 않도록 기준 높이는
 * 화면 한 판(8칸)으로 고정이다. GSAP은 안쪽 스트립의 y만 움직인다.
 */
const ExhibitWall = ({ slots, speed }: ExhibitWallProps) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const scale = useViewportScale();

  // 스크롤 목표는 "채워진 마지막 칸"이 보이는 지점까지다. 중간에 구멍이
  // 있어도(운영자 삭제) 가장 아래 사진은 보여야 하므로 개수가 아니라 위치 기준.
  const maxOccupiedIndex = slots.findLastIndex((slot) => slot !== null);
  const distance = getScrollDistance(maxOccupiedIndex);

  useWallScroll(stripRef, { distance, speed });

  return (
    <div className={styles.viewport}>
      <div
        className={styles.scaler}
        style={{
          width: WALL_WIDTH,
          marginLeft: WALL_WIDTH / -2,
          transform: `scale(${scale})`,
        }}
      >
        <div ref={stripRef} className={styles.strip}>
          {slots.map((slot, index) => {
            if (!slot) {
              return null;
            }

            const { x, y } = getSlotPosition(index);

            return (
              <ExhibitCard
                key={slot.exhibit.id}
                exhibit={slot.exhibit}
                x={x}
                y={y}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExhibitWall;
