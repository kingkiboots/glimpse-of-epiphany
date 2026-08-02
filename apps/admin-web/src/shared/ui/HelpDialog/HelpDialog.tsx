import { useRef, type MouseEventHandler, type PropsWithChildren } from "react";
import styles from "./HelpDialog.module.css";

type HelpDialogProps = PropsWithChildren<{
  title: string;
  /** 아이콘 버튼의 접근성 이름 */
  label?: string;
}>;

/**
 * (?) 아이콘을 눌러 여는 도움말.
 *
 * 브라우저 기본 <dialog>를 쓴다. showModal()이 포커스 가두기, ESC로 닫기,
 * 바깥 영역 비활성화(inert)를 전부 처리해주므로 직접 구현할 것이 없다.
 */
const HelpDialog = ({ title, label = "도움말", children }: HelpDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // <dialog> 자신을 클릭했다는 것은 내용(panel) 바깥, 즉 backdrop을 눌렀다는 뜻이다.
  const handleDialogClick: MouseEventHandler<HTMLDialogElement> = (event) => {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        onClick={() => dialogRef.current?.showModal()}
      >
        ?
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClick={handleDialogClick}
      >
        <div className={styles.panel}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.body}>{children}</div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dialogRef.current?.close()}
          >
            닫기
          </button>
        </div>
      </dialog>
    </>
  );
};

export default HelpDialog;
