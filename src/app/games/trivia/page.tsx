"use client";
import { useState, useEffect, useCallback } from "react";
import { Brain, Clock, Trophy, Users, Zap, ArrowRight, CheckCircle, XCircle, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const QUESTION_BANK = [
  { id:1, q:"What is Nigeria's capital city?", options:["Lagos","Abuja","Kano","Port Harcourt"], answer:1, category:"Naija" },
  { id:2, q:"Which Nigerian musician released 'Ye' in 2018?", options:["Wizkid","Davido","Burna Boy","Olamide"], answer:2, category:"Music" },
  { id:3, q:"What year did Nigeria gain independence?", options:["1958","1960","1963","1965"], answer:1, category:"Naija" },
  { id:4, q:"What does 'Oya' mean in Nigerian slang?", options:["No","Come on / Let's go","Later","Maybe"], answer:1, category:"Naija" },
  { id:5, q:"Which city is called 'The City of Aquatic Splendor'?", options:["Abuja","Calabar","Lagos","Ibadan"], answer:1, category:"Naija" },
  { id:6, q:"Afrobeats originated from which country?", options:["Ghana","USA","Nigeria","South Africa"], answer:2, category:"Music" },
  { id:7, q:"What does 'Wahala' mean?", options:["Money","Trouble / Problem","Party","Food"], answer:1, category:"Naija" },
  { id:8, q:"Who is known as 'The African Giant'?", options:["Wizkid","Davido","Burna Boy","Tiwa Savage"], answer:2, category:"Music" },
  { id:9, q:"What is Jollof Rice contested between Nigeria and?", options:["Cameroon","Ghana","Senegal","Togo"], answer:1, category:"Food" },
  { id:10, q:"What does CRUISING mean in Nigerian context?", options:["Driving fast","Chilling/having a good time","Working hard","Running"], answer:1, category:"Naija" },
  { id:11, q:"Which river is the longest in Nigeria?", options:["Benue River","Niger River","Cross River","Kaduna River"], answer:1, category:"Naija" },
  { id:12, q:"What currency does Nigeria use?", options:["Cedis","Shillings","Naira","Rand"], answer:2, category:"Naija" },
  { id:13, q:"'Eze goes to school' is a story from which country?", options:["Ghana","Nigeria","Kenya","South Africa"], answer:1, category:"Naija" },
  { id:14, q:"What does 'Sabi' mean in Nigerian Pidgin?", options:["Know / Be good at","Eat","Sleep","Run"], answer:0, category:"Naija" },
  { id:15, q:"Wizkid's debut album is called?", options:["Sounds from the Other Side","Superstar","Made in Lagos","More Love Less Ego"], answer:1, category:"Music" },
];

type Phase = "lobby"|"countdown"|"playing"|"result"|"final";

export default function TriviaPage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [questions, setQuestions] = useState<typeof QUESTION_BANK>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [countdown, setCountdown] = useState(3);
  const [answers, setAnswers] = useState<{correct:boolean; selected:number|null}[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

  const startGame = () => {
    const qs = shuffle(QUESTION_BANK).slice(0, 10);
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setSelected(null);
    setAnswers([]);
    setStreak(0);
    setBestStreak(0);
    setCountdown(3);
    setPhase("countdown");
  };

  // Countdown before game
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("playing"); setTimeLeft(15); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Question timer
  useEffect(() => {
    if (phase !== "playing" || selected !== null) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, selected]);

  const handleAnswer = useCallback((idx: number|null) => {
    if (selected !== null) return;
    const q = questions[qIdx];
    const correct = idx === q.answer;
    setSelected(idx);
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);
    if (correct) setScore(s => s + Math.max(100, timeLeft * 10) + (newStreak > 1 ? newStreak * 50 : 0));
    setAnswers(a => [...a, { correct, selected: idx }]);

    setTimeout(() => {
      if (qIdx + 1 >= questions.length) { setPhase("final"); }
      else { setQIdx(i => i + 1); setSelected(null); setTimeLeft(15); }
    }, 1500);
  }, [selected, questions, qIdx, timeLeft, streak, bestStreak]);

  const q = questions[qIdx];
  const pct = ((qIdx + (selected !== null ? 1 : 0)) / (questions.length || 10)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* LOBBY */}
        {phase === "lobby" && (
          <div className="text-center">
            <div className="text-7xl mb-6">🧠</div>
            <h1 className="text-4xl font-black text-white mb-2">Trivia Challenge</h1>
            <p className="text-zinc-400 mb-8">10 questions · 15 seconds each · Naija & General Knowledge</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[["10", "Questions"],["15s","Per Question"],["₦25K","Prize Pool"]].map(([v,l]) => (
                <div key={l} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="text-2xl font-black text-yellow-400">{v}</div>
                  <div className="text-xs text-zinc-400">{l}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 text-left">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> How Scoring Works</h3>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>⚡ Answer faster = more points (up to 150 bonus pts)</p>
                <p>🔥 Streak bonus: +50pts per consecutive correct answer</p>
                <p>❌ Wrong or timeout = 0 points for that question</p>
                <p>🏆 Top scorer wins weekly prize pool</p>
              </div>
            </div>

            <button onClick={startGame} className="bg-yellow-400 text-black font-black text-xl px-10 py-4 rounded-full hover:bg-yellow-300 transition-all hover:scale-105 flex items-center gap-3 mx-auto">
              Start Game <ArrowRight className="w-6 h-6" />
            </button>
            <Link href="/games" className="block mt-4 text-zinc-500 hover:text-white text-sm transition-colors">← Back to Games</Link>
          </div>
        )}

        {/* COUNTDOWN */}
        {phase === "countdown" && (
          <div className="text-center pt-20">
            <p className="text-zinc-400 text-lg mb-4">Get ready...</p>
            <div className="text-[120px] font-black text-yellow-400 leading-none animate-pulse">{countdown || "GO!"}</div>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && q && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm">Question {qIdx + 1} of {questions.length}</span>
              <div className="flex items-center gap-3">
                {streak > 1 && <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded-full">🔥 {streak}x Streak!</span>}
                <div className={`flex items-center gap-1.5 font-black text-lg ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
                  <Clock className="w-5 h-5" /> {timeLeft}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{width:`${pct}%`}} />
            </div>

            {/* Score */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-400 text-sm">Score: <span className="text-yellow-400 font-black">{score.toLocaleString()}</span></span>
              <span className="text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-full">{q.category}</span>
            </div>

            {/* Timer ring */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <svg className="rotate-[-90deg]" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={timeLeft <= 5 ? "#ef4444" : "#F5B800"}
                  strokeWidth="6" strokeDasharray={175.9}
                  strokeDashoffset={175.9 * (1 - timeLeft / 15)} strokeLinecap="round"
                  style={{transition:"stroke-dashoffset 1s linear"}} />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center font-black text-xl ${timeLeft <= 5 ? "text-red-400" : "text-yellow-400"}`}>{timeLeft}</span>
            </div>

            {/* Question */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-6">
              <p className="text-white text-xl font-bold text-center leading-relaxed">{q.q}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                let cls = "bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-yellow-400/50 hover:bg-zinc-800";
                if (selected !== null) {
                  if (i === q.answer) cls = "bg-green-500/20 border-green-500 text-green-300";
                  else if (i === selected && i !== q.answer) cls = "bg-red-500/20 border-red-500 text-red-300";
                  else cls = "bg-zinc-900 border-zinc-800 text-zinc-500";
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                    className={`border-2 rounded-xl p-4 text-left text-sm font-medium transition-all ${cls}`}>
                    <span className="inline-block w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center mr-2 font-bold">
                      {String.fromCharCode(65+i)}
                    </span>
                    {opt}
                    {selected !== null && i === q.answer && <CheckCircle className="inline w-4 h-4 ml-2 text-green-400" />}
                    {selected !== null && i === selected && i !== q.answer && <XCircle className="inline w-4 h-4 ml-2 text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FINAL */}
        {phase === "final" && (
          <div className="text-center">
            <div className="text-6xl mb-4">{score >= 800 ? "🏆" : score >= 500 ? "⭐" : "🎮"}</div>
            <h2 className="text-3xl font-black text-white mb-2">Game Over!</h2>
            <div className="text-6xl font-black text-yellow-400 mb-2">{score.toLocaleString()}</div>
            <p className="text-zinc-400 mb-8">points earned</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                ["Correct", `${answers.filter(a=>a.correct).length}/${answers.length}`],
                ["Best Streak", `${bestStreak}🔥`],
                ["Accuracy", `${Math.round(answers.filter(a=>a.correct).length/answers.length*100)}%`],
              ].map(([l,v]) => (
                <div key={l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="font-black text-yellow-400 text-lg">{v}</div>
                  <div className="text-xs text-zinc-400">{l}</div>
                </div>
              ))}
            </div>

            {/* Answer review */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 text-left">
              <h3 className="font-bold text-white mb-3">Review</h3>
              <div className="space-y-2">
                {answers.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {a.correct ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <span className="text-zinc-300 truncate">{questions[i]?.q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={startGame} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
                Play Again
              </button>
              <Link href="/games" className="bg-zinc-800 text-white font-bold px-8 py-3 rounded-full hover:bg-zinc-700 transition-colors">
                Leaderboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
