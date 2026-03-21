"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import { Users, RefreshCw, Eye, EyeOff, Crown } from "lucide-react";

const WORDS = [
  "LAGOS","ABUJA","KANO","IBADAN","BANK","HUSTLE","CRUISE","NAIJA",
  "AFROBEATS","MARKET","JOLLOF","SUYA","DANFO","OSHODI","BUKA","OWAMBE",
  "SORO SOKE","AGBADO","OGBONNA","SENATOR","ALHAJI","MADAM","CHIEF",
  "YAHOO","MOBILE","PASTOR","BROTHER","VILLAGE","ABROAD","VISA",
  "DOLLARS","POUNDS","CRYPTO","BITCOIN","OIL","DELTA","POLICE","ARMY",
];

type CardType = "red" | "blue" | "neutral" | "assassin";
interface Card { word: string; type: CardType; revealed: boolean; }
type Team = "red" | "blue";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBoard(): Card[] {
  const words = shuffle(WORDS).slice(0, 25);
  const types: CardType[] = [
    ...Array(9).fill("red"),
    ...Array(8).fill("blue"),
    ...Array(7).fill("neutral"),
    "assassin",
  ];
  const shuffledTypes = shuffle(types) as CardType[];
  return words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false }));
}

export default function CodenamesPage() {
  const [board, setBoard]         = useState<Card[]>([]);
  const [spymasterMode, setSpymasterMode] = useState(false);
  const [currentTeam, setCurrentTeam]     = useState<Team>("red");
  const [clue, setClue]           = useState("");
  const [clueNum, setClueNum]     = useState("1");
  const [gameLog, setGameLog]     = useState<string[]>([]);
  const [winner, setWinner]       = useState<Team | "assassin" | null>(null);
  const [role, setRole]           = useState<"spymaster" | "operative">("operative");

  useEffect(() => { resetGame(); }, []);

  const resetGame = () => {
    setBoard(generateBoard());
    setCurrentTeam("red");
    setClue("");
    setClueNum("1");
    setGameLog([]);
    setWinner(null);
    setSpymasterMode(false);
  };

  const reveal = (i: number) => {
    if (winner || board[i].revealed) return;
    const card = board[i];
    const newBoard = board.map((c, idx) => idx === i ? { ...c, revealed: true } : c);
    setBoard(newBoard);

    const log = `${currentTeam.toUpperCase()} revealed: ${card.word} (${card.type.toUpperCase()})`;
    setGameLog(p => [log, ...p.slice(0, 9)]);

    if (card.type === "assassin") {
      setWinner("assassin");
      return;
    }

    // Check win conditions
    const redLeft  = newBoard.filter(c => c.type === "red"  && !c.revealed).length;
    const blueLeft = newBoard.filter(c => c.type === "blue" && !c.revealed).length;
    if (redLeft === 0)  { setWinner("red");  return; }
    if (blueLeft === 0) { setWinner("blue"); return; }

    if (card.type !== currentTeam) setCurrentTeam(t => t === "red" ? "blue" : "red");
  };

  const endTurn = () => {
    setCurrentTeam(t => t === "red" ? "blue" : "red");
    setClue("");
    setGameLog(p => [`${currentTeam.toUpperCase()} ended their turn`, ...p.slice(0, 9)]);
  };

  const redLeft  = board.filter(c => c.type === "red"  && !c.revealed).length;
  const blueLeft = board.filter(c => c.type === "blue" && !c.revealed).length;

  const cardColor = (card: Card) => {
    if (card.revealed) {
      if (card.type === "red")      return "bg-red-600 border-red-500 text-white";
      if (card.type === "blue")     return "bg-blue-600 border-blue-500 text-white";
      if (card.type === "assassin") return "bg-zinc-950 border-zinc-700 text-white";
      return "bg-zinc-600 border-zinc-500 text-white";
    }
    if (spymasterMode) {
      if (card.type === "red")      return "bg-red-900/60 border-red-500/60 text-red-200";
      if (card.type === "blue")     return "bg-blue-900/60 border-blue-500/60 text-blue-200";
      if (card.type === "assassin") return "bg-zinc-900 border-white/20 text-zinc-300 ring-2 ring-white/30";
      return "bg-zinc-800 border-zinc-700 text-zinc-400";
    }
    return "bg-zinc-900 border-zinc-700 text-white hover:border-yellow-400/40 hover:bg-zinc-800 cursor-pointer";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-4xl mx-auto px-3 py-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              🕵️ Codenames
            </h1>
            <p className="text-zinc-500 text-xs">Naija Edition — guess your team's words!</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSpymasterMode(!spymasterMode)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${spymasterMode ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-400"}`}>
              {spymasterMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {spymasterMode ? "Spymaster" : "Operative"}
            </button>
            <button onClick={resetGame} className="flex items-center gap-1 bg-zinc-800 text-zinc-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-zinc-700">
              <RefreshCw className="w-3.5 h-3.5" /> New Game
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 border text-center ${currentTeam === "red" && !winner ? "bg-red-900/30 border-red-500/50" : "bg-zinc-900 border-zinc-800"}`}>
            <div className="text-red-400 font-black text-2xl">{redLeft}</div>
            <div className="text-red-400/70 text-xs font-bold">RED LEFT {currentTeam === "red" && !winner ? "← TURN" : ""}</div>
          </div>
          <div className={`rounded-xl p-3 border text-center ${currentTeam === "blue" && !winner ? "bg-blue-900/30 border-blue-500/50" : "bg-zinc-900 border-zinc-800"}`}>
            <div className="text-blue-400 font-black text-2xl">{blueLeft}</div>
            <div className="text-blue-400/70 text-xs font-bold">BLUE LEFT {currentTeam === "blue" && !winner ? "← TURN" : ""}</div>
          </div>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className={`rounded-2xl p-5 text-center border ${winner === "assassin" ? "bg-zinc-900 border-zinc-600" : winner === "red" ? "bg-red-900/40 border-red-500" : "bg-blue-900/40 border-blue-500"}`}>
            <div className="text-4xl mb-2">{winner === "assassin" ? "💀" : "🏆"}</div>
            <div className="text-white font-black text-xl">
              {winner === "assassin" ? "ASSASSIN! Game Over" : `${winner.toUpperCase()} TEAM WINS!`}
            </div>
            <button onClick={resetGame} className="mt-3 bg-yellow-400 text-black font-black px-6 py-2 rounded-xl hover:bg-yellow-300">
              Play Again
            </button>
          </div>
        )}

        {/* Clue Input (Spymaster) */}
        {spymasterMode && !winner && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex gap-2 items-center">
            <input value={clue} onChange={e => setClue(e.target.value.toUpperCase())} placeholder="Enter clue word..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400" />
            <input type="number" min="1" max="9" value={clueNum} onChange={e => setClueNum(e.target.value)}
              className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none text-center focus:border-yellow-400" />
          </div>
        )}

        {/* Show clue to operatives */}
        {clue && !spymasterMode && (
          <div className={`rounded-xl p-3 text-center border ${currentTeam === "red" ? "bg-red-900/20 border-red-500/30" : "bg-blue-900/20 border-blue-500/30"}`}>
            <span className="text-white font-black text-lg">{clue}</span>
            <span className={`ml-3 font-black text-2xl ${currentTeam === "red" ? "text-red-400" : "text-blue-400"}`}>{clueNum}</span>
          </div>
        )}

        {/* Board */}
        <div className="grid grid-cols-5 gap-1.5">
          {board.map((card, i) => (
            <button key={i} onClick={() => reveal(i)} disabled={card.revealed || !!winner || spymasterMode}
              className={`rounded-xl border p-2 text-[10px] font-black transition-all min-h-[44px] ${cardColor(card)}`}>
              {card.word}
              {spymasterMode && card.type === "assassin" && !card.revealed && <div className="text-[8px] mt-0.5">💀</div>}
            </button>
          ))}
        </div>

        {/* End Turn */}
        {!winner && (
          <button onClick={endTurn}
            className={`w-full py-3 rounded-xl font-black text-sm transition-all ${currentTeam === "red" ? "bg-red-600 hover:bg-red-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
            End {currentTeam.toUpperCase()} Turn →
          </button>
        )}

        {/* Game Log */}
        {gameLog.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1">
            <div className="text-zinc-500 text-xs font-bold mb-2">GAME LOG</div>
            {gameLog.map((log, i) => (
              <div key={i} className={`text-xs ${i === 0 ? "text-white" : "text-zinc-600"}`}>{log}</div>
            ))}
          </div>
        )}

        <Link href="/games" className="block text-center text-zinc-600 text-xs hover:text-zinc-400 pb-4">← Back to Games</Link>
      </main>
    </div>
  );
}
