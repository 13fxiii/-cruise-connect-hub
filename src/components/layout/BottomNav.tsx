"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Rss, Radio, Gamepad2, Search, MessageCircle, Bell, Plus } from "lucide-react";

const TABS = [
  { href: "/feed",          icon: Rss,           label: "Feed"     },
  { href: "/spaces",        icon: Radio,         label: "Live"     },
  { href: "/search",        icon: Search,        label: "Search"   },
  { href: "/games",         icon: Gamepad2,      label: "Play"     },
  { href: "/messages",      icon: MessageCircle, label: "DMs"      },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadDMs, setUnreadDMs]     = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchBadges = () => {
      fetch("/api/messages").then(r => r.json()).then(d => {
        const total = (d.conversations || []).reduce((a: number, c: any) => a + (c.unread || 0), 0);
        setUnreadDMs(total);
      }).catch(() => {});
      fetch("/api/notifications?unread_count=1").then(r => r.json()).then(d => {
        setUnreadNotifs(d.unread_count || 0);
      }).catch(() => {});
    };
    fetchBadges();
    const t = setInterval(fetchBadges, 30000);
    return () => clearInterval(t);
  }, [user]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-zinc-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          const badge = href === "/messages" ? unreadDMs : href === "/notifications" ? unreadNotifs : 0;
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                active ? "text-yellow-400" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {badge > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-bold leading-none ${active ? "text-yellow-400" : "text-zinc-600"}`}>{label}</span>
              {active && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />}
            </Link>
          );
        })}

        {/* Post button */}
        <Link href="/feed?compose=1"
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <Plus className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-bold text-zinc-600">Post</span>
        </Link>
      </div>
    </nav>
  );
}
