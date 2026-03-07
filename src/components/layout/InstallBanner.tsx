"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Download, Share } from "lucide-react";

type Platform = "ios" | "android" | "windows" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  const isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  if (isStandalone) return null; // already installed
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows/.test(ua) && "BeforeInstallPromptEvent" in window) return "windows";
  return null;
}

export default function InstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [dismissed, setDismissed] = useState(true); // start hidden
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Don't show if dismissed this session
    if (sessionStorage.getItem("cc-install-dismissed")) return;

    const p = detectPlatform();
    if (!p) return;

    // Android/Windows: capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setDismissed(false);
    };
    window.addEventListener("beforeinstallprompt", handler as any);

    // iOS: always show after 3s delay
    if (p === "ios") {
      const t = setTimeout(() => {
        setPlatform("ios");
        setDismissed(false);
      }, 3000);
      return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", handler as any); };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("cc-install-dismissed", "1");
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
    }
  };

  if (dismissed || !platform) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[60] md:bottom-4 md:left-auto md:right-4 md:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-zinc-900 border border-yellow-400/30 rounded-2xl p-3.5 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-3 mb-2.5">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-black">
            <Image src="/logo.jpeg" alt="CC Hub" width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Install CC Hub 🚌</p>
            <p className="text-zinc-400 text-xs">Add to your home screen</p>
          </div>
          <button onClick={dismiss} className="text-zinc-500 hover:text-white p-1 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {platform === "ios" ? (
          <div className="bg-zinc-800/60 rounded-xl p-2.5 mb-2.5">
            <p className="text-zinc-300 text-xs leading-relaxed">
              Tap <Share size={11} className="inline mx-0.5 text-blue-400" /> <span className="text-blue-400 font-semibold">Share</span> in Safari, then{" "}
              <span className="text-yellow-400 font-semibold">Add to Home Screen</span>
            </p>
          </div>
        ) : (
          <button onClick={install}
            className="w-full bg-yellow-400 text-black text-xs font-black py-2 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1.5 mb-2">
            <Download size={13} /> Install App
          </button>
        )}

        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
          <span>✓ Works offline</span>
          <span>✓ Push notifications</span>
          <span>✓ No App Store needed</span>
        </div>
      </div>
    </div>
  );
}
