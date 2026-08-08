import { APP_TITLE } from "@/shared/consts";
import { cn } from "@packages/utils";
import type { ReactNode } from "react";
import styles from "./PageShell.module.css";

type PageShellProps = {
  /** 기본값은 모든 화면이 공유하는 APP_TITLE. 화면 위쪽 고정된 자리에 놓인다. */
  title?: ReactNode;
  /** 제목 아래로 흐르는 본문. 설명 문구도 화면마다 성격이 달라 여기에 둔다. */
  children?: ReactNode;
  /** CTA·성구처럼 항상 화면 아래에 붙어 있어야 하는 것들. */
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

/**
 * 모바일 화면 공통 뼈대. 제목 / 본문 / 하단 3단으로 나눠서, 콘텐츠 길이와 무관하게
 * 제목은 늘 같은 높이에서 시작하고 하단은 바닥에 붙게 한다.
 */
const PageShell = ({
  title = APP_TITLE,
  children,
  footer,
  className,
  bodyClassName,
  footerClassName,
}: PageShellProps) => {
  return (
    <div className={cn(styles.shell, className)}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </header>
      <div className={cn(styles.body, bodyClassName)}>{children}</div>
      {footer ? (
        <div className={cn(styles.footer, footerClassName)}>{footer}</div>
      ) : null}
    </div>
  );
};

export default PageShell;
