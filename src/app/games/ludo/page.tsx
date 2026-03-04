"use client";
import { useState, useCallback } from "react";
import { ArrowLeft, RotateCcw, Trophy, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const COLORS = ["#ef4444","#3b82f6","#22c55e","#eab308"];
const COLOR_NAMES = ["Red","Blue","Green","Yellow"];
const COLOR_TEXT = ["text-red-400","text-blue-400","text-green-400","text-yellow-400"];
const COLOR_BG = ["bg-red-500/20","bg-blue-500/20","bg-green-500/20","bg-yellow-500/20"];
const COLOR_BORDER = ["border-red-500","border-blue-500","border-green-500","border-yellow-400"];
const COLOR_SOLID = ["bg-red-500","bg-blue-500","bg-green-500","bg-yellow-400"];
const EMOJIS = ["🔴","🔵","🟢","🟡"];

// 52 main path + 6 home column per player = 76 total virtual positions
const TRACK = 52;
const HOME_STEPS = 6;
// Each player starts at different offset
const START_OFFSETS = [0, 13, 26, 39];
// Safe cells (absolute positions)
const SAFE = new Set([0,13,26,39,8,21,34,47]);

type Piece = { pos: number; finished: boolean }; // pos: -1=yard, 0-51=track(relative), 52-57=home col
type Player = { id: number; pieces: Piece[]; done: number };

function initPlayer(id: number): Player {
  return { id, pieces: [{pos:-1,finished:false},{pos:-1,finished:false},{pos:-1,finished:false},{pos:-1,finished:false}], done:0 };
}

// Map a player's relative position to absolute board position
function relToAbs(playerId: number, rel: number): number {
  return (rel + START_OFFSETS[playerId]) % TRACK;
}

const DiceComponents = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function LudoPage() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<"setup"|"playing"|"won">("setup");
  const [current, setCurrent] = useState(0);
  const [dice, setDice] = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [movable, setMovable] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<number|null>(null);
  const [extraTurn, setExtraTurn] = useState(false);

  const addLog = (msg: string) => setLog(l => [msg, ...l].slice(0, 12));

  const startGame = () => {
    setPlayers(Array.from({length: numPlayers}, (_, i) => initPlayer(i)));
    setCurrent(0); setDice(null); setRolled(false); setMovable([]); setWinner(null);
    setLog(["🎲 Game started! Red goes first."]);
    setPhase("playing");
  };

  const computeMovable = (ps: Player[], cur: number, val: number): number[] => {
    const p = ps[cur];
    const can: number[] = [];
    p.pieces.forEach((piece, idx) => {
      if (piece.finished) return;
      if (piece.pos === -1 && val === 6) { can.push(idx); return; }
      if (piece.pos >= 0) {
        const newPos = piece.pos + val;
        if (newPos <= TRACK + HOME_STEPS - 1) can.push(idx);
      }
    });
    return can;
  };

  const rollDice = useCallback(() => {
    if (rolling || rolled) return;
    setRolling(true);
    let cnt = 0;
    const iv = setInterval(() => {
      cnt++;
      setDice(Math.ceil(Math.random() * 6));
      if (cnt >= 10) {
        clearInterval(iv);
        const val = Math.ceil(Math.random() * 6);
        setDice(val);
        setRolling(false);
        setRolled(true);
        setExtraTurn(val === 6);
        setPlayers(prev => {
          const can = computeMovable(prev, current, val);
          setMovable(can);
          if (can.length === 0) {
            setTimeout(() => {
              addLog(`${EMOJIS[current]} ${COLOR_NAMES[current]} rolled ${val} — no moves, skipping.`);
              setRolled(false); setDice(null); setMovable([]);
              if (val !== 6) setCurrent(c => (c + 1) % numPlayers);
            }, 800);
          } else {
            addLog(`${EMOJIS[current]} ${COLOR_NAMES[current]} rolled ${val}${val===6?" 🎉 (bonus turn)":""}!`);
          }
          return prev;
        });
      }
    }, 70);
  }, [rolling, rolled, current, numPlayers]);

  const movePiece = (pieceIdx: number) => {
    if (!rolled || !movable.includes(pieceIdx) || dice === null) return;
    const d = dice;

    setPlayers(prev => {
      const next = prev.map(p => ({ ...p, pieces: p.pieces.map(pc => ({ ...pc })) }));
      const p = next[current];
      const piece = p.pieces[pieceIdx];

      if (piece.pos === -1) {
        piece.pos = 0;
        addLog(`${EMOJIS[current]} ${COLOR_NAMES[current]} enters the board!`);
      } else {
        piece.pos += d;
        if (piece.pos >= TRACK + HOME_STEPS - 1) {
          piece.pos = TRACK + HOME_STEPS - 1;
          piece.finished = true;
          p.done++;
          addLog(`🏆 ${COLOR_NAMES[current]} piece ${pieceIdx+1} finishes! (${p.done}/4)`);
          if (p.done === 4) {
            setWinner(current);
            setPhase("won");
            return next;
          }
        } else {
          // Check capture (simplified)
          const absNew = relToAbs(current, piece.pos);
          if (!SAFE.has(absNew)) {
            next.forEach((op, oi) => {
              if (oi === current) return;
              op.pieces.forEach(opc => {
                if (!opc.finished && opc.pos >= 0 && opc.pos < TRACK) {
                  const opAbs = relToAbs(oi, opc.pos);
                  if (opAbs === absNew) {
                    opc.pos = -1;
                    addLog(`💥 ${COLOR_NAMES[current]} captures ${COLOR_NAMES[oi]}!`);
                  }
                }
              });
            });
          }
          addLog(`${EMOJIS[current]} moves to cell ${piece.pos}`);
        }
      }
      return next;
    });

    setMovable([]); setRolled(false); setDice(null);
    if (!extraTurn) setCurrent(c => (c + 1) % numPlayers);
  };

  const DIcon = dice ? DiceComponents[dice - 1] : null;

  // --- SETUP SCREEN ---
  if (phase === "setup") return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-10">
        <Link href="/games" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </Link>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-3xl font-black text-white mb-2">Ludo Board</h1>
          <p className="text-zinc-400 mb-8">Classic Ludo — 2 to 4 players. Get all 4 pieces home to win!</p>
          <p className="text-sm font-bold text-zinc-300 mb-3">Select Number of Players</p>
          <div className="flex justify-center gap-4 mb-8">
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)}
                className={`w-16 h-16 rounded-2xl font-black text-2xl transition-all border-2 ${numPlayers === n ? "bg-yellow-400 text-black border-yellow-400 scale-110" : "bg-zinc-800 text-white border-zinc-700 hover:border-zinc-500"}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {Array.from({ length: numPlayers }, (_, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border ${COLOR_BORDER[i]} ${COLOR_BG[i]}`}>
                <span className="text-2xl">{EMOJIS[i]}</span>
                <div className="text-left">
                  <div className={`font-bold ${COLOR_TEXT[i]}`}>{COLOR_NAMES[i]}</div>
                  <div className="text-xs text-zinc-500">Player {i + 1}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={startGame} className="bg-yellow-400 text-black font-black px-12 py-4 rounded-full text-lg hover:bg-yellow-300 transition-all hover:scale-105">
            🎲 Start Game
          </button>
        </div>
      </main>
    </div>
  );

  // --- WIN SCREEN ---
  if (phase === "won" && winner !== null) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Navbar />
      <div className="text-center px-6 mt-16">
        <div className="text-8xl mb-4 animate-bounce">{EMOJIS[winner]}</div>
        <div className="text-6xl mb-2">🏆</div>
        <h1 className="text-4xl font-black text-yellow-400 mb-3">{COLOR_NAMES[winner]} Wins!</h1>
        <p className="text-zinc-400 mb-8">All 4 pieces made it home. Legendary run! 🔥</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => setPhase("setup")} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300">Play Again</button>
          <Link href="/games" className="bg-zinc-800 text-white font-bold px-8 py-3 rounded-full hover:bg-zinc-700">All Games</Link>
        </div>
      </div>
    </div>
  );

  // --- PLAYING SCREEN ---
  const curPlayer = players[current];
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" /> Games</Link>
          <button onClick={() => setPhase("setup")} className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 text-sm"><RotateCcw className="w-4 h-4" /> New Game</button>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* BOARD */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 overflow-hidden">
            {/* 15x15 visual grid */}
            <div className="w-full aspect-square grid gap-px" style={{ gridTemplateColumns: "repeat(15, 1fr)" }}>
              {Array.from({ length: 15 }, (_, r) =>
                Array.from({ length: 15 }, (_, c) => {
                  // Determine cell type
                  const inRedHome = r >= 9 && r <= 13 && c >= 1 && c <= 5;
                  const inBlueHome = r >= 1 && r <= 5 && c >= 9 && c <= 13;
                  const inGreenHome = r >= 1 && r <= 5 && c >= 1 && c <= 5;
                  const inYellowHome = r >= 9 && r <= 13 && c >= 9 && c <= 13;
                  const inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
                  const isHPath = (r === 6 || r === 8) && !(inCenter);
                  const isVPath = (c === 6 || c === 8) && !(inCenter);

                  // Home column coloring
                  const isRedHomeCol = c === 7 && r >= 9 && r <= 13;
                  const isBlueHomeCol = r === 7 && c >= 9 && c <= 13;
                  const isGreenHomeCol = c === 7 && r >= 1 && r <= 5;
                  const isYellowHomeCol = r === 7 && c >= 1 && c <= 5;

                  // Pieces at this cell (simplified home display)
                  const homePieces: number[] = [];
                  players.forEach((p, pi) => {
                    if ((pi===0&&inRedHome)||(pi===1&&inBlueHome)||(pi===2&&inGreenHome)||(pi===3&&inYellowHome)) {
                      const yardPieces = p.pieces.filter(pc => pc.pos === -1);
                      if (yardPieces.length > 0 && r === (pi===0?11:pi===1?3:pi===2?3:11) && c === (pi===0?3:pi===1?11:pi===2?3:11)) {
                        homePieces.push(pi);
                      }
                    }
                  });

                  // On-board pieces
                  const boardPieces: number[] = [];
                  players.forEach((p, pi) => {
                    p.pieces.forEach(pc => {
                      if (pc.pos >= 0 && !pc.finished) {
                        const abs = relToAbs(pi, pc.pos < TRACK ? pc.pos : TRACK - 1);
                        // Map abs (0-51) to grid — simplified
                      }
                    });
                  });

                  let bg = "bg-zinc-800";
                  if (inCenter) bg = "bg-zinc-700";
                  else if (inRedHome) bg = "bg-red-950";
                  else if (inBlueHome) bg = "bg-blue-950";
                  else if (inGreenHome) bg = "bg-green-950";
                  else if (inYellowHome) bg = "bg-yellow-950";
                  else if (isRedHomeCol) bg = "bg-red-700/40";
                  else if (isBlueHomeCol) bg = "bg-blue-700/40";
                  else if (isGreenHomeCol) bg = "bg-green-700/40";
                  else if (isYellowHomeCol) bg = "bg-yellow-700/40";
                  else if (isHPath || isVPath) bg = "bg-zinc-600";

                  // Center trophy
                  const isAbsCenter = r === 7 && c === 7;

                  // Home base centers
                  const isRedBase = r===11&&c===3;
                  const isBlueBase = r===3&&c===11;
                  const isGreenBase = r===3&&c===3;
                  const isYellowBase = r===11&&c===11;

                  // Count pieces in yard
                  const getYardCount = (pi: number) => players[pi]?.pieces.filter(pc=>pc.pos===-1).length ?? 0;

                  return (
                    <div key={`${r}-${c}`} className={`${bg} rounded-[2px] flex items-center justify-center relative`} style={{ aspectRatio: "1" }}>
                      {isAbsCenter && <Trophy className="w-3 h-3 text-yellow-400" />}
                      {isRedBase && getYardCount(0) > 0 && <span style={{fontSize:"9px"}}>{EMOJIS[0]}<sup style={{fontSize:"7px"}}>{getYardCount(0)}</sup></span>}
                      {isBlueBase && getYardCount(1) > 0 && numPlayers > 1 && <span style={{fontSize:"9px"}}>{EMOJIS[1]}<sup style={{fontSize:"7px"}}>{getYardCount(1)}</sup></span>}
                      {isGreenBase && getYardCount(2) > 0 && numPlayers > 2 && <span style={{fontSize:"9px"}}>{EMOJIS[2]}<sup style={{fontSize:"7px"}}>{getYardCount(2)}</sup></span>}
                      {isYellowBase && getYardCount(3) > 0 && numPlayers > 3 && <span style={{fontSize:"9px"}}>{EMOJIS[3]}<sup style={{fontSize:"7px"}}>{getYardCount(3)}</sup></span>}
                      {/* Safe star markers */}
                      {((r===8&&c===2)||(r===6&&c===12)||(r===2&&c===6)||(r===12&&c===8)) && <span style={{fontSize:"7px"}}>⭐</span>}
                    </div>
                  );
                })
              )}
            </div>

            {/* On-board pieces display */}
            <div className="mt-3 flex flex-wrap gap-2">
              {players.map((p, pi) => (
                <div key={pi} className={`flex-1 min-w-0 rounded-xl p-2 ${COLOR_BG[pi]} border ${COLOR_BORDER[pi]}`}>
                  <div className={`text-xs font-bold ${COLOR_TEXT[pi]} mb-1`}>{EMOJIS[pi]} {COLOR_NAMES[pi]} {p.done > 0 && `✓${p.done}/4`}</div>
                  <div className="flex gap-1">
                    {p.pieces.map((pc, pci) => (
                      <button key={pci} onClick={() => movePiece(pci)}
                        className={`w-8 h-8 rounded-full text-xs font-black border transition-all
                          ${pc.finished ? "bg-green-500 border-green-400 text-black" : pc.pos === -1 ? "bg-zinc-700 border-zinc-600 text-zinc-300" : `${COLOR_SOLID[pi]} border-white/30 text-black`}
                          ${pi===current&&rolled&&movable.includes(pci)?"scale-125 border-yellow-400 shadow-lg shadow-yellow-400/50 animate-bounce cursor-pointer":"cursor-default"}`}>
                        {pc.finished ? "✓" : pc.pos === -1 ? "H" : pc.pos}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GAME PANEL */}
          <div className="space-y-4">
            {/* Turn indicator */}
            <div className={`border-2 ${COLOR_BORDER[current]} ${COLOR_BG[current]} rounded-2xl p-4`}>
              <div className="text-xs text-zinc-400 uppercase mb-1">Now Playing</div>
              <div className={`text-2xl font-black ${COLOR_TEXT[current]}`}>{EMOJIS[current]} {COLOR_NAMES[current]}</div>
              {rolled && movable.length > 0 && <div className="text-xs text-yellow-400 mt-1 animate-pulse">👆 Tap a piece below to move</div>}
              {extraTurn && rolled && <div className="text-xs text-green-400 mt-1">🎉 Rolled 6 — bonus turn!</div>}
            </div>

            {/* Dice */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
              <div className="h-20 flex items-center justify-center mb-3">
                {DIcon ? <DIcon className={`w-20 h-20 ${rolling ? "animate-spin text-zinc-400" : COLOR_TEXT[current]}`} /> :
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-600 flex items-center justify-center">
                    <span className="text-zinc-500 text-3xl">?</span>
                  </div>}
              </div>
              {dice && !rolling && <div className="text-3xl font-black text-white mb-1">{dice}</div>}
              <button onClick={rollDice} disabled={rolling || rolled}
                className={`w-full py-3 rounded-full font-black text-lg transition-all
                  ${(!rolling && !rolled) ? "bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}>
                {rolling ? "🎲 Rolling..." : rolled ? "Pick Your Piece 👆" : "Roll Dice 🎲"}
              </button>
            </div>

            {/* Progress */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-zinc-400 uppercase mb-3">Progress</div>
              {players.map((p, pi) => (
                <div key={pi} className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{EMOJIS[pi]}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${COLOR_SOLID[pi]} transition-all`} style={{ width: `${(p.done / 4) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${COLOR_TEXT[pi]}`}>{p.done}/4</span>
                </div>
              ))}
            </div>

            {/* Log */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-zinc-400 uppercase mb-2">Game Log</div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {log.map((msg, i) => (
                  <div key={i} className={`text-xs ${i === 0 ? "text-white" : "text-zinc-500"}`}>{msg}</div>
                ))}
                {log.length === 0 && <div className="text-xs text-zinc-600">Events will appear here</div>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
