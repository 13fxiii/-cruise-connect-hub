"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Zap, Home, Rss, Megaphone, User, LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/ads", label: "PR/ADS", icon: Megaphone },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-cch-black/95 backdrop-blur-md border-b border-cch-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-cch-gold flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <span className="font-bold text-sm leading-tight">
            <span className="text-white">Cruise & Connect</span>
            <span className="text-cch-gold"> Hub〽️</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-cch-muted hover:text-white transition-colors flex items-center gap-1.5">
              <l.icon size={14} />
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {session.user?.image ? (
                  <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full border border-cch-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cch-surface-2 border border-cch-border flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
                <span className="text-sm text-white">{session.user?.name?.split(" ")[0]}</span>
              </Link>
              <button onClick={() => signOut()} className="text-cch-muted hover:text-white transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="btn-gold text-sm">
              Join the Cruise 🚀
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cch-border bg-cch-surface animate-fade-in">
          <div className="px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-2 text-cch-muted hover:text-white transition-colors">
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
            {session ? (
              <button onClick={() => signOut()} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <Link href="/auth/signin" onClick={() => setOpen(false)} className="btn-gold text-sm text-center">
                Join the Cruise 🚀
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
