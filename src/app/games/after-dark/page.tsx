"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle, Flame, ShieldAlert } from "lucide-react";

const TRUTHS = [
  "What kind of DM gets you blushing instantly?",
  "What is your boldest creator fantasy collab?",
  "What compliment melts you fastest?",
  "What is one naughty dare you would accept on a live space?",
  "What song instantly flips your mood to spicy?",
];

const DARES = [
  "Drop a flirty line in your Notes and read it in your best voice.",
  "Post a playful (but safe-for-platform) thirst quote in chat.",
  "Give a 20-second mock 'late-night radio host' intro.",
  "Reveal your top 3 confidence songs for creator mode.",
  "Do your best seductive ad voiceover for a made-up perfume.",
];

export default function AfterDarkGamePage() {
  const [mode, setMode] = useState<"truth" | "dare">("truth");
  const [index, setIndex] = useState(0);

  const list = useMemo(() => (mode === "truth" ? TRUTHS : DARES), [mode]);
  const current = list[index % list.length];

  const nextPrompt = () => {
    const next = Math.floor(Math.random() * list.length);
    setIndex(next);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6">
      <div className="max-w-xl mx-auto">
        <Link href="/games" className="text-zinc-400 text-sm hover:text-white">
          ← Back to Games
        </Link>

        <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center gap-2 text-rose-300 font-black">
            <Flame className="w-4 h-4" />
            After Dark 18+
          </div>
          <p className="text-zinc-200 text-sm mt-2">
            Adult party game for consenting adults only. Keep it respectful, no pressure, no harassment.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode("truth")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${mode === "truth" ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-300"}`}
            >
              Truth
            </button>
            <button
              onClick={() => setMode("dare")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${mode === "dare" ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-300"}`}
            >
              Dare
            </button>
          </div>

          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 min-h-[120px]">
            <p className="text-zinc-200 text-base leading-relaxed">{current}</p>
          </div>

          <button
            onClick={nextPrompt}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-black text-sm"
          >
            <Shuffle className="w-4 h-4" />
            New prompt
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-xs text-zinc-400 flex gap-2">
          <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          Use this only in private/community-safe contexts. Follow platform rules and local laws.
        </div>
      </div>
    </div>
  );
}
