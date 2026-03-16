"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Users, Send, ExternalLink, Play, ArrowLeft, Heart, Zap, Mic } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

// Demo watch party data
const PARTY = {
  id: "wp1",
  title: "Friday Movie Night 🎬",
  movie: "Coming to America (1988)",
  youtube_id: "UPhkG58fCb8", // Coming to America trailer/film
  host: "@TheCruiseCH",
  status: "live",
  viewer_count: 247,
  twitter_space_url: "https://x.com/i/spaces/",
  chat_enabled: true,
};

const SEED_CHAT = [
  { id:"c1", user:"@connectplug", msg:"This movie never gets old 😂🔥", time:"2m ago" },
  { id:"c2", user:"@13fxiii_", msg:"Akeem is literally all of us in the West 🫡", time:"2m ago" },
  { id:"c3", user:"@naijagamer", msg:"That suit shop scene 💀💀", time:"1m ago" },
  { id:"c4", user:"@thrillseeka", msg:"Eddie Murphy was on another level", time:"1m ago" },
  { id:"c5", user:"@lagosqueen", msg:"Who invited us to this watch party?? Thank you @TheCruiseCH 🙏🏾", time:"45s ago" },
  { id:"c6", user:"@abuja_plug", msg:"LMAOO the barbershop debates!!!", time:"30s ago" },
  { id:"c7", user:"@waveyboss", msg:"Next week let's do Coming 2 America", time:"15s ago" },
];

const REACTIONS = ["🔥","😂","❤️","🙌","💯","😭","🎉","👑"];

export default function WatchPartyPage() {
  const [chat, setChat] = useState(SEED_CHAT);
  const [msg, setMsg] = useState("");
  const [viewers, setViewers] = useState(PARTY.viewer_count);
  const [reactions, setReactions] = useState<{id:string;emoji:string;x:number}[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(100);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  // Simulate live chat
  useEffect(() => {
    const AUTO_MSGS = [
      { user:"@hubfan_1", msg:"This is the best movie night 🎉" },
      { user:"@naijacool", msg:"Scene at 58mins is GOAT tier 🐐" },
      { user:"@lagosboy_9", msg:"@connectplug agree 100%" },
      { user:"@abkings", msg:"Lol at the ending 💀" },
      { user:"@cruisegang", msg:"We dey cruise we dey connect 🚌" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      const m = AUTO_MSGS[i % AUTO_MSGS.length];
      setChat(p => [...p.slice(-30), { id:`auto-${msgId.current++}`, user:m.user, msg:m.msg, time:"just now" }]);
      setViewers(p => p + Math.floor(Math.random()*3-1));
      i++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sendMsg = () => {
    if (!msg.trim()) return;
    setChat(p => [...p.slice(-30), { id:`my-${msgId.current++}`, user:"@you", msg: msg.trim(), time:"just now" }]);
    setMsg("");
  };

  const sendReaction = (emoji: string) => {
    const id = `r-${Date.now()}`;
    const x = 10 + Math.random() * 80;
    setReactions(p => [...p, { id, emoji, x }]);
    setTimeout(() => setReactions(p => p.filter(r => r.id !== id)), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/movies" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4"/> Back to Movie Hub
        </Link>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video + Controls */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-black text-white">{PARTY.title}</h1>
                <p className="text-sm text-zinc-400">{PARTY.movie}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> LIVE
                </div>
                <div className="flex items-center gap-1 text-zinc-400 text-sm">
                  <Users className="w-4 h-4"/> {viewers.toLocaleString()}
                </div>
              </div>
            </div>

            {/* YouTube Embed */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${PARTY.youtube_id}?autoplay=0&rel=0&modestbranding=1`}
                title={PARTY.movie} allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full"
              />
              {/* Floating reactions */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {reactions.map(r => (
                  <div key={r.id} className="absolute text-2xl animate-bounce" style={{ left:`${r.x}%`, bottom:"10%", animation:"float 2s ease-out forwards" }}>
                    {r.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Reaction bar */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-zinc-500 font-medium">React:</span>
              {REACTIONS.map(e => (
                <button key={e} onClick={()=>sendReaction(e)}
                  className="text-xl hover:scale-125 transition-transform active:scale-90 select-none">
                  {e}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <a href={PARTY.twitter_space_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold px-3 py-2 rounded-full hover:border-yellow-400/40">
                  <Mic className="w-3 h-3 text-yellow-400"/> Join X Space
                </a>
              </div>
            </div>

            {/* Movie info card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎬</div>
                <div>
                  <div className="text-white font-bold">{PARTY.movie}</div>
                  <div>Hosted by <span className="text-yellow-400">{PARTY.host}</span> · Community watch party every Friday!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[520px] lg:h-[620px]">
              <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-yellow-400"/>
                <span className="font-bold text-white text-sm">Live Chat</span>
                <span className="ml-auto text-xs text-zinc-500">{chat.length} messages</span>
              </div>

              <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                {chat.map(m => (
                  <div key={m.id} className={`${m.user==="@you"?"text-right":""}`}>
                    <div className={`inline-block max-w-[85%] text-xs rounded-xl px-3 py-2 ${m.user==="@you"?"bg-yellow-400/20 border border-yellow-400/30 text-yellow-100":"bg-zinc-800 text-zinc-200"}`}>
                      <div className={`font-bold mb-0.5 ${m.user==="@you"?"text-yellow-400":"text-zinc-400"}`}>{m.user}</div>
                      <div className="leading-relaxed">{m.msg}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Say something..."
                    value={msg} onChange={e=>setMsg(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&sendMsg()}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-white text-xs outline-none focus:border-yellow-500 placeholder:text-zinc-600 transition-colors"
                  />
                  <button onClick={sendMsg}
                    className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors flex-shrink-0">
                    <Send className="w-4 h-4 text-black"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
