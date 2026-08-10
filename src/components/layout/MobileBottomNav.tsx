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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-zinc-800/80" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Primary navigation">
      <div className="grid grid-cols-4 items-center px-2 h-[66px]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
          return <Link key={href} href={href} aria-label={label} className={`flex h-full flex-col items-center justify-center gap-1 rounded-xl transition-colors ${active ? "text-yellow-400" : "text-zinc-400 hover:text-zinc-200"}`}><Icon size={25} strokeWidth={active ? 2.6 : 2} /><span className="text-[12px] font-bold leading-none">{label}</span></Link>;
        })}
      </div>
    </nav>
  );
}
