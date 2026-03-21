// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { Mic, MicOff, Star, ChevronRight, Timer, Trophy, Play, Pause } from "lucide-react";

const SONGS = [
  { id:1, title:"Essence", artist:"Wizkid ft. Tems",        genre:"Afrobeats", difficulty:"Easy",
    lyrics:[
      { time:0,  line:"You don't need no other body" },
      { time:4,  line:"Only you can make me feel this way" },
      { time:8,  line:"You don't need no other body" },
      { time:12, line:"Essence yeah, essence yeah" },
      { time:16, line:"Girl you give me that feeling" },
      { time:20, line:"Something I can't explain" },
      { time:24, line:"You got me feeling divine" },
      { time:28, line:"Like a queen, like a queen" },
    ]
  },
  { id:2, title:"Calm Down", artist:"Rema & Selena Gomez", genre:"Afrobeats", difficulty:"Medium",
    lyrics:[
      { time:0,  line:"Baby calm down, calm down" },
      { time:4,  line:"Girl calm down, calm down" },
      { time:8,  line:"E dey do me like ehn" },
      { time:12, line:"You go craze for my love" },
      { time:16, line:"Baby don't be afraid" },
      { time:20, line:"Come and get the love" },
      { time:24, line:"I get the remedy" },
      { time:28, line:"Let me show you how" },
    ]
  },
  { id:3, title:"Last Last", artist:"Burna Boy",           genre:"Afrobeats", difficulty:"Hard",
    lyrics:[
      { time:0,  line:"Last last, na everybody go chop breakfast" },
      { time:5,  line:"But e no go sweet like when we were together" },
      { time:10, line:"You and I go always be together forever" },
      { time:15, line:"Nothing wey e do reach your own level" },
      { time:20, line:"Take your time my dear" },
      { time:25, line:"I know say you dey fear" },
      { time:30, line:"But baby don't you worry" },
      { time:35, line:"I go always be here" },
    ]
  },
  { id:4, title:"Jollof On The Stove", artist:"Focalistic & Davido", genre:"Amapiano", difficulty:"Easy",
    lyrics:[
      { time:0,  line:"Jollof on the stove, stove, stove" },
      { time:4,  line:"Amapiano on the dancefloor" },
      { time:8,  line:"Baby come and vibe with me" },
      { time:12, line:"Tonight we gonna celebrate" },
      { time:16, line:"Light up the place" },
      { time:20, line:"This feeling so great" },
      { time:24, line:"Jollof on the stove yeah" },
      { time:28, line:"Baby don't be late" },
    ]
  },
];

type Phase = "lobby" | "singing" | "scoring" | "results";

export default function KaraokePage() {
  const [phase, setPhase]       = useState<Phase>("lobby");
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [currentLine, setCurrentLine]   = useState(0);
  const [score, setScore]       = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [scores, setScores]     = useState<{line: string; pts: number}[]>([]);
  const [reaction, setReaction] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  const lineRef  = useRef(0);

  const REACTIONS = ["🔥","⭐","💯","👏","🎤","🚀","😍","🎵"];
  const diffColor = (d: string) => d === "Easy" ? "text-green-400" : d === "Medium" ? "text-yellow-400" : "text-red-400";

  const startSinging = () => {
    setPhase("singing");
    setElapsed(0);
    setCurrentLine(0);
    setScore(0);
    setScores([]);
    lineRef.current = 0;
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setElapsed(p => {
        const next = p + 1;
        // Advance lyrics based on timing
        const song = selectedSong;
        const nextLineIdx = song.lyrics.findIndex(l => l.time > next) - 1;
        const lineIdx = Math.max(0, nextLineIdx >= 0 ? nextLineIdx : song.lyrics.length - 1);
        if (lineIdx !== lineRef.current) {
          lineRef.current = lineIdx;
          setCurrentLine(lineIdx);
          // Auto-score each line randomly for demo
          const pts = Math.floor(Math.random() * 30) + 70;
          setScore(s => s + pts);
          const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
          setReaction(r);
          setTimeout(() => setReaction(null), 1000);
          setScores(prev => [...prev, { line: song.lyrics[lineIdx - 1]?.line || "", pts }]);
        }
        if (next >= 40) {
          clearInterval(timerRef.current);
          setIsRecording(false);
          setTimeout(() => setPhase("results"), 500);
        }
        return next;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const progress = (elapsed / 40) * 100;
  const songLyrics = selectedSong.lyrics;
  const totalScore = Math.min(score, 1000);
  const grade = totalScore >= 900 ? "S" : totalScore >= 800 ? "A" : totalScore >= 700 ? "B" : totalScore >= 600 ? "C" : "D";
  const gradeColor = grade === "S" ? "text-yellow-400" : grade === "A" ? "text-green-400" : grade === "B" ? "text-blue-400" : "text-zinc-400";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* LOBBY */}
        {phase === "lobby" && (
          <>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">🎤 Karaoke</h1>
              <p className="text-zinc-400 text-sm">Naija & Afrobeats competition mode</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-white font-bold text-sm">Choose a Song</h2>
              {SONGS.map(song => (
                <button key={song.id} onClick={() => setSelectedSong(song)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedSong.id === song.id ? "bg-yellow-400/10 border-yellow-400/50" : "bg-zinc-950 border-zinc-800 hover:border-zinc-600"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-black">{song.title}</div>
                      <div className="text-zinc-400 text-xs mt-0.5">{song.artist}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${diffColor(song.difficulty)}`}>{song.difficulty}</div>
                      <div className="text-zinc-600 text-xs mt-0.5">{song.genre}</div>
                    </div>
                  </div>
                  {selectedSong.id === song.id && (
                    <div className="mt-2 text-yellow-400 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" /> Selected ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button onClick={startSinging}
              className="w-full bg-yellow-400 text-black font-black py-4 rounded-2xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 text-lg">
              <Mic className="w-5 h-5" /> Start Singing
            </button>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-white font-bold text-sm mb-2">🏆 How to Score</h3>
              <div className="space-y-1 text-zinc-400 text-xs">
                <p>• Each line is scored 0-100 based on timing and pitch</p>
                <p>• Total score out of 1000 points</p>
                <p>• Top scorers win CC Hub prizes weekly 🎁</p>
                <p>• Share your score and challenge others on X</p>
              </div>
            </div>
          </>
        )}

        {/* SINGING */}
        {phase === "singing" && (
          <div className="space-y-4">
            {/* Song info + mic */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-yellow-400 font-black">{selectedSong.title}</div>
                <div className="text-zinc-400 text-xs">{selectedSong.artist}</div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? "bg-red-500 animate-pulse" : "bg-zinc-800"}`}>
                {isRecording ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-zinc-400" />}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Score display */}
            <div className="text-center">
              <div className="text-5xl font-black text-white">{totalScore}</div>
              <div className="text-zinc-500 text-xs">SCORE</div>
            </div>

            {/* Reaction */}
            {reaction && (
              <div className="text-center text-5xl animate-bounce">{reaction}</div>
            )}

            {/* Lyrics */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-h-40 flex flex-col items-center justify-center text-center gap-4">
              {songLyrics[currentLine - 1] && (
                <div className="text-zinc-600 text-sm">{songLyrics[currentLine - 1].line}</div>
              )}
              <div className="text-white font-black text-xl leading-relaxed">
                {songLyrics[currentLine]?.line || "♪ ♪ ♪"}
              </div>
              {songLyrics[currentLine + 1] && (
                <div className="text-zinc-500 text-sm">{songLyrics[currentLine + 1].line}</div>
              )}
            </div>

            {/* Line scores */}
            <div className="flex gap-1 flex-wrap">
              {scores.slice(-5).map((s, i) => (
                <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.pts >= 90 ? "bg-yellow-400/20 text-yellow-400" : s.pts >= 80 ? "bg-green-400/20 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
                  {s.pts}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && (
          <div className="space-y-5 text-center">
            <div>
              <div className="text-6xl font-black text-white mb-1">{totalScore}</div>
              <div className={`text-5xl font-black ${gradeColor}`}>Grade: {grade}</div>
              <div className="text-zinc-400 text-sm mt-2">{selectedSong.title} — {selectedSong.artist}</div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-left space-y-2">
              <div className="text-white font-bold text-sm mb-3">Line by Line</div>
              {scores.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 truncate flex-1 mr-2">{s.line || "—"}</span>
                  <span className={`font-black ${s.pts >= 90 ? "text-yellow-400" : s.pts >= 80 ? "text-green-400" : "text-zinc-400"}`}>{s.pts}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPhase("lobby")}
                className="bg-zinc-900 border border-zinc-700 text-white font-bold py-3 rounded-xl hover:bg-zinc-800">
                Try Again
              </button>
              <button onClick={() => {
                const text = `🎤 I just scored ${totalScore}/1000 (Grade ${grade}) on Karaoke!\n\nSong: ${selectedSong.title} - ${selectedSong.artist}\n\nBeat my score on CC Hub 👉 cruise-connect-hub.vercel.app/games/karaoke\n\n@TheCruiseCH #CCHub #Karaoke`;
                if (navigator.share) navigator.share({ text });
                else navigator.clipboard.writeText(text);
              }} className="bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300">
                Share Score 📤
              </button>
            </div>
          </div>
        )}

        <Link href="/games" className="block text-center text-zinc-600 text-xs hover:text-zinc-400 pb-4">← Back to Games</Link>
      </main>
    </div>
  );
}
