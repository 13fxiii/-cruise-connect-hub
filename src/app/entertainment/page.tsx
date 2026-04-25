import Link from "next/link";
import { Film, Gamepad2, Music2, Radio } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

const CARDS = [
  {
    title: "Cruise Connect Games",
    desc: "Tournaments, trivia, and quick play.",
    href: "/games",
    icon: Gamepad2,
    tone: "from-green-500/15 to-emerald-500/5 border-green-500/20 text-green-400",
  },
  {
    title: "Cruise Connect Music",
    desc: "Cruise playlists + radio links.",
    href: "/music",
    icon: Music2,
    tone: "from-pink-500/15 to-purple-500/5 border-pink-500/20 text-pink-400",
  },
  {
    title: "Cruise Connect Movies",
    desc: "Community movie picks and watch nights.",
    href: "/movies",
    icon: Film,
    tone: "from-blue-500/15 to-cyan-500/5 border-blue-500/20 text-blue-400",
  },
];

export default function EntertainmentHubPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Cruise Connect Entertainment" back />
      <main className="max-w-lg mx-auto px-4 pt-5">
        <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
          <p className="text-yellow-400 text-xs font-black tracking-wide">SIMPLE MODE</p>
          <p className="text-white font-bold mt-1">One place for Cruise Connect Games, Music, and Movies.</p>
          <p className="text-zinc-400 text-sm mt-1">No clutter. Tap what you want and keep cruising.</p>
        </div>

        <div className="space-y-3">
          {CARDS.map(({ title, desc, href, icon: Icon, tone }) => (
            <Link key={href} href={href} className={`block rounded-2xl border bg-gradient-to-br p-4 ${tone}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-black">{title}</p>
                  <p className="text-zinc-300 text-sm">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold">
            <Radio className="w-4 h-4 text-yellow-400" />
            Cruise Connect Radio
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Add your streaming profile links in Music Hub so plays count on your preferred platform.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
