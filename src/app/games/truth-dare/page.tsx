"use client";
import { useState, useCallback } from "react";
import { Flame, Users, Shuffle, ThumbsUp, ThumbsDown, Crown, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

type Mode = "truth"|"dare";
type Category = "mild"|"spicy"|"savage";

const TRUTHS: Record<Category, string[]> = {
  mild: [
    "What's your most embarrassing moment this year?",
    "Have you ever lied to get out of plans?",
    "What's the most childish thing you still do?",
    "Who in this group would you swap lives with for a day?",
    "What's your biggest pet peeve?",
    "What's a bad habit you can't break?",
    "Have you ever eaten food that fell on the floor?",
    "What's your most unpopular opinion?",
    "When was the last time you cried and why?",
    "What's something you're embarrassed to admit you enjoy?",
  ],
  spicy: [
    "Who was your first celebrity crush?",
    "Have you ever had feelings for someone in this group?",
    "What's the most daring thing you've done for love?",
    "Have you ever slid into someone's DMs and got left on read?",
    "What's the most romantic thing you've ever done?",
    "Have you ever cheated on a test or exam?",
    "What's the worst date you've ever been on?",
    "Who here do you think is secretly in love with someone?",
    "Have you ever been caught lying to a partner?",
    "What's the most embarrassing text you've sent to the wrong person?",
  ],
  savage: [
    "Who in this group do you think will be single forever?",
    "Rate everyone in this room from most to least attractive — be honest!",
    "Have you ever talked badly about someone in this group to someone else?",
    "Who here do you think is the most overrated?",
    "What's the pettiest thing you've ever done to an ex?",
    "Have you ever pretended to like someone's cooking to be nice?",
    "Who in this group needs a glow-up the most?",
    "What's the most savage thing you've ever texted someone?",
    "Have you ever ghosted someone you still see regularly?",
    "What's your most controversial opinion about the people in this group?",
  ],
};

const DARES: Record<Category, string[]> = {
  mild: [
    "Do your best celebrity impression for 30 seconds",
    "Text your mom 'I've been lying to you' — screenshot it",
    "Speak in a British accent for the next 3 rounds",
    "Do 10 push-ups right now",
    "Call someone in your contacts and sing Happy Birthday",
    "Post a throwback embarrassing photo to your IG story for 5 minutes",
    "Let someone in the group read your last 5 WhatsApp messages",
    "Do your best runway walk across the room",
    "Say something nice about everyone here — genuinely!",
    "Do your worst dance move for 15 seconds",
  ],
  spicy: [
    "DM your crush right now saying 'I've been thinking about you'",
    "Change your X bio to whatever the group decides for 1 hour",
    "Let the group pick your next profile picture",
    "Text your ex 'I miss our conversations' — no context",
    "Post a thirst trap photo to your closest friends for 10 minutes",
    "Let someone go through your camera roll for 30 seconds",
    "Send a voice note to someone in your contacts saying 'we need to talk'",
    "Change your status to 'I'm ready to mingle' for 30 minutes",
    "DM your work colleague a random food emoji — no explanation",
    "Call your last 3 contacts and say 'just checking you're okay' — no context",
  ],
  savage: [
    "Let the group post one tweet from your account — they choose what",
    "Confess your biggest secret to the group — for real",
    "Call your most recent ex and say 'I've been thinking about us'",
    "Post a roast of yourself on your story for 15 minutes",
    "Let someone read your DM requests out loud",
    "Send a 'I just wanted to say I'm sorry' message to someone you've wronged",
    "Let the group pick a TikTok sound — you have to make the video right now",
    "Give a full honest rating of your own personality: strengths and flaws",
    "Send a voice note to your best friend saying your real opinion of their partner",
    "Post your screen time stats to your story right now",
  ],
};

const CATEGORY_COLORS: Record<Category, string> = {
  mild: "text-green-400 bg-green-400/10 border-green-400/30",
  spicy: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  savage: "text-red-400 bg-red-400/10 border-red-400/30",
};

const CATEGORY_EMOJI: Record<Category, string> = { mild: "😊", spicy: "🌶️", savage: "💀" };

export default function TruthDarePage() {
  const [mode, setMode] = useState<Mode>("truth");
  const [category, setCategory] = useState<Category>("mild");
  const [current, setCurrent] = useState<string | null>(null);
  const [history, setHistory] = useState<{text:string; mode:Mode; category:Category}[]>([]);
  const [players, setPlayers] = useState<string[]>(["Player 1", "Player 2", "Player 3"]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [newPlayer, setNewPlayer] = useState("");
  const [reactions, setReactions] = useState<Record<number, {up:number;down:number}>>({});
  const [phase, setPhase] = useState<"setup"|"game">("setup");

  const spin = useCallback(() => {
    const pool = mode === "truth" ? TRUTHS[category] : DARES[category];
    const unused = pool.filter(q => !history.map(h => h.text).includes(q));
    const pick = unused.length > 0 ? unused : pool;
    const card = pick[Math.floor(Math.random() * pick.length)];
    setCurrent(card);
    setHistory(h => [...h, { text: card, mode, category }]);
  }, [mode, category, history]);

  const nextPlayer = () => {
    setCurrentPlayer(p => (p + 1) % players.length);
    setCurrent(null);
  };

  const addPlayer = () => {
    if (newPlayer.trim() && players.length < 8) {
      setPlayers(p => [...p, newPlayer.trim()]);
      setNewPlayer("");
    }
  };

  const react = (idx: number, type: "up"|"down") => {
    setReactions(r => ({
      ...r,
      [idx]: { up: (r[idx]?.up||0) + (type==="up"?1:0), down: (r[idx]?.down||0) + (type==="down"?1:0) }
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <Link href="/games" className="text-zinc-500 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><Flame className="text-orange-400 w-6 h-6" /> Truth or Dare</h1>
            <p className="text-zinc-400 text-sm">Community edition · 18+ Savage Mode available</p>
          </div>
        </div>

        {/* SETUP */}
        {phase === "setup" && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-yellow-400" /> Players ({players.length}/8)</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {players.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 bg-zinc-800 rounded-full px-3 py-1.5">
                    <span className="text-sm text-zinc-200">{p}</span>
                    <button onClick={() => setPlayers(ps => ps.filter((_,j) => j !== i))} className="text-zinc-500 hover:text-red-400 ml-1 text-xs">×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newPlayer} onChange={e => setNewPlayer(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addPlayer()}
                  placeholder="Add player name..." maxLength={20}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600" />
                <button onClick={addPlayer} className="bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors text-sm">Add</button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3">Intensity Level</h3>
              <div className="grid grid-cols-3 gap-3">
                {(["mild","spicy","savage"] as Category[]).map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`border rounded-xl p-4 text-center transition-all capitalize ${category === c ? CATEGORY_COLORS[c] : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                    <div className="text-2xl mb-1">{CATEGORY_EMOJI[c]}</div>
                    <div className="font-bold text-sm capitalize">{c}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setPhase("game")} disabled={players.length < 2}
              className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
              Start Game 🔥
            </button>
          </div>
        )}

        {/* GAME */}
        {phase === "game" && (
          <div>
            {/* Player & Turn */}
            <div className="bg-zinc-900 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-black text-white">{players[currentPlayer]}'s Turn</div>
                  <div className="text-xs text-zinc-400">Player {currentPlayer+1} of {players.length}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${CATEGORY_COLORS[category]}`}>
                {CATEGORY_EMOJI[category]} {category}
              </span>
            </div>

            {/* Mode selector */}
            <div className="flex gap-3 mb-6">
              <button onClick={() => setMode("truth")}
                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all ${mode === "truth" ? "bg-blue-500 text-white" : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-blue-500/50"}`}>
                🤔 TRUTH
              </button>
              <button onClick={() => setMode("dare")}
                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all ${mode === "dare" ? "bg-orange-500 text-white" : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-orange-500/50"}`}>
                💪 DARE
              </button>
            </div>

            {/* Card */}
            {!current ? (
              <div className="bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-2xl p-12 text-center mb-6">
                <p className="text-zinc-500 text-lg">Press spin to get a card!</p>
              </div>
            ) : (
              <div className={`border-2 rounded-2xl p-8 text-center mb-6 transition-all ${mode === "truth" ? "bg-blue-500/10 border-blue-500/40" : "bg-orange-500/10 border-orange-500/40"}`}>
                <div className="text-4xl mb-4">{mode === "truth" ? "🤔" : "💪"}</div>
                <p className="text-white text-xl font-bold leading-relaxed">{current}</p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button onClick={() => react(history.length-1, "up")} className="flex items-center gap-1.5 text-zinc-400 hover:text-green-400 transition-colors">
                    <ThumbsUp className="w-5 h-5" /> <span className="text-sm">{reactions[history.length-1]?.up || 0}</span>
                  </button>
                  <button onClick={() => react(history.length-1, "down")} className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors">
                    <ThumbsDown className="w-5 h-5" /> <span className="text-sm">{reactions[history.length-1]?.down || 0}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button onClick={spin}
                className="flex-1 bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg">
                <Shuffle className="w-5 h-5" /> {current ? "New Card" : "Spin!"}
              </button>
              <button onClick={nextPlayer}
                className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-full hover:bg-zinc-700 transition-colors">
                Next Player →
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Round History ({history.length} cards)</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...history].reverse().slice(0,10).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span>{h.mode === "truth" ? "🤔" : "💪"}</span>
                      <span className="truncate">{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={() => { setPhase("setup"); setCurrent(null); setHistory([]); }}
                className="text-xs text-zinc-500 hover:text-white transition-colors">← Reset Game</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
