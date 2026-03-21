// @ts-nocheck
"use client";
import { useState, useRef, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { Mic, MicOff, Video, VideoOff, Users, Gift, MessageCircle, Send, Heart, X, Plus, Crown, Phone } from "lucide-react";

const GIFTS = [
  { emoji:"👏", name:"Clap", value:"₦100" },
  { emoji:"🔥", name:"Fire", value:"₦500" },
  { emoji:"👑", name:"Crown", value:"₦1,000" },
  { emoji:"🚌", name:"Bus", value:"₦2,000" },
  { emoji:"💎", name:"Diamond", value:"₦5,000" },
];

type ChatMsg = { id: string; user: string; msg: string; type?: "gift"|"join"|"chat"; gift?: string };

const DEMO_MSGS: ChatMsg[] = [
  { id:"1", user:"@lagosqueen", msg:"This space is 🔥🔥", type:"chat" },
  { id:"2", user:"@naijaking", msg:"just joined", type:"join" },
  { id:"3", user:"@afrobae", msg:"sent 🔥 Fire", type:"gift", gift:"🔥" },
  { id:"4", user:"@cruiser_x", msg:"Yooo this is vibing!", type:"chat" },
];

export default function VideoSpacePage() {
  const [isMuted, setIsMuted]       = useState(false);
  const [isCamOn, setIsCamOn]       = useState(true);
  const [showChat, setShowChat]     = useState(true);
  const [showGifts, setShowGifts]   = useState(false);
  const [message, setMessage]       = useState("");
  const [msgs, setMsgs]             = useState<ChatMsg[]>(DEMO_MSGS);
  const [viewers, setViewers]       = useState(128);
  const [isLive, setIsLive]         = useState(false);
  const [flyingGifts, setFlyingGifts] = useState<{id:string;emoji:string}[]>([]);
  const [user, setUser]             = useState<any>(null);
  const videoRef                    = useRef<HTMLVideoElement>(null);
  const chatRef                     = useRef<HTMLDivElement>(null);
  const supabase                    = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => setUser(data.user));
    // Simulate growing viewer count
    const t = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 3)), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
    } catch { setIsLive(true); } // fallback to demo mode
  };

  const sendMsg = () => {
    if (!message.trim()) return;
    const newMsg: ChatMsg = { id: Date.now().toString(), user: `@${user?.user_metadata?.username || "you"}`, msg: message, type: "chat" };
    setMsgs(m => [...m, newMsg]);
    setMessage("");
  };

  const sendGift = (gift: typeof GIFTS[0]) => {
    const id = Date.now().toString();
    const newMsg: ChatMsg = { id, user: `@${user?.user_metadata?.username || "you"}`, msg: `sent ${gift.emoji} ${gift.name}`, type: "gift", gift: gift.emoji };
    setMsgs(m => [...m, newMsg]);
    setFlyingGifts(g => [...g, { id, emoji: gift.emoji }]);
    setTimeout(() => setFlyingGifts(g => g.filter(x => x.id !== id)), 2500);
    setShowGifts(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full px-4 py-4 gap-4">

        {/* VIDEO AREA */}
        <div className="flex-1 relative bg-zinc-900 rounded-2xl overflow-hidden" style={{minHeight: 480}}>
          {/* Camera feed */}
          <video ref={videoRef} autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover" />

          {/* Dark overlay when not live */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
              <div className="text-6xl mb-4">🎥</div>
              <h2 className="text-white font-black text-xl mb-2">Video Live Space</h2>
              <p className="text-zinc-400 text-sm mb-6 text-center px-8">Go live with video — your community can join, chat, and send gifts in real time</p>
              <button onClick={startCamera}
                className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors text-sm flex items-center gap-2">
                <Video className="w-4 h-4" /> Go Live Now
              </button>
            </div>
          )}

          {/* Live badge */}
          {isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
              </div>
              <div className="flex items-center gap-1 bg-black/60 text-white text-xs font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                <Users className="w-3 h-3" /> {viewers.toLocaleString()}
              </div>
            </div>
          )}

          {/* Flying gifts */}
          {flyingGifts.map(g => (
            <div key={g.id} className="absolute bottom-24 right-8 text-5xl animate-bounce pointer-events-none z-20"
              style={{animation: "flyUp 2.5s ease-out forwards"}}>
              {g.emoji}
            </div>
          ))}

          {/* Controls bar */}
          {isLive && (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
              <button onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-red-500 text-white" : "bg-black/60 text-white backdrop-blur-sm"}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsCamOn(!isCamOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!isCamOn ? "bg-red-500 text-white" : "bg-black/60 text-white backdrop-blur-sm"}`}>
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button onClick={() => setShowGifts(!showGifts)}
                className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </button>
              <button onClick={() => setShowChat(!showChat)}
                className="w-12 h-12 rounded-full bg-black/60 text-white backdrop-blur-sm flex items-center justify-center md:hidden">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button onClick={() => { setIsLive(false); if(videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }}
                className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
                <Phone className="w-5 h-5 rotate-[135deg]" />
              </button>
            </div>
          )}

          {/* Gift selector */}
          {showGifts && (
            <div className="absolute bottom-20 left-0 right-0 px-4">
              <div className="bg-black/90 backdrop-blur-md rounded-2xl p-3 flex gap-2 justify-center border border-zinc-700">
                {GIFTS.map(g => (
                  <button key={g.name} onClick={() => sendGift(g)}
                    className="flex flex-col items-center gap-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 transition-all">
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-white text-[9px] font-bold">{g.name}</span>
                    <span className="text-yellow-400 text-[9px]">{g.value}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CHAT SIDEBAR */}
        {showChat && (
          <div className="w-full md:w-80 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-white font-black text-sm">Video Space</div>
                <div className="text-zinc-500 text-xs">{viewers.toLocaleString()} viewers</div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-zinc-500 hover:text-white md:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2" style={{maxHeight: 360}}>
              {msgs.map(m => (
                <div key={m.id} className={`flex items-start gap-2 ${m.type === "gift" ? "bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-2" : ""}`}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-black text-black flex-shrink-0">
                    {m.user.charAt(1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-yellow-400 text-[11px] font-bold">{m.user} </span>
                    {m.type === "gift" ? (
                      <span className="text-zinc-300 text-[11px]">{m.msg}</span>
                    ) : m.type === "join" ? (
                      <span className="text-zinc-500 text-[11px]">{m.msg}</span>
                    ) : (
                      <span className="text-zinc-200 text-[11px]">{m.msg}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-800 flex gap-2">
              <input value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
                placeholder="Say something..." maxLength={100}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-yellow-400" />
              <button onClick={sendMsg} className="bg-yellow-400 text-black rounded-xl px-3 flex items-center justify-center hover:bg-yellow-300">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes flyUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
