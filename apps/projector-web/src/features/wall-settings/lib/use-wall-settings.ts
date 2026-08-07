import { useCallback, useEffect, useState } from "react";
import {
  loadSettings,
  saveSettings,
  type WallSettings,
} from "../model/wall-settings";

/**
 * 운영자가 행사 중 화면 앞에서 만지는 값이라 새로고침에도 유지되어야 한다.
 * localStorage에 저장한다.
 */
export const useWallSettings = () => {
  const [settings, setSettings] = useState<WallSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = useCallback((patch: Partial<WallSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, update };
};
