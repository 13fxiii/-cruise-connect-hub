"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, Radio, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/games", label: "Play", icon: Gamepad2 },
  { href: "/music", label: "FM", icon: Radio },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const path = usePathname();
  if (path.startsWith("/auth") || path.startsWith("/onboarding")) return null;
  return (
    <nav aria-label="BCH navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-zinc-800/70" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around px-2 h-16">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
          return <Link key={href} href={href} aria-label={label} className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-12 rounded-xl transition-colors ${active ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-400 hover:text-zinc-200"}`}><Icon size={24} strokeWidth={active ? 2.5 : 1.9} /><span className="text-xs font-semibold leading-none">{label}</span></Link>;
        })}
      </div>
    </nav>
  );
}