import { useState, useEffect } from "react";

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface BatteryState {
  supported: boolean;
  level: number; // 0 to 100 percentage
  charging: boolean;
  isLow: boolean; // <= 20%
  isCritical: boolean; // <= 10%
}

export function useBatteryStatus(): BatteryState {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    supported: false,
    level: 100,
    charging: true,
    isLow: false,
    isCritical: false,
  });

  useEffect(() => {
    const nav = typeof window !== "undefined" ? (window.navigator as NavigatorWithBattery) : null;
    if (!nav || typeof nav.getBattery !== "function") {
      return;
    }

    const updateState = (bm: BatteryManager) => {
      const percentage = Math.round(bm.level * 100);
      const isLow = percentage <= 20 && !bm.charging;
      const isCritical = percentage <= 10 && !bm.charging;

      setBatteryState({
        supported: true,
        level: percentage,
        charging: bm.charging,
        isLow,
        isCritical,
      });
    };

    nav.getBattery()
      .then((bm) => {
        updateState(bm);

        const handleLevelChange = () => updateState(bm);
        const handleChargingChange = () => updateState(bm);

        bm.addEventListener("levelchange", handleLevelChange);
        bm.addEventListener("chargingchange", handleChargingChange);

        return () => {
          bm.removeEventListener("levelchange", handleLevelChange);
          bm.removeEventListener("chargingchange", handleChargingChange);
        };
      })
      .catch((err) => {
        console.warn("Battery API error:", err);
      });
  }, []);

  return batteryState;
}
