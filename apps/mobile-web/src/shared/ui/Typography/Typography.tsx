import { cn } from "@packages/utils";
import type { ElementType, HTMLAttributes } from "react";
import styles from "../../styles/typography.module.css";

export type TypographyVariant =
  | "title"
  | "body"
  | "caption"
  | "button"
  | "small"
  | "tiny";

const DEFAULT_TAG: Record<TypographyVariant, ElementType> = {
  title: "h2",
  body: "p",
  caption: "span",
  button: "span",
  small: "span",
  tiny: "span",
};

type TypographyProps = HTMLAttributes<HTMLElement> & {
  variant: TypographyVariant;
  as?: ElementType;
};

const Typography = ({
  variant,
  as,
  className,
  children,
  ...props
}: TypographyProps) => {
  const Tag = as ?? DEFAULT_TAG[variant];

  return (
    <Tag
      className={cn(styles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Typography;
