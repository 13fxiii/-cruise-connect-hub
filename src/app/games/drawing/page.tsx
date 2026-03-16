// @ts-nocheck
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Eraser, Trash2, ChevronRight, Trophy } from "lucide-react";

const WORDS = [
  "Jollof Rice","Danfo Bus","Lagos Traffic","Suya","Agbada","Ankara","Harmattan","Generator","Naira","Okada",
  "Afrobeats","Nollywood","Bode Market","Third Mainland Bridge","Aso Rock","Victor Osimhen","Wizkid","Burna Boy",
  "Pepper Soup","Egusi","Pounded Yam","Chin Chin","Pure Water","Yellow Bus","Fuel Queue","NEPA",
  "Football","Basketball","Highlife","Fela Kuti","Drum","Microphone","Stage","Audience",
];

const COLORS_PALETTE = [
  "#000000","#ffffff","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899",
  "#78716c","#6b7280","#d97706","#065f46","#1e40af","#7c3aed","#be185d",
];

const BRUSH_SIZES = [2, 5, 10, 20];

const PLAYERS = [
  { id: "you", name: "You", score: 0, avatar: "😎" },
  { id: "b1",  name: "Lagos King", score: 0, avatar: "👑" },
  { id: "b2",  name: "Abuja Babe", score: 0, avatar: "💅" },
  { id: "b3",  name: "PH G", score: 0, avatar: "🔥" },
];

const GUESSES_FOR_WORD: Record<string, string[]> = {
  "Jollof Rice": ["jollof", "rice", "food", "naija food", "jollof rice"],
  "Danfo Bus": ["bus", "danfo", "yellow bus", "transport"],
  "Lagos Traffic": ["traffic", "hold up", "jam", "lagos"],
  "Suya": ["suya", "meat", "bbq", "grilled"],
  "Afrobeats": ["music", "afrobeats", "beats", "naija music"],
};

export default function DrawingPage() {
  const canvasRef             = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor]     = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [erasing, setErasing] = useState(false);
  const [word, setWord]       = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound]     = useState(1);
  const [phase, setPhase]     = useState<"lobby"|"drawing"|"guessing"|"reveal">("lobby");
  const [guess, setGuess]     = useState("");
  const [guesses, setGuesses] = useState<{player:string;text:string;correct?:boolean}[]>([]);
  const [scores, setScores]   = useState([0, 0, 0, 0]);
  const [drawer, setDrawer]   = useState(0); // 0=you, 1-3=bots
  const [message, setMessage] = useState("");
  const lastPos               = useRef<{x:number;y:number}|null>(null);

  const getCanvas = () => canvasRef.current?.getContext("2d");

  const clearCanvas = () => {
    const ctx = getCanvas();
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => { if (phase === "drawing") clearCanvas(); }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || drawer !== 0) return;
    setDrawing(true);
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !canvasRef.current || drawer !== 0) return;
    const ctx = getCanvas();
    if (!ctx) return;
    const pos = getPos(e, canvasRef.current);
    if (!lastPos.current) { lastPos.current = pos; return; }
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = erasing ? "#ffffff" : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { setDrawing(false); lastPos.current = null; };

  // Timer
  useEffect(() => {
    if (phase !== "drawing" && phase !== "guessing") return;
    if (timeLeft <= 0) { setPhase("reveal"); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  // Bot guesses
  useEffect(() => {
    if (phase !== "guessing" || drawer === 0) return;
    const botGuessers = [1, 2, 3].filter(i => i !== drawer);
    botGuessers.forEach((_, idx) => {
      const delay = 3000 + idx * 2500 + Math.random() * 2000;
      const timer = setTimeout(() => {
        const correct = Math.random() > 0.4;
        const playerName = PLAYERS[idx + (idx >= drawer - 1 ? 1 : 0)]?.name || "Bot";
        const guessText = correct ? word : ["Hmm...", "Is it food?", "A person?", "Something Nigerian?"][Math.floor(Math.random() * 4)];
        setGuesses(g => [...g, { player: playerName, text: guessText, correct }]);
        if (correct) {
          setScores(s => { const ns = [...s]; ns[idx + 1] += 100; return ns; });
          setMessage(`${playerName} guessed it! 🎉`);
        }
      }, delay);
      return () => clearTimeout(timer);
    });
  }, [phase, drawer]);

  const startRound = () => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setTimeLeft(60);
    setGuesses([]);
    setMessage("");
    if (round % 4 === 1) setDrawer(0);
    else setDrawer(((round - 1) % 4));
    setPhase(drawer === 0 ? "drawing" : "guessing");
    setPhase("drawing");
    setDrawer(0); // Always player draws first for demo
  };

  const submitGuess = () => {
    if (!guess.trim()) return;
    const correct = (GUESSES_FOR_WORD[word] || [word.toLowerCase()]).some(g => guess.toLowerCase().includes(g));
    setGuesses(gs => [...gs, { player: "You", text: guess, correct }]);
    if (correct) {
      setScores(s => { const ns = [...s]; ns[0] += 150; return ns; });
      setMessage("You got it! 🎉 +150 pts");
    }
    setGuess("");
  };

  const HINT = word ? word.split("").map((c, i) => (i === 0 || c === " " || (timeLeft < 20 && i === word.length - 1)) ? c : "_").join("") : "";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/games" className="text-zinc-500 hover:text-white text-sm">← Games</Link>
            <h1 className="text-2xl font-black text-white">Drawing Game 🎨</h1>
          </div>
          {phase !== "lobby" && (
            <div className={`px-3 py-1.5 rounded-full text-sm font-black ${timeLeft <= 10 ? "bg-red-500 text-white animate-pulse" : "bg-zinc-800 text-white"}`}>
              ⏱ {timeLeft}s
            </div>
          )}
        </div>

        {phase === "lobby" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-white font-black text-2xl mb-2">Draw & Guess</h2>
            <p className="text-zinc-400 text-sm mb-4">Draw a word and your opponents guess it! Naija-themed words — can you draw Jollof Rice? 😂</p>
            <div className="flex justify-center gap-4 mb-6">
              {PLAYERS.map((p, i) => (
                <div key={p.id} className="text-center">
                  <div className="text-2xl">{p.avatar}</div>
                  <div className="text-white text-xs font-bold mt-1">{p.name}</div>
                  <div className="text-yellow-400 text-xs">{scores[i]} pts</div>
                </div>
              ))}
            </div>
            <button onClick={startRound} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300">
              Start Drawing 🎨
            </button>
          </div>
        )}

        {(phase === "drawing" || phase === "guessing") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              {/* Word display */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
                {drawer === 0 ? (
                  <div><span className="text-zinc-400 text-xs">DRAW THIS: </span><span className="text-yellow-400 font-black text-lg">{word}</span></div>
                ) : (
                  <div><span className="text-zinc-400 text-xs">GUESS: </span><span className="text-white font-black text-lg tracking-widest">{HINT}</span></div>
                )}
              </div>

              {/* Canvas */}
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-zinc-700">
                <canvas ref={canvasRef} width={600} height={400}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                />
              </div>

              {/* Tools (only for drawer) */}
              {drawer === 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center gap-3">
                  <div className="flex gap-1">
                    {COLORS_PALETTE.map(c => (
                      <button key={c} onClick={() => { setColor(c); setErasing(false); }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c && !erasing ? "border-white scale-125" : "border-transparent"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {BRUSH_SIZES.map(s => (
                      <button key={s} onClick={() => { setBrushSize(s); setErasing(false); }}
                        className={`w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center ${brushSize === s && !erasing ? "border border-yellow-400" : ""}`}>
                        <div className="bg-white rounded-full" style={{ width: Math.min(s, 20), height: Math.min(s, 20) }} />
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setErasing(!erasing)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${erasing ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-300"}`}>
                    <Eraser className="w-3 h-3" /> Erase
                  </button>
                  <button onClick={clearCanvas}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-700">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar — guesses + scores */}
            <div className="space-y-3">
              {/* Scores */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="text-zinc-400 text-xs font-bold mb-2">SCORES</div>
                {PLAYERS.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 py-1">
                    <span className="text-lg">{p.avatar}</span>
                    <span className="text-white text-xs font-bold flex-1">{p.name}</span>
                    <span className="text-yellow-400 font-black text-sm">{scores[i]}</span>
                  </div>
                ))}
              </div>

              {/* Chat / guesses */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-col" style={{minHeight: 200}}>
                <div className="text-zinc-400 text-xs font-bold mb-2">GUESSES</div>
                {message && <div className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold px-2 py-1.5 rounded-lg mb-2">{message}</div>}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-32">
                  {guesses.map((g, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded-lg ${g.correct ? "bg-green-500/10 text-green-400" : "text-zinc-400"}`}>
                      <span className="font-bold">{g.player}:</span> {g.text} {g.correct && "✅"}
                    </div>
                  ))}
                </div>
                {drawer !== 0 && (
                  <div className="flex gap-2 mt-2">
                    <input value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && submitGuess()}
                      placeholder="Type your guess..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-yellow-400" />
                    <button onClick={submitGuess} className="bg-yellow-400 text-black font-black px-3 py-1.5 rounded-lg text-xs">→</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "reveal" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">🎨</div>
            <h2 className="text-white font-black text-xl">Round {round} Over!</h2>
            <div className="text-zinc-400">The word was: <span className="text-yellow-400 font-black text-lg">{word}</span></div>
            <div className="grid grid-cols-4 gap-3">
              {PLAYERS.map((p, i) => (
                <div key={p.id} className="bg-zinc-900 rounded-xl p-3 text-center">
                  <div className="text-2xl">{p.avatar}</div>
                  <div className="text-white font-bold text-xs mt-1">{p.name}</div>
                  <div className="text-yellow-400 font-black">{scores[i]}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setRound(r => r + 1); startRound(); }}
              className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300">
              Next Round <ChevronRight className="inline w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
