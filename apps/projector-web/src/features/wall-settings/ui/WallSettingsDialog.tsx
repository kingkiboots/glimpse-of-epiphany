import { useRef, type MouseEventHandler } from "react";
import {
  DIRECTION_OPTIONS,
  SETTING_BOUNDS,
  type WallDirection,
  type WallSettings,
} from "../model/wall-settings";
import styles from "./WallSettingsDialog.module.css";
import { useCheatSettingsButtonActive } from "../lib/use-cheat-settings-button-active";

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
const WallSettingsDialog = ({
  settings,
  onUpdate,
}: WallSettingsDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isCheatActive } = useCheatSettingsButtonActive();

  // <dialog> 자신을 클릭했다는 것은 내용 바깥, 즉 backdrop을 눌렀다는 뜻이다.
  const handleDialogClick: MouseEventHandler<HTMLDialogElement> = (event) => {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      {isCheatActive ? (
        <button
          type="button"
          className={styles.trigger}
          aria-label="전시 설정"
          onClick={() => dialogRef.current?.showModal()}
        >
          ⚙
        </button>
      ) : null}
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

          <label className={styles.field}>
            <span className={styles.fieldLabel}>컬럼 간격</span>
            <input
              type="range"
              min={SETTING_BOUNDS.columnGap.min}
              max={SETTING_BOUNDS.columnGap.max}
              step={SETTING_BOUNDS.columnGap.step}
              value={settings.columnGap}
              onChange={(event) =>
                onUpdate({ columnGap: Number(event.target.value) })
              }
            />
            <output className={styles.fieldValue}>{settings.columnGap}</output>
          </label>

          <div className={styles.field} role="radiogroup" aria-label="슬라이드 방향">
            <span className={styles.fieldLabel}>슬라이드 방향</span>
            <div className={styles.directionOptions}>
              {DIRECTION_OPTIONS.map((option) => (
                <label key={option.value} className={styles.directionOption}>
                  <input
                    type="radio"
                    name="wall-direction"
                    value={option.value}
                    checked={settings.direction === option.value}
                    onChange={(event) =>
                      onUpdate({
                        direction: event.target.value as WallDirection,
                      })
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <p className={styles.hint}>
            칸을 늘리면 한 사진이 화면에 더 오래 남습니다. 좌우 방향은 벽을
            눕혀서 흘립니다. 변경은 즉시 적용됩니다.
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
