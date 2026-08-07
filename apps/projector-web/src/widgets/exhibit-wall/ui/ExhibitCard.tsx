import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Exhibit } from "@packages/api";
import { CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS } from "@/shared/consts";
import styles from "./ExhibitCard.module.css";

type ExhibitCardProps = {
  exhibit: Exhibit;
  x: number;
  y: number;
};

/**
 * 칸 하나에 놓이는 사진. 부모가 exhibit.id를 key로 주므로 사진이 바뀌면
 * 통째로 다시 마운트된다 — 로드/실패 상태가 이전 사진에 오염되지 않는다.
 */
const ExhibitCard = ({ exhibit, x, y }: ExhibitCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  // 이미지가 실제로 로드된 뒤에 나타나야 빈 카드가 먼저 떠오르지 않는다.
  useGSAP(
    () => {
      if (!isLoaded || !cardRef.current) {
        return;
      }

      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power2.out" },
      );
    },
    { dependencies: [isLoaded] },
  );

  // 만료로 파일이 사라진 직후 그 URL을 그리려 할 수 있다.
  // 스크린에 깨진 이미지 아이콘이 뜨는 것보다 빈칸이 낫다.
  if (isBroken) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        left: x,
        top: y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
      }}
    >
      <img
        className={styles.image}
        src={exhibit.imageUrl}
        alt=""
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsBroken(true)}
      />
    </div>
  );
};

export default ExhibitCard;
