// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const COLORS = ["red","blue","green","yellow"] as const;
const VALUES = ["0","1","2","3","4","5","6","7","8","9","Skip","Reverse","+2"] as const;
const WILDS = ["Wild","Wild+4"] as const;

type CardColor = typeof COLORS[number] | "wild";
type CardValue = typeof VALUES[number] | typeof WILDS[number];
interface Card { id: string; color: CardColor; value: CardValue; }

const COLOR_CLASSES: Record<CardColor, string> = {
  red:    "bg-red-500 border-red-400",
  blue:   "bg-blue-500 border-blue-400",
  green:  "bg-green-500 border-green-400",
  yellow: "bg-yellow-400 border-yellow-300",
  wild:   "bg-gradient-to-br from-red-500 via-blue-500 to-green-500 border-white",
};

function makeCard(color: CardColor, value: CardValue): Card {
  return { id: `${color}-${value}-${Math.random()}`, color, value };
}

function makeDeck(): Card[] {
  const deck: Card[] = [];
  COLORS.forEach(c => {
    VALUES.forEach(v => {
      deck.push(makeCard(c, v));
      if (v !== "0") deck.push(makeCard(c, v));
    });
  });
  WILDS.forEach(w => {
    for (let i = 0; i < 4; i++) deck.push(makeCard("wild", w));
  });
  return deck.sort(() => Math.random() - 0.5);
}

function canPlay(card: Card, topCard: Card, chosenColor: CardColor | null): boolean {
  if (card.color === "wild") return true;
  if (topCard.color === "wild") return card.color === chosenColor;
  return card.color === topCard.color || card.value === topCard.value;
}

function CardUI({ card, onClick, small = false, faceDown = false }: { card: Card; onClick?: () => void; small?: boolean; faceDown?: boolean }) {
  if (faceDown) return (
    <div className={`${small ? "w-8 h-12" : "w-16 h-24"} bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center cursor-default`}>
      <div className="w-3/4 h-3/4 border-2 border-zinc-600 rounded flex items-center justify-center">
        <span className="text-zinc-500 font-black text-xs">UNO</span>
      </div>
    </div>
  );
  return (
    <button onClick={onClick}
      className={`${small ? "w-8 h-12 text-[10px]" : "w-16 h-24 text-lg"} ${COLOR_CLASSES[card.color]} border-2 rounded-lg flex flex-col items-center justify-between p-1 font-black text-white shadow-lg hover:scale-110 transition-transform active:scale-95 ${onClick ? "cursor-pointer hover:-translate-y-2" : "cursor-default"}`}
      title={`${card.color} ${card.value}`}>
      <span className={small ? "text-[9px]" : "text-xs"}>{card.value}</span>
      <span className={small ? "text-sm" : "text-2xl"}>
        {card.value === "Skip" ? "🚫" : card.value === "Reverse" ? "🔄" : card.value === "+2" ? "+2" : card.value === "Wild" ? "🌈" : card.value === "Wild+4" ? "+4" : card.value}
      </span>
      <span className={small ? "text-[9px]" : "text-xs"}>{card.value}</span>
    </button>
  );
}

const BOT_NAMES = ["Lagos King 👑", "Abuja Babe 💅", "Port Harcourt G 🔥"];

export default function UnoPage() {
  const [deck, setDeck]           = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [botHands, setBotHands]   = useState<Card[][]>([[], [], []]);
  const [pile, setPile]           = useState<Card[]>([]);
  const [turn, setTurn]           = useState(0); // 0=player, 1-3=bots
  const [direction, setDirection] = useState(1);
  const [chosenColor, setChosenColor] = useState<CardColor | null>(null);
  const [pickingColor, setPickingColor] = useState(false);
  const [pendingWild, setPendingWild] = useState<Card | null>(null);
  const [log, setLog]             = useState<string[]>(["Game started! You go first 🚌"]);
  const [gameOver, setGameOver]   = useState<string | null>(null);
  const [unoAlert, setUnoAlert]   = useState<string | null>(null);
  const [started, setStarted]     = useState(false);

  const addLog = (msg: string) => setLog(l => [...l.slice(-8), msg]);

  const startGame = () => {
    const d = makeDeck();
    const p = d.splice(0, 7);
    const b0 = d.splice(0, 7);
    const b1 = d.splice(0, 7);
    const b2 = d.splice(0, 7);
    // First pile card (no wild)
    let firstIdx = d.findIndex(c => c.color !== "wild");
    if (firstIdx === -1) firstIdx = 0;
    const [first] = d.splice(firstIdx, 1);
    setDeck(d); setPlayerHand(p); setBotHands([b0, b1, b2]);
    setPile([first]); setTurn(0); setDirection(1);
    setChosenColor(null); setPickingColor(false); setGameOver(null);
    setLog([`Game started! First card: ${first.color} ${first.value}. Your turn! 🃏`]);
    setStarted(true);
  };

  const drawCard = (handSetter: (fn: (h: Card[]) => Card[]) => void, deckRef: Card[], count = 1): Card[] => {
    const drawn: Card[] = [];
    let d = [...deckRef];
    for (let i = 0; i < count; i++) {
      if (d.length === 0) {
        if (pile.length > 1) { const reshuffled = pile.slice(0, -1).sort(() => Math.random() - 0.5); d = reshuffled; }
        else return drawn;
      }
      drawn.push(d.shift()!);
    }
    handSetter(h => [...h, ...drawn]);
    setDeck(d);
    return drawn;
  };

  const nextTurn = (cur: number, dir: number) => {
    let n = (cur + dir + 4) % 4;
    return n;
  };

  const playCard = (card: Card, fromPlayer = true, botIdx?: number) => {
    const top = pile[pile.length - 1];
    const topColor = top.color === "wild" ? chosenColor : top.color;
    const effectiveTop = { ...top, color: topColor || top.color };
    if (!canPlay(card, effectiveTop as Card, chosenColor)) return;

    if (fromPlayer) setPlayerHand(h => h.filter(c => c.id !== card.id));
    else if (botIdx !== undefined) setBotHands(bh => bh.map((h, i) => i === botIdx ? h.filter(c => c.id !== card.id) : h));

    const newPile = [...pile, card];
    setPile(newPile);

    const playerHandAfter = fromPlayer ? playerHand.filter(c => c.id !== card.id) : playerHand;
    const botHandsAfter = botIdx !== undefined ? botHands.map((h, i) => i === botIdx ? h.filter(c => c.id !== card.id) : h) : botHands;

    // Win check
    if (fromPlayer && playerHandAfter.length === 0) { setGameOver("🎉 You won! Well played!"); return; }
    if (botIdx !== undefined && botHandsAfter[botIdx].length === 0) { setGameOver(`${BOT_NAMES[botIdx]} wins! 😢`); return; }
    if (fromPlayer && playerHandAfter.length === 1) { setUnoAlert("UNO! 🚨"); setTimeout(() => setUnoAlert(null), 1500); }

    // Special cards
    let nextDir = direction;
    let nextT = nextTurn(turn, direction);

    if (card.value === "Reverse") {
      nextDir = direction * -1;
      setDirection(nextDir);
      nextT = nextTurn(turn, nextDir);
      addLog(`${fromPlayer ? "You" : BOT_NAMES[botIdx!]} reversed direction!`);
    } else if (card.value === "Skip") {
      nextT = nextTurn(nextTurn(turn, nextDir), nextDir);
      addLog(`${fromPlayer ? "You" : BOT_NAMES[botIdx!]} skipped next player!`);
    } else if (card.value === "+2") {
      const victim = nextTurn(turn, nextDir);
      if (victim === 0) {
        drawCard(setPlayerHand, deck, 2);
        addLog(`You drew 2 cards! 😬`);
      } else {
        setBotHands(bh => { const newBh = [...bh]; newBh[victim - 1] = [...newBh[victim - 1], ...deck.slice(0, 2)]; return newBh; });
        setDeck(d => d.slice(2));
        addLog(`${BOT_NAMES[victim - 1]} drew 2 cards!`);
      }
      nextT = nextTurn(victim, nextDir);
    } else if (card.color === "wild") {
      if (fromPlayer) { setPendingWild(card); setPickingColor(true); setChosenColor(null); return; }
      // Bot picks most common color
      const botHand = botHandsAfter[botIdx!];
      const counts: Record<string, number> = {};
      botHand.forEach(c => { if (c.color !== "wild") counts[c.color] = (counts[c.color] || 0) + 1; });
      const best = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "red") as CardColor;
      setChosenColor(best);
      addLog(`${BOT_NAMES[botIdx!]} chose ${best}!`);
      if (card.value === "Wild+4") {
        const victim = nextTurn(turn, nextDir);
        if (victim === 0) { drawCard(setPlayerHand, deck, 4); addLog("You drew 4 cards! 😩"); }
        else { setBotHands(bh => { const nb = [...bh]; nb[victim - 1] = [...nb[victim - 1], ...deck.slice(0, 4)]; return nb; }); setDeck(d => d.slice(4)); addLog(`${BOT_NAMES[victim - 1]} drew 4! 💀`); }
        nextT = nextTurn(nextTurn(turn, nextDir), nextDir);
      }
    }

    addLog(`${fromPlayer ? "You" : BOT_NAMES[botIdx!]} played ${card.color} ${card.value}`);
    setTurn(nextT);
  };

  const confirmColor = (color: CardColor) => {
    setChosenColor(color);
    setPickingColor(false);
    const card = pendingWild!;
    const nextDir = direction;
    let nextT = nextTurn(turn, nextDir);
    if (card.value === "Wild+4") {
      const victim = nextTurn(turn, nextDir);
      if (victim !== 0) { setBotHands(bh => { const nb = [...bh]; nb[victim - 1] = [...nb[victim - 1], ...deck.slice(0, 4)]; return nb; }); setDeck(d => d.slice(4)); }
      else { drawCard(setPlayerHand, deck, 4); }
      nextT = nextTurn(victim, nextDir);
    }
    addLog(`You chose ${color}!`);
    setPendingWild(null);
    setTurn(nextT);
  };

  // Bot AI
  useEffect(() => {
    if (!started || turn === 0 || gameOver || pickingColor) return;
    const botIdx = turn - 1;
    const timer = setTimeout(() => {
      const top = pile[pile.length - 1];
      const hand = botHands[botIdx];
      const playable = hand.filter(c => canPlay(c, top, chosenColor));
      if (playable.length > 0) {
        const pick = playable[Math.floor(Math.random() * playable.length)];
        playCard(pick, false, botIdx);
      } else {
        const drawn = drawCard(bh => setBotHands(bh), deck, 1);
        addLog(`${BOT_NAMES[botIdx]} drew a card`);
        setTurn(nextTurn(turn, direction));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [turn, started, gameOver, pickingColor]);

  const topCard = pile[pile.length - 1];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/games" className="text-zinc-500 hover:text-white text-sm">← Games</Link>
            <h1 className="text-2xl font-black text-white">UNO 🃏</h1>
          </div>
          <button onClick={startGame} className="bg-yellow-400 text-black font-black px-4 py-2 rounded-full text-sm hover:bg-yellow-300">
            {started ? "Restart" : "Start Game"}
          </button>
        </div>

        {!started ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🃏</div>
            <h2 className="text-white font-black text-2xl mb-2">UNO!</h2>
            <p className="text-zinc-400 text-sm mb-6">Play against 3 bots. First to empty their hand wins. Match color or number, call UNO on your last card!</p>
            <button onClick={startGame} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300">
              Deal Cards 🃏
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Game Over */}
            {gameOver && (
              <div className="bg-yellow-400/20 border border-yellow-400 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">{gameOver.includes("You won") ? "🏆" : "😢"}</div>
                <div className="text-white font-black text-xl">{gameOver}</div>
                <button onClick={startGame} className="mt-4 bg-yellow-400 text-black font-black px-6 py-2 rounded-full">Play Again</button>
              </div>
            )}

            {unoAlert && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white font-black text-2xl px-6 py-3 rounded-2xl z-50 animate-bounce">{unoAlert}</div>
            )}

            {/* Bots */}
            <div className="grid grid-cols-3 gap-2">
              {BOT_NAMES.map((name, i) => (
                <div key={i} className={`bg-zinc-900 border rounded-xl p-3 text-center transition-all ${turn === i + 1 ? "border-yellow-400 bg-yellow-400/5" : "border-zinc-800"}`}>
                  <div className="text-xs text-zinc-400 font-bold mb-1 truncate">{name}</div>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {botHands[i].slice(0, Math.min(botHands[i].length, 7)).map((_, j) => (
                      <div key={j} className="w-4 h-6 bg-zinc-700 rounded border border-zinc-600" />
                    ))}
                  </div>
                  <div className="text-white font-black text-sm">{botHands[i].length} cards</div>
                  {turn === i + 1 && <div className="text-yellow-400 text-[10px] font-bold mt-0.5 animate-pulse">THINKING...</div>}
                </div>
              ))}
            </div>

            {/* Pile + Draw */}
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="text-zinc-500 text-xs mb-2">DRAW PILE ({deck.length})</div>
                <button onClick={() => {
                  if (turn !== 0) return;
                  drawCard(setPlayerHand, deck, 1);
                  addLog("You drew a card");
                  setTurn(nextTurn(0, direction));
                }} disabled={turn !== 0}>
                  <CardUI card={{ id:"back", color:"wild", value:"Wild" }} faceDown />
                </button>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-xs mb-2">
                  DISCARD {topCard?.color === "wild" && chosenColor ? `(${chosenColor})` : ""}
                </div>
                {topCard && <CardUI card={{ ...topCard, ...(topCard.color === "wild" && chosenColor ? { color: chosenColor } : {}) }} />}
              </div>
            </div>

            {/* Turn indicator */}
            <div className={`text-center py-2 px-4 rounded-xl text-sm font-bold ${turn === 0 ? "bg-yellow-400/20 text-yellow-400" : "bg-zinc-900 text-zinc-500"}`}>
              {turn === 0 ? "⚡ Your turn!" : `Waiting for ${BOT_NAMES[turn - 1]}...`}
            </div>

            {/* Color Picker */}
            {pickingColor && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <div className="text-white font-black text-center mb-3">Choose a color</div>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => confirmColor(c)}
                      className={`${COLOR_CLASSES[c]} h-12 rounded-xl font-black text-white text-sm capitalize hover:scale-105 transition-transform`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Player Hand */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="text-zinc-400 text-xs font-bold mb-3">YOUR HAND ({playerHand.length} cards)</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {playerHand.map(card => (
                  <CardUI key={card.id} card={card}
                    onClick={turn === 0 && !pickingColor && !gameOver ? () => {
                      const top = pile[pile.length - 1];
                      if (canPlay(card, top, chosenColor)) playCard(card, true);
                      else addLog("Can't play that card!");
                    } : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Log */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs font-bold mb-2">GAME LOG</div>
              {log.slice(-5).map((l, i) => (
                <div key={i} className="text-zinc-400 text-xs py-0.5">{l}</div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
