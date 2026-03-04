"use client";
import { useState } from "react";
import { BarChart2, Trophy, Users, Plus, Check, Home, Flame } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

type Poll = {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  category: string;
  points: number;
  voted: boolean;
  votedFor: number | null;
  endsIn: string;
};

const INITIAL_POLLS: Poll[] = [
  {
    id:"1", question:"Who has the best jollof rice? 🍛", points:50, voted:false, votedFor:null, endsIn:"2h 30m",
    category:"Food Wars 🍛",
    options:[{text:"Nigeria 🇳🇬",votes:1247},{text:"Ghana 🇬🇭",votes:823},{text:"Senegal 🇸🇳",votes:312},{text:"They all slap tbh",votes:189}]
  },
  {
    id:"2", question:"Best Naija artist of 2024?", points:75, voted:false, votedFor:null, endsIn:"5h 15m",
    category:"Music 🎵",
    options:[{text:"Burna Boy 👑",votes:2103},{text:"Wizkid 🌟",votes:1876},{text:"Davido 💎",votes:1654},{text:"Asake 🔥",votes:934}]
  },
  {
    id:"3", question:"What Lagos food hits different at 2am? 🌙", points:30, voted:false, votedFor:null, endsIn:"1h 45m",
    category:"Late Night 🌙",
    options:[{text:"Suya 🥩",votes:892},{text:"Noodles (Indomie) 🍜",votes:743},{text:"Eba & Egusi 🫙",votes:421},{text:"Jollof Rice 🍚",votes:567}]
  },
  {
    id:"4", question:"Which C&C Hub feature do you use most?", points:100, voted:false, votedFor:null, endsIn:"12h",
    category:"Community 🚌",
    options:[{text:"Music Hub 🎵",votes:445},{text:"Games 🎮",votes:612},{text:"Spaces 🎤",votes:389},{text:"Movie Hub 🎬",votes:278}]
  },
  {
    id:"5", question:"Most iconic Nigerian movie of all time?", points:60, voted:false, votedFor:null, endsIn:"3h",
    category:"Nollywood 🎬",
    options:[{text:"Living in Bondage",votes:567},{text:"The Wedding Party",votes:823},{text:"Lionheart",votes:312},{text:"King of Boys",votes:945}]
  },
];

export default function PollLeaguePage() {
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [myPoints, setMyPoints] = useState(0);
  const [tab, setTab] = useState<"vote"|"create">("vote");
  const [newQ, setNewQ] = useState("");
  const [newOpts, setNewOpts] = useState(["","","",""]);
  const [newCategory, setNewCategory] = useState("General");
  const [submitted, setSubmitted] = useState(false);

  const vote = (pollId:string, optIdx:number) => {
    setPolls(polls.map(p=>{
      if(p.id!==pollId||p.voted) return p;
      const newOptions=p.options.map((o,i)=>i===optIdx?{...o,votes:o.votes+1}:o);
      setMyPoints(pts=>pts+p.points);
      return {...p,options:newOptions,voted:true,votedFor:optIdx};
    }));
  };

  const submitPoll = () => {
    const opts=newOpts.filter(o=>o.trim());
    if(!newQ.trim()||opts.length<2) return;
    const newPoll: Poll = {
      id:Date.now().toString(),
      question:newQ,
      options:opts.map(o=>({text:o,votes:0})),
      category:newCategory,
      points:25,
      voted:false,
      votedFor:null,
      endsIn:"24h"
    };
    setPolls(p=>[newPoll,...p]);
    setNewQ(""); setNewOpts(["","","",""]); setSubmitted(true);
    setTimeout(()=>setSubmitted(false),3000);
    setTab("vote");
  };

  const totalVotes=(p:Poll)=>p.options.reduce((s,o)=>s+o.votes,0);
  const pct=(votes:number,total:number)=>total>0?Math.round((votes/total)*100):0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="text-zinc-400 hover:text-white text-sm">← Games</Link>
          <h1 className="text-xl font-black text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-purple-400"/>Poll League</h1>
          <div className="text-right">
            <div className="text-yellow-400 font-black text-lg">{myPoints}</div>
            <div className="text-zinc-500 text-xs">points</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{l:"My Points",v:myPoints.toString(),e:"⭐"},{l:"Active Polls",v:polls.filter(p=>!p.voted).length.toString(),e:"🗳️"},{l:"Voted",v:polls.filter(p=>p.voted).length.toString(),e:"✅"}].map(s=>(
            <div key={s.l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{s.e}</div>
              <div className="text-white font-black text-lg">{s.v}</div>
              <div className="text-zinc-500 text-xs">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-zinc-900 rounded-xl p-1 w-fit">
          {[["vote","🗳️ Vote & Earn"],["create","➕ Create Poll"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab===v?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>

        {tab==="vote"&&(
          <div className="space-y-4">
            {polls.map(p=>{
              const total=totalVotes(p);
              return(
                <div key={p.id} className={`bg-zinc-900 border rounded-2xl p-5 transition-all ${p.voted?"border-zinc-700":"border-zinc-800 hover:border-zinc-700"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs text-purple-400 font-bold">{p.category}</span>
                      <h3 className="text-white font-bold text-base mt-0.5">{p.question}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-yellow-400 text-xs font-black">+{p.points}pts</span>
                      <span className="text-zinc-500 text-xs">⏱ {p.endsIn}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {p.options.map((opt,i)=>{
                      const percent=pct(opt.votes,total);
                      const isWinner=p.voted&&opt.votes===Math.max(...p.options.map(o=>o.votes));
                      const isVoted=p.voted&&p.votedFor===i;
                      return(
                        <button key={i} onClick={()=>vote(p.id,i)} disabled={p.voted}
                          className={`w-full rounded-xl overflow-hidden transition-all ${p.voted?"cursor-default":"cursor-pointer hover:scale-[1.01]"}`}>
                          <div className={`relative p-3 border rounded-xl ${isVoted?"border-yellow-400 bg-yellow-400/10":isWinner&&p.voted?"border-green-500/50 bg-green-500/5":"border-zinc-800 bg-zinc-800/50"}`}>
                            {p.voted&&(
                              <div className={`absolute top-0 left-0 h-full rounded-xl opacity-20 transition-all`} style={{width:`${percent}%`,background:isVoted?"#EAB308":isWinner?"#22c55e":"#6b7280"}}/>
                            )}
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {p.voted&&isVoted&&<Check className="w-4 h-4 text-yellow-400"/>}
                                {p.voted&&isWinner&&!isVoted&&<Trophy className="w-4 h-4 text-green-400"/>}
                                <span className={`text-sm font-bold ${isVoted?"text-yellow-400":isWinner&&p.voted?"text-green-400":"text-zinc-300"}`}>{opt.text}</span>
                              </div>
                              {p.voted&&<span className={`text-sm font-black ${isVoted?"text-yellow-400":isWinner?"text-green-400":"text-zinc-500"}`}>{percent}%</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-zinc-500">
                    <span><Users className="w-3 h-3 inline mr-1"/>{total.toLocaleString()} votes</span>
                    {p.voted&&<span className="text-green-400 font-bold">+{p.points} pts earned! ✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="create"&&(
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-black">Create a Poll 🗳️</h2>

            {submitted&&(
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm font-bold">
                ✅ Poll created! Community can now vote.
              </div>
            )}

            <div>
              <label className="text-zinc-400 text-sm font-bold block mb-2">Question *</label>
              <input value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="Ask the community anything..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400"/>
            </div>

            <div>
              <label className="text-zinc-400 text-sm font-bold block mb-2">Category</label>
              <select value={newCategory} onChange={e=>setNewCategory(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400">
                {["General","Music 🎵","Food 🍛","Gaming 🎮","Naija Life 🇳🇬","Entertainment 🎬","Community 🚌"].map(c=>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-400 text-sm font-bold block mb-2">Options (min 2)</label>
              <div className="space-y-2">
                {newOpts.map((opt,i)=>(
                  <input key={i} value={opt} onChange={e=>{const o=[...newOpts];o[i]=e.target.value;setNewOpts(o);}}
                    placeholder={`Option ${i+1}${i<2?" *":""}`}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400"/>
                ))}
              </div>
            </div>

            <button onClick={submitPoll}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-all">
              Create Poll
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link href="/games" className="text-zinc-500 text-sm hover:text-zinc-300 flex items-center gap-1">
            <Home className="w-4 h-4"/> Back to Games
          </Link>
        </div>
      </main>
    </div>
  );
}
