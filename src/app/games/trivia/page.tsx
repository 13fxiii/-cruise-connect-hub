"use client";
import { useState, useEffect, useCallback } from "react";
import { Brain, Clock, Trophy, Zap, ArrowRight, CheckCircle, XCircle, RotateCcw, Home, Star, Flame } from "lucide-react";

import Link from "next/link";

const QUESTION_BANK = [
  { id:1, q:"What is Nigeria's capital city?", options:["Lagos","Abuja","Kano","Port Harcourt"], answer:1, category:"Naija 🇳🇬" },
  { id:2, q:"Which Nigerian musician released 'Ye' in 2018?", options:["Wizkid","Davido","Burna Boy","Olamide"], answer:2, category:"Music 🎵" },
  { id:3, q:"What year did Nigeria gain independence?", options:["1958","1960","1963","1965"], answer:1, category:"Naija 🇳🇬" },
  { id:4, q:"What does 'Oya' mean in Nigerian slang?", options:["No","Come on / Let's go","Later","Maybe"], answer:1, category:"Pidgin 🗣️" },
  { id:5, q:"Which city is called 'The City of Aquatic Splendor'?", options:["Abuja","Calabar","Lagos","Ibadan"], answer:1, category:"Naija 🇳🇬" },
  { id:6, q:"Afrobeats originated primarily from which country?", options:["Ghana","USA","Nigeria","South Africa"], answer:2, category:"Music 🎵" },
  { id:7, q:"What does 'Wahala' mean?", options:["Money","Trouble/Problem","Party","Food"], answer:1, category:"Pidgin 🗣️" },
  { id:8, q:"Who is known as 'The African Giant'?", options:["Wizkid","Davido","Burna Boy","Tiwa Savage"], answer:2, category:"Music 🎵" },
  { id:9, q:"Jollof Rice war is mostly between Nigeria and?", options:["Cameroon","Ghana","Senegal","Togo"], answer:1, category:"Food 🍛" },
  { id:10, q:"What does 'CRUISING' mean in Nigerian context?", options:["Driving fast","Chilling/good time","Working hard","Running"], answer:1, category:"Pidgin 🗣️" },
  { id:11, q:"Which river is the longest in Nigeria?", options:["Benue River","Niger River","Cross River","Kaduna River"], answer:1, category:"Naija 🇳🇬" },
  { id:12, q:"What currency does Nigeria use?", options:["Cedis","Shillings","Naira","Rand"], answer:2, category:"Naija 🇳🇬" },
  { id:13, q:"What does 'Sabi' mean in Nigerian Pidgin?", options:["Know/Be good at","Eat","Sleep","Run"], answer:0, category:"Pidgin 🗣️" },
  { id:14, q:"Wizkid's debut album is called?", options:["Sounds from the Other Side","Superstar","Made in Lagos","More Love Less Ego"], answer:1, category:"Music 🎵" },
  { id:15, q:"What does 'Abi' mean at end of a sentence?", options:["No way","Right? / Isn't it?","Definitely","Never"], answer:1, category:"Pidgin 🗣️" },
  { id:16, q:"'Eze goes to school' story is from which country?", options:["Ghana","Nigeria","Kenya","South Africa"], answer:1, category:"Naija 🇳🇬" },
  { id:17, q:"What is 'Suya' made of?", options:["Fish","Grilled spiced meat","Yam","Rice"], answer:1, category:"Food 🍛" },
  { id:18, q:"Davido's record label is called?", options:["Mavin","DMW","Empire","Starboy"], answer:1, category:"Music 🎵" },
  { id:19, q:"What does 'E don do' mean?", options:["Just started","It's over/finished","It's expensive","It's easy"], answer:1, category:"Pidgin 🗣️" },
  { id:20, q:"Lagos is built on how many islands?", options:["Two","Three","Five","Seven"], answer:0, category:"Naija 🇳🇬" },
];

type Phase = "lobby" | "countdown" | "playing" | "final";
const DIFF_TIMES: Record<string,number> = { easy:20, medium:15, hard:10 };

export default function TriviaPage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState<typeof QUESTION_BANK>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [countdown, setCountdown] = useState(3);
  const [answers, setAnswers] = useState<{correct:boolean;selected:number|null;time:number}[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [points, setPoints] = useState(0);

  const shuffle = (arr:any[]) => [...arr].sort(()=>Math.random()-0.5);
  const timeLimit = DIFF_TIMES[difficulty];

  const startGame = () => {
    const qs = shuffle(QUESTION_BANK).slice(0,10);
    setQuestions(qs); setQIdx(0); setScore(0); setPoints(0);
    setSelected(null); setAnswers([]); setStreak(0); setBestStreak(0);
    setCountdown(3); setPhase("countdown");
  };

  useEffect(()=>{
    if(phase!=="countdown") return;
    if(countdown<=0){setPhase("playing");setTimeLeft(timeLimit);return;}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000);
    return ()=>clearTimeout(t);
  },[phase,countdown,timeLimit]);

  useEffect(()=>{
    if(phase!=="playing"||selected!==null) return;
    if(timeLeft<=0){handleAnswer(null);return;}
    const t=setTimeout(()=>setTimeLeft(tl=>tl-1),1000);
    return ()=>clearTimeout(t);
  },[phase,timeLeft,selected]);

  const handleAnswer = useCallback((idx:number|null)=>{
    if(selected!==null||phase!=="playing") return;
    setSelected(idx);
    const q=questions[qIdx];
    const correct=idx===q.answer;
    const timeBonus=Math.floor(timeLeft*10);
    const pts=correct?(100+timeBonus+(streak>=2?50:0)):0;
    const newStreak=correct?streak+1:0;
    const newBest=Math.max(bestStreak,newStreak);
    setStreak(newStreak);setBestStreak(newBest);
    if(correct){setScore(s=>s+1);setPoints(p=>p+pts);}
    setAnswers(a=>[...a,{correct,selected:idx,time:timeLimit-timeLeft}]);
    setTimeout(()=>{
      if(qIdx+1>=questions.length){setPhase("final");}
      else{setQIdx(i=>i+1);setSelected(null);setTimeLeft(timeLimit);}
    },1400);
  },[selected,phase,questions,qIdx,timeLeft,streak,bestStreak,timeLimit]);

  const q=questions[qIdx];
  const pct=(timeLeft/timeLimit)*100;
  const timerColor=pct>50?"bg-green-500":pct>25?"bg-yellow-400":"bg-red-500";

  const getGrade=()=>{
    const p=score/10;
    if(p>=0.9)return{grade:"S",label:"Legendary! 🔥",color:"text-yellow-400"};
    if(p>=0.7)return{grade:"A",label:"Excellent! ⭐",color:"text-green-400"};
    if(p>=0.5)return{grade:"B",label:"Good Effort 👍",color:"text-blue-400"};
    if(p>=0.3)return{grade:"C",label:"Keep Grinding 💪",color:"text-orange-400"};
    return{grade:"D",label:"Try Again! 🔄",color:"text-red-400"};
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-2xl mx-auto px-4 py-8">

        {phase==="lobby"&&(
          <div className="space-y-6">
            <Link href="/games" className="text-zinc-400 hover:text-white text-sm transition-colors">← Back to Games</Link>
            <div className="text-center space-y-2">
              <div className="text-6xl mb-4">🧠</div>
              <h1 className="text-4xl font-black text-white">Trivia Challenge</h1>
              <p className="text-zinc-400">10 Questions · Naija Knowledge · Earn Points</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Choose Difficulty</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{key:"easy",label:"Easy 😊",time:20,active:"border-green-500 bg-green-500/10 text-green-400"},
                  {key:"medium",label:"Medium 😤",time:15,active:"border-yellow-400 bg-yellow-400/10 text-yellow-400"},
                  {key:"hard",label:"Hard 🔥",time:10,active:"border-red-500 bg-red-500/10 text-red-400"}
                ].map(d=>(
                  <button key={d.key} onClick={()=>setDifficulty(d.key)}
                    className={`p-3 rounded-xl border-2 transition-all ${difficulty===d.key?d.active:"border-zinc-700 text-zinc-500 hover:border-zinc-600"}`}>
                    <div className="font-black text-sm">{d.label}</div>
                    <div className="text-xs opacity-70">{d.time}s/q</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{e:"🎯",l:"Questions",v:"10"},{e:"⏱️",l:"Per Question",v:`${timeLimit}s`},{e:"🔥",l:"Streak Bonus",v:"+50pts"}].map(i=>(
                <div key={i.l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{i.e}</div>
                  <div className="text-white font-black">{i.v}</div>
                  <div className="text-zinc-500 text-xs">{i.l}</div>
                </div>
              ))}
            </div>
            <button onClick={startGame} className="w-full bg-yellow-400 text-black font-black py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2">
              Start Game <ArrowRight className="w-5 h-5"/>
            </button>
          </div>
        )}

        {phase==="countdown"&&(
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-400 text-xl mb-4">Get Ready...</p>
              <div className="text-[140px] font-black text-yellow-400 leading-none">{countdown===0?"GO!":countdown}</div>
            </div>
          </div>
        )}

        {phase==="playing"&&q&&(
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 text-sm font-bold">Q{qIdx+1}/10</span>
                <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">{q.category}</span>
                {streak>=2&&<span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Flame className="w-3 h-3"/>{streak}x</span>}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400"/>
                <span className="text-yellow-400 font-black">{points}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Clock className="w-4 h-4 text-zinc-500"/>
                <span className={`text-sm font-black ${timeLeft<=5?"text-red-400 animate-pulse":"text-zinc-300"}`}>{timeLeft}s</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{width:`${pct}%`}}/>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-white text-xl font-bold leading-relaxed">{q.q}</p>
            </div>

            <div className="grid gap-3">
              {q.options.map((opt,idx)=>{
                let cls="bg-zinc-900 border-2 border-zinc-800 text-zinc-300 hover:border-zinc-600";
                if(selected!==null){
                  if(idx===q.answer)cls="bg-green-500/20 border-2 border-green-500 text-green-300";
                  else if(idx===selected)cls="bg-red-500/20 border-2 border-red-500 text-red-300";
                  else cls="bg-zinc-900 border-2 border-zinc-800 text-zinc-600 opacity-40";
                }
                return(
                  <button key={idx} onClick={()=>handleAnswer(idx)} disabled={selected!==null}
                    className={`w-full rounded-2xl p-4 text-left font-semibold transition-all ${cls}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-400 flex-shrink-0">
                        {["A","B","C","D"][idx]}
                      </span>
                      <span>{opt}</span>
                      {selected!==null&&idx===q.answer&&<CheckCircle className="w-5 h-5 text-green-400 ml-auto"/>}
                      {selected!==null&&idx===selected&&selected!==q.answer&&<XCircle className="w-5 h-5 text-red-400 ml-auto"/>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{score}/{Math.min(qIdx+(selected!==null?1:0),10)} correct</span>
              {bestStreak>0&&<span className="text-orange-400">Best: {bestStreak}🔥</span>}
            </div>
          </div>
        )}

        {phase==="final"&&(()=>{
          const g=getGrade();
          return(
            <div className="space-y-6">
              <div className="text-center bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
                <div className={`text-7xl font-black ${g.color}`}>{g.grade}</div>
                <h2 className="text-2xl font-black text-white">{g.label}</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[{l:"Score",v:`${score}/10`,i:<Trophy className="w-5 h-5 text-yellow-400"/>},
                    {l:"Points",v:points.toLocaleString(),i:<Star className="w-5 h-5 text-yellow-400"/>},
                    {l:"Best Streak",v:`${bestStreak}🔥`,i:<Flame className="w-5 h-5 text-orange-400"/>}
                  ].map(s=>(
                    <div key={s.l} className="bg-zinc-800 rounded-xl p-3 text-center">
                      <div className="flex justify-center mb-1">{s.i}</div>
                      <div className="text-white font-black text-lg">{s.v}</div>
                      <div className="text-zinc-500 text-xs">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-left mt-4">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wide">Answer Review</p>
                  {answers.map((a,i)=>(
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${a.correct?"bg-green-500/10":"bg-red-500/10"}`}>
                      {a.correct?<CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0"/>:<XCircle className="w-4 h-4 text-red-400 flex-shrink-0"/>}
                      <span className="text-zinc-300 text-sm flex-1 truncate">{questions[i]?.q}</span>
                      <span className="text-zinc-500 text-xs">{a.time}s</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={startGame} className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-black py-3 rounded-2xl hover:bg-yellow-300 transition-all">
                  <RotateCcw className="w-4 h-4"/>Play Again
                </button>
                <Link href="/games" className="flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold py-3 rounded-2xl hover:bg-zinc-700 transition-all">
                  <Home className="w-4 h-4"/>Games Hub
                </Link>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
