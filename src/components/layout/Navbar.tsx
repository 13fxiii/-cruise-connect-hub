"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap, Home, Megaphone } from "lucide-react";

const NAV_LINKS = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/ads", label: "PR/ADS", icon: Megaphone },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-yellow-500/20">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="text-yellow-400 w-5 h-5" />
          <span className="text-white">C&C <span className="text-yellow-400">Hub</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium">
              {label}
            </Link>
          ))}
          <Link href="/auth/login" className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors">
            Join Hub
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="text-white w-6 h-6" /> : <Menu className="text-white w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-black border-t border-yellow-500/20 px-4 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 py-2" onClick={() => setOpen(false)}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
          <Link href="/auth/login" className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold text-center mt-2">
            Join Hub
          </Link>
        </div>
      )}
    </nav>
  );
}
