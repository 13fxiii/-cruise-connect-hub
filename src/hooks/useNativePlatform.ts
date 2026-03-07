"use client";
import { useEffect, useState } from "react";

export type NativePlatform = "ios" | "android" | "electron-mac" | "electron-win" | "electron-linux" | "web";

export function useNativePlatform(): NativePlatform {
  const [platform, setPlatform] = useState<NativePlatform>("web");

  useEffect(() => {
    // Electron
    if (typeof window !== "undefined" && (window as any).electronAPI?.isElectron) {
      const ep = (window as any).electronAPI.platform;
      if (ep === "darwin") setPlatform("electron-mac");
      else if (ep === "win32") setPlatform("electron-win");
      else setPlatform("electron-linux");
      return;
    }

    // Capacitor (iOS/Android)
    if (typeof (window as any).Capacitor !== "undefined") {
      const cp = (window as any).Capacitor.getPlatform?.();
      if (cp === "ios")     setPlatform("ios");
      if (cp === "android") setPlatform("android");
      return;
    }

    // Web (PWA standalone)
    setPlatform("web");
  }, []);

  return platform;
}

export function useIsNative(): boolean {
  const p = useNativePlatform();
  return p !== "web";
}

export function useIsElectron(): boolean {
  const p = useNativePlatform();
  return p.startsWith("electron");
}

export function useIsMobile(): boolean {
  const p = useNativePlatform();
  return p === "ios" || p === "android";
}
