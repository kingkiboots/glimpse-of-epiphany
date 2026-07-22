import type { HTMLAttributes } from "react";
import styles from "./Panel.module.css";

type PanelProps = HTMLAttributes<HTMLDivElement>;

const Panel = ({ className, children, ...props }: PanelProps) => {
  return (
    <div
      className={[styles.panel, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};

export default Panel;
