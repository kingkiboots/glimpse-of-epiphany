import { useMemo, useRef, type CSSProperties } from "react";
import type { WallSlot } from "@/features/sync-exhibit-wall";
import { useWallScroll } from "@/features/wall-scroll";
import type { WallSettings } from "@/features/wall-settings";
import { createWallLayout } from "@/shared/consts";
import { useViewportScale } from "../lib/use-viewport-scale";
import ExhibitCard from "./ExhibitCard";
import styles from "./ExhibitWall.module.css";

type ExhibitWallProps = {
  slots: WallSlot[];
  settings: WallSettings;
};

/**
 * 사진 벽 전체. 벽 좌표계(카드 409×371) 그대로 그린 뒤 scale 한 번으로 화면에
 * 맞춰 축소한다. GSAP은 안쪽 스트립의 주축(세로 방향이면 y, 가로 방향이면 x)만
 * 움직인다.
 */
const ExhibitWall = ({ slots, settings }: ExhibitWallProps) => {
  const { speed, columnGap, direction } = settings;
  const horizontal = direction === "left" || direction === "right";
  const reverse = direction === "down" || direction === "right";

  const stripRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(
    () => createWallLayout({ columnGap, horizontal }),
    [columnGap, horizontal],
  );
  const scale = useViewportScale(layout);

  // 스크롤 목표는 "채워진 마지막 칸"이 보이는 지점까지다. 중간에 구멍이
  // 있어도(운영자 삭제) 가장 아래 사진은 보여야 하므로 개수가 아니라 위치 기준.
  const maxOccupiedIndex = slots.findLastIndex((slot) => slot !== null);
  const distance = layout.getScrollDistance(maxOccupiedIndex);

  useWallScroll(stripRef, {
    axis: horizontal ? "x" : "y",
    reverse,
    distance,
    speed,
    viewportMain: layout.viewportMain,
  });

  // 순환 스크롤용 복제 한 벌의 주축 오프셋. 이어 붙는 거리에서 화면 한 판을 더
  // 나간 곳에 스트립이 다시 시작하도록 두면 마지막 줄 뒤에서 처음 줄이 따라
  // 들어오고, 스크롤 훅은 그 지점에서 위치를 0으로 되돌린다(두 화면이 똑같아
  // 끊김이 없다).
  const wrapOffset = distance > 0 ? distance + layout.viewportMain : null;

  const renderCards = (offsetMain: number, keySuffix: string) =>
    slots.map((slot, index) => {
      if (!slot) {
        return null;
      }

      const { x, y } = layout.getSlotPosition(index);

      return (
        <ExhibitCard
          key={slot.exhibit.id + keySuffix}
          exhibit={slot.exhibit}
          x={horizontal ? x + offsetMain : x}
          y={horizontal ? y : y + offsetMain}
        />
      );
    });

  // 세로: 벽을 가로 중앙에 세운다. 가로: 벽 높이가 화면 높이와 같아지므로
  // 왼쪽 위 기준으로 눕힌다.
  const scalerStyle: CSSProperties = horizontal
    ? { left: 0, transformOrigin: "top left", transform: `scale(${scale})` }
    : {
        left: "50%",
        width: layout.crossExtent,
        marginLeft: layout.crossExtent / -2,
        transformOrigin: "top center",
        transform: `scale(${scale})`,
      };

  return (
    <div className={styles.viewport}>
      <div className={styles.scaler} style={scalerStyle}>
        <div ref={stripRef} className={styles.strip}>
          {renderCards(0, "")}
          {wrapOffset !== null && renderCards(wrapOffset, ":wrap")}
        </div>
      </div>
    </div>
  );
};

export default ExhibitWall;
