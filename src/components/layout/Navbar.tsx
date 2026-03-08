"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu, X, Rss, Megaphone, Mic, Gamepad2, Wallet, User,
  Music, Film, ShoppingBag, Briefcase, ChevronDown, Bell,
  Trophy, Star, LayoutDashboard
} from "lucide-react";

const PRIMARY_LINKS = [
  { href: "/feed",   label: "Feed",   icon: Rss },
  { href: "/spaces", label: "Spaces", icon: Mic },
  { href: "/games",  label: "Games",  icon: Gamepad2 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

const MORE_LINKS = [
  { href: "/games/tournament", label: "Tournaments",   icon: Trophy },
  { href: "/music",            label: "Music Hub",     icon: Music },
  { href: "/movies",           label: "Movie Hub",     icon: Film },
  { href: "/shop",             label: "C&C Shop",      icon: ShoppingBag },
  { href: "/jobs",             label: "Jobs Board",    icon: Briefcase },
  { href: "/ads",              label: "PR/ADS",        icon: Megaphone },
  { href: "/community-id",     label: "Community ID",  icon: Star },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [unread, setUnread]     = useState(0);
  const path = usePathname();

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = () => {
      fetch("/api/notifications?unread_count=1")
        .then(r => r.json())
        .then(d => { if (!cancelled) setUnread(d.unread_count || 0); })
        .catch(() => {});
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-3 h-14 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.jpeg" alt="Cruise Connect Hub" fill sizes="32px" className="object-cover" priority />
          </div>
          <span className="font-black text-xs hidden sm:inline leading-tight">
            <span className="text-white">Cruise Connect</span>
            <span className="text-yellow-400"> Hub〽️</span>
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-0.5">
          {PRIMARY_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive(href) ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}>
              <Icon size={13} /> {label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                MORE_LINKS.some(l => isActive(l.href))
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}>
              More <ChevronDown size={11} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute top-full right-0 mt-1 w-48 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl z-50">
                  {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors border-b border-zinc-800/50 last:border-0 ${
                        isActive(href) ? "text-yellow-400 bg-yellow-400/5" : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                      }`}>
                      <Icon size={13} /> {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* DESKTOP RIGHT */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* Notifications */}
          <Link href="/notifications"
            className="relative text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          {/* Admin shortcut */}
          <Link href="/admin"
            className={`p-1.5 rounded-lg transition-colors ${
              isActive("/admin") ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
            title="Admin Panel">
            <LayoutDashboard size={16} />
          </Link>
          <Link href="/profile"
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <User size={16} />
          </Link>
          <Link href="/auth/login"
            className="bg-yellow-400 text-black text-xs font-black px-3 py-1.5 rounded-full hover:bg-yellow-300 transition-colors">
            Join Hub
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-3 py-3 flex flex-col gap-0.5 max-h-[85vh] overflow-y-auto">
          {[...PRIMARY_LINKS, ...MORE_LINKS].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                isActive(href) ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-300 hover:text-white hover:bg-zinc-900"
              }`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
          <Link href="/notifications" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900">
            <Bell size={15} /> Notifications
            {unread > 0 && (
              <span className="ml-auto bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>
            )}
          </Link>
          {/* Admin link in mobile drawer */}
          <Link href="/admin" onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
              isActive("/admin") ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-300 hover:text-white hover:bg-zinc-900"
            }`}>
            <LayoutDashboard size={15} /> Admin Panel
          </Link>
          <div className="border-t border-zinc-800 mt-2 pt-2.5 space-y-2">
            <Link href="/profile" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900">
              <User size={15} /> My Profile
            </Link>
            <Link href="/auth/login" onClick={() => setOpen(false)}
              className="block bg-yellow-400 text-black text-xs font-black py-2.5 rounded-xl text-center hover:bg-yellow-300 transition-colors">
              Join Hub 🚌
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
