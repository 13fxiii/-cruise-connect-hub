"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Zap, Rss, Megaphone, Mic, Gamepad2, Wallet, User, Music, Film, ShoppingBag, Briefcase, ChevronDown, Bell, Trophy, Star } from "lucide-react";

const PRIMARY_LINKS = [
  { href: "/feed",    label: "Feed",    icon: Rss },
  { href: "/spaces",  label: "Spaces",  icon: Mic },
  { href: "/games",   label: "Games",   icon: Gamepad2 },
  { href: "/wallet",  label: "Wallet",  icon: Wallet },
];

const MORE_LINKS = [
  { href: "/games/tournament", label: "Tournaments", icon: Trophy },
  { href: "/music",   label: "Music Hub",   icon: Music },
  { href: "/movies",  label: "Movie Hub",   icon: Film },
  { href: "/shop",    label: "C&C Shop",    icon: ShoppingBag },
  { href: "/jobs",    label: "Jobs Board",  icon: Briefcase },
  { href: "/ads",     label: "PR/ADS",      icon: Megaphone },
  { href: "/community-id", label: "Community ID", icon: Star },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [unread, setUnread] = useState(0);
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
    const timer = setInterval(fetchUnread, 30000); // poll every 30s
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-black text-sm hidden sm:inline"><span className="text-white">C&C </span><span className="text-yellow-400">Hub〽️</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {PRIMARY_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${path === href ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <Icon size={14} /> {label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${MORE_LINKS.some(l => l.href === path) ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              More <ChevronDown size={12} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)}/>
                <div className="absolute top-full right-0 mt-1 w-52 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl z-50">
                  {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-zinc-800/50 last:border-0 ${path === href ? "text-yellow-400 bg-yellow-400/5" : "text-zinc-300 hover:text-white hover:bg-zinc-900"}`}>
                      <Icon size={14} /> {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Notification Bell */}
          <Link href="/notifications" className="relative text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 bg-yellow-400 text-black text-xs font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link href="/profile" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"><User size={18} /></Link>
          <Link href="/auth/login" className="bg-yellow-400 text-black text-sm font-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">Join Hub</Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="text-white w-5 h-5" /> : <Menu className="text-white w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-black border-t border-zinc-800 px-4 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          {[...PRIMARY_LINKS, ...MORE_LINKS].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${path === href ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-300 hover:text-white"}`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          <Link href="/notifications" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white">
            <Bell size={16}/> Notifications {unread > 0 && <span className="ml-auto bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded-full">{unread}</span>}
          </Link>
          <div className="border-t border-zinc-800 mt-2 pt-3 space-y-2">
            <Link href="/profile/edit" onClick={() => setOpen(false)} className="block text-center bg-zinc-800 text-zinc-300 text-sm font-bold py-2.5 rounded-full">Edit Profile</Link>
            <Link href="/auth/login" onClick={() => setOpen(false)} className="block bg-yellow-400 text-black text-sm font-black py-2.5 rounded-full text-center">Join Hub</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
