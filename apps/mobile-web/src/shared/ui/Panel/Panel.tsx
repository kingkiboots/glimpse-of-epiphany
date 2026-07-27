import { GLASS_EFFECT, RADIUS } from "@/shared/consts";
import { cn } from "@packages/utils";
import LiquidGlass from "liquid-glass-react";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = ComponentProps<typeof LiquidGlass> & {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
  className?: string;
  radius?: keyof typeof RADIUS;
};

const Panel = ({
  className,
  children,
  width,
  height,
  radius = "panel",
  padding = "0",
  style,
  ...rest
}: PanelProps) => {
  return (
    <div
      className={styles.root}
      style={{
        width,
        height,
      }}
    >
      <LiquidGlass
        {...GLASS_EFFECT}
        cornerRadius={RADIUS[radius]}
        padding={padding}
        className={cn(styles.panel, className)}
        style={{
          width,
          height,
          ...style,
        }}
        {...rest}
      >
        {children}
      </LiquidGlass>
    </div>
  );
};

export default Panel;
