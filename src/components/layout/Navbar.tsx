"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap, Rss, Megaphone, Mic, Gamepad2, Wallet, User, Music, Film, ShoppingBag, Briefcase } from "lucide-react";

const NAV_LINKS = [
  { href: "/feed",    label: "Feed",    icon: Rss },
  { href: "/spaces",  label: "Spaces",  icon: Mic },
  { href: "/games",   label: "Games",   icon: Gamepad2 },
  { href: "/music",   label: "Music",   icon: Music },
  { href: "/movies",  label: "Movies",  icon: Film },
  { href: "/shop",    label: "Shop",    icon: ShoppingBag },
  { href: "/jobs",    label: "Jobs",    icon: Briefcase },
  { href: "/wallet",  label: "Wallet",  icon: Wallet },
  { href: "/ads",     label: "PR/ADS",  icon: Megaphone },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-black text-sm hidden sm:block"><span className="text-white">C&C </span><span className="text-yellow-400">Hub〽️</span></span>
        </Link>
        {/* Desktop — scrollable nav */}
        <div className="hidden md:flex items-center gap-0.5 overflow-x-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                path === href ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <Icon size={13} /> {label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Link href="/profile" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"><User size={16} /></Link>
          <Link href="/auth/login" className="bg-yellow-400 text-black text-xs font-black px-3 py-2 rounded-full hover:bg-yellow-300 transition-colors">Join Hub</Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="text-white w-5 h-5" /> : <Menu className="text-white w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-black border-t border-zinc-800 px-4 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${path === href ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-300 hover:text-white"}`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          <div className="border-t border-zinc-800 mt-2 pt-3">
            <Link href="/auth/login" className="block bg-yellow-400 text-black text-sm font-black py-2.5 rounded-full text-center">Join Hub Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
