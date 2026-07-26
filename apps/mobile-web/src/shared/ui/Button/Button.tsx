import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";
import LiquidGlass from "liquid-glass-react";
import { GLASS_EFFECT, RADIUS } from "@/shared/consts";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ className, children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      <LiquidGlass
        {...GLASS_EFFECT}
        className={styles.glass}
        cornerRadius={RADIUS.pill}
        style={{ width: "100%", height: "100%" }}
      >
        <span className={styles.label}>{children}</span>
      </LiquidGlass>
    </button>
  );
};

export default Button;
