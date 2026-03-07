"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rss, Gamepad2, Wallet, Mic, User } from "lucide-react";

const TABS = [
  { href: "/feed",    label: "Feed",   icon: Rss },
  { href: "/spaces",  label: "Spaces", icon: Mic },
  { href: "/games",   label: "Games",  icon: Gamepad2 },
  { href: "/wallet",  label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile",icon: User },
];

export default function MobileBottomNav() {
  const path = usePathname();

  // Hide on landing page and auth pages
  if (path === "/" || path.startsWith("/auth") || path.startsWith("/onboarding")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-zinc-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around px-2 h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-colors ${
                active ? "text-yellow-400" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
