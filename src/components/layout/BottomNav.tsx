"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rss, Radio, Gamepad2, Zap } from "lucide-react";

const TABS = [
  { href: "/feed",   label: "Home",  icon: Rss },
  { href: "/spaces", label: "Live",  icon: Radio },
  { href: "/games",  label: "Play",  icon: Gamepad2 },
  { href: "/earn",   label: "Earn",  icon: Zap },
];

export default function BottomNav() {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  // Hide on auth/onboarding pages
  if (path.startsWith("/auth") || path.startsWith("/onboarding")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                active ? "text-yellow-400" : "text-zinc-500"
              }`}>
              <div className={`relative ${active ? "scale-110" : ""} transition-transform`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {href === "/spaces" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] font-bold ${active ? "text-yellow-400" : "text-zinc-600"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
