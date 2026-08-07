import { useRef, type MouseEventHandler } from "react";
import { SETTING_BOUNDS, type WallSettings } from "../model/wall-settings";
import styles from "./WallSettingsDialog.module.css";

type WallSettingsDialogProps = {
  settings: WallSettings;
  onUpdate: (patch: Partial<WallSettings>) => void;
};

/**
 * 행사 중 운영자가 화면 앞에서 바로 조절하는 설정.
 *
 * 트리거 버튼은 관객에게 보이면 안 되므로 평소에는 거의 투명하게 두고,
 * 마우스를 올렸을 때만 드러난다. 검은 배경이라 멀리서는 보이지 않는다.
 *
 * 브라우저 기본 <dialog>를 쓴다. showModal()이 포커스 가두기, ESC로 닫기,
 * 바깥 영역 비활성화를 전부 처리해주므로 직접 구현할 것이 없다.
 */
const WallSettingsDialog = ({ settings, onUpdate }: WallSettingsDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // <dialog> 자신을 클릭했다는 것은 내용 바깥, 즉 backdrop을 눌렀다는 뜻이다.
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
        aria-label="전시 설정"
        onClick={() => dialogRef.current?.showModal()}
      >
        ⚙
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClick={handleDialogClick}
      >
        <div className={styles.panel}>
          <h2 className={styles.title}>전시 설정</h2>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>슬라이드 속도</span>
            <input
              type="range"
              min={SETTING_BOUNDS.speed.min}
              max={SETTING_BOUNDS.speed.max}
              step={SETTING_BOUNDS.speed.step}
              value={settings.speed}
              onChange={(event) =>
                onUpdate({ speed: Number(event.target.value) })
              }
            />
            <output className={styles.fieldValue}>{settings.speed}</output>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>사진 칸 수</span>
            <input
              type="range"
              min={SETTING_BOUNDS.slotCount.min}
              max={SETTING_BOUNDS.slotCount.max}
              step={SETTING_BOUNDS.slotCount.step}
              value={settings.slotCount}
              onChange={(event) =>
                onUpdate({ slotCount: Number(event.target.value) })
              }
            />
            <output className={styles.fieldValue}>{settings.slotCount}</output>
          </label>

          <p className={styles.hint}>
            칸을 늘리면 한 사진이 화면에 더 오래 남습니다. 변경은 즉시
            적용됩니다.
          </p>

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

export default WallSettingsDialog;
