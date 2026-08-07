import ExhibitWall from "@/widgets/exhibit-wall";
import { useWallSlots } from "@/features/sync-exhibit-wall";
import { WallSettingsDialog, useWallSettings } from "@/features/wall-settings";
import styles from "./WallPage.module.css";

/** 화면이 하나뿐이라 라우터를 두지 않았다 (admin-web과 같은 판단). */
const WallPage = () => {
  const { settings, update } = useWallSettings();
  const { slots } = useWallSlots(settings.slotCount);

  return (
    <main className={styles.root}>
      <ExhibitWall slots={slots} speed={settings.speed} />
      <WallSettingsDialog settings={settings} onUpdate={update} />
    </main>
  );
};

export default WallPage;
