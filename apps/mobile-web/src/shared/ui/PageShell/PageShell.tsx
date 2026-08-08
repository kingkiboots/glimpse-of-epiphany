import { APP_TITLE } from "@/shared/consts";
import { cn } from "@packages/utils";
import type { ReactNode } from "react";
import styles from "./PageShell.module.css";

/**
 * - `bottom`: 남는 공간을 밀어내 하단을 화면 바닥에 붙인다. CTA가 늘 엄지 근처에 있어야
 *   하는 화면(시작·작성·전시)용.
 * - `flow`: 본문 바로 뒤에 이어붙는다. 하단 요소가 화면 아래쪽에 떠 있는 게 아니라
 *   본문의 연장인 화면(로딩·완료·에러의 성구)용.
 */
type FooterPlacement = "bottom" | "flow";

type PageShellProps = {
  /** 기본값은 모든 화면이 공유하는 APP_TITLE. 화면 위쪽 고정된 자리에 놓인다. */
  title?: ReactNode;
  /** 제목 아래로 흐르는 본문. 설명 문구도 화면마다 성격이 달라 여기에 둔다. */
  children?: ReactNode;
  /** CTA·성구처럼 본문과 분리해 아래에 두는 것들. */
  footer?: ReactNode;
  /** 하단을 화면 바닥에 붙일지, 본문 뒤에 그냥 이어붙일지. */
  footerPlacement?: FooterPlacement;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

/**
 * 모바일 화면 공통 뼈대. 제목 / 본문 / 하단 3단으로 나눠서, 콘텐츠 길이와 무관하게
 * 제목이 늘 같은 높이에서 시작하게 한다.
 */
const PageShell = ({
  title = APP_TITLE,
  children,
  footer,
  footerPlacement = "bottom",
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
        <div
          className={cn(
            styles.footer,
            footerPlacement === "bottom" && styles.footerBottom,
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
};

export default PageShell;
