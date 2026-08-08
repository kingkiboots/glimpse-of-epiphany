import { useRef } from "react";
import type { WallSlot } from "@/features/sync-exhibit-wall";
import { useWallScroll } from "@/features/wall-scroll";
import {
  WALL_WIDTH,
  WALL_VIEWPORT_HEIGHT,
  getSlotPosition,
  getScrollDistance,
} from "@/shared/consts";
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

  // 순환 스크롤용 복제 한 벌의 위치. 정지 지점에서 화면 한 판을 더 내려간 곳에
  // 스트립이 다시 시작하도록 두면 마지막 줄 아래에서 처음 줄이 올라오고,
  // 스크롤 훅은 그 지점에서 y를 0으로 되돌린다(두 화면이 똑같아 끊김이 없다).
  const wrapOffset = distance > 0 ? distance + WALL_VIEWPORT_HEIGHT : null;

  const renderCards = (offsetY: number, keySuffix: string) =>
    slots.map((slot, index) => {
      if (!slot) {
        return null;
      }

      const { x, y } = getSlotPosition(index);

      return (
        <ExhibitCard
          key={slot.exhibit.id + keySuffix}
          exhibit={slot.exhibit}
          x={x}
          y={y + offsetY}
        />
      );
    });

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
          {renderCards(0, "")}
          {wrapOffset !== null && renderCards(wrapOffset, ":wrap")}
        </div>
      </div>
    </div>
  );
};

export default ExhibitWall;
