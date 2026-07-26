import type { ReactNode } from "react";
import styles from "./ScreenBackground.module.css";

type ScreenBackgroundProps = {
  backgroundImageUrl?: string;
  children: ReactNode;
  className?: string;
  scrim: boolean;
};

const ScreenBackground = ({
  backgroundImageUrl,
  children,
  className,
  scrim,
}: ScreenBackgroundProps) => {
  return (
    <div
      className={[styles.screen, className].filter(Boolean).join(" ")}
      style={
        backgroundImageUrl
          ? { backgroundImage: `url(${backgroundImageUrl})` }
          : undefined
      }
    >
      <div className={scrim ? styles.scrim : styles.overlay} />

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default ScreenBackground;
