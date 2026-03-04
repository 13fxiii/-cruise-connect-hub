"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCheck, ArrowLeft, Heart, Gamepad2, Wallet, Radio, Star, MessageCircle, Zap } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

type Notification = { id: string; type: string; title: string; body?: string; link?: string; is_read: boolean; created_at: string; };

const ICONS: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-red-400"/>, comment: <MessageCircle className="w-4 h-4 text-blue-400"/>,
  game_start: <Gamepad2 className="w-4 h-4 text-green-400"/>, wallet_credit: <Wallet className="w-4 h-4 text-yellow-400"/>,
  space_live: <Radio className="w-4 h-4 text-red-400"/>, prize_won: <Star className="w-4 h-4 text-yellow-400"/>,
  system: <Zap className="w-4 h-4 text-zinc-400"/>,
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now()-new Date(iso).getTime())/1000);
  if(s<60) return "just now"; if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications").then(r=>r.json()).then(d=>{ setNotifs(d.notifications||[]); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  const markAllRead = () => { setNotifs(p=>p.map(n=>({...n,is_read:true}))); fetch("/api/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({})}); };

  const unread = notifs.filter(n=>!n.is_read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/feed"><ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white"/></Link>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Bell className="text-yellow-400 w-6 h-6"/>Notifications</h1>
          {unread>0&&<span className="bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded-full">{unread} new</span>}
          <div className="flex-1"/>
          {unread>0&&<button onClick={markAllRead} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5"/>Mark all read</button>}
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading...</div>
        ) : notifs.length===0 ? (
          <div className="text-center py-12"><Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3"/><p className="text-zinc-500">No notifications yet</p></div>
        ) : (
          <div className="space-y-2">
            {notifs.map(n=>(
              <Link href={n.link||"/feed"} key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,is_read:true}:x))}
                className={`flex gap-4 p-4 rounded-xl border transition-all hover:border-zinc-600 ${!n.is_read?"bg-yellow-400/5 border-yellow-400/20":"bg-zinc-900 border-zinc-800"}`}>
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${!n.is_read?"bg-zinc-800":"bg-zinc-800/50"}`}>
                  {ICONS[n.type]||ICONS.system}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.is_read?"text-white font-medium":"text-zinc-300"}`}>{n.title}</p>
                    {!n.is_read&&<span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5"/>}
                  </div>
                  {n.body&&<p className="text-xs text-zinc-500 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-zinc-600 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
