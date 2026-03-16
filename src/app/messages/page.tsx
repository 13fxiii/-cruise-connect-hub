"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { MessageCircle, Search, Plus, Loader2 } from "lucide-react";

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return "now";
  if (d < 3600000) return `${Math.floor(d/60000)}m`;
  if (d < 86400000) return `${Math.floor(d/3600000)}h`;
  return `${Math.floor(d/86400000)}d`;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [convos, setConvos]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [newDM, setNewDM]       = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/messages").then(r => r.json()).then(d => {
      setConvos(d.conversations || []);
      setLoading(false);
    });
  }, [user]);

  const startDM = async () => {
    if (!newDM.trim()) return;
    setStarting(true);
    // Lookup user by username
    const res = await fetch(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: newDM }),
    });
    const data = await res.json();
    setStarting(false);
    if (res.ok) window.location.href = `/messages/${data.conversation_id}`;
    else alert(data.error || "User not found");
  };

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <MessageCircle className="w-12 h-12 text-zinc-700" />
        <p className="text-zinc-400">Sign in to access messages</p>
        <Link href="/auth/login" className="bg-yellow-400 text-black font-black px-6 py-2.5 rounded-full">Sign In</Link>
      </div>
    </div>
  );

  const filtered = convos.filter(c => search ?
    c.other?.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.other?.display_name?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-yellow-400" /> Messages
          </h1>
        </div>

        {/* New DM */}
        <div className="flex gap-2 mb-4">
          <input value={newDM} onChange={e => setNewDM(e.target.value)}
            placeholder="Paste user ID to start new DM..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
          <button onClick={startDM} disabled={starting || !newDM.trim()}
            className="bg-yellow-400 text-black font-black px-3 py-2.5 rounded-xl hover:bg-yellow-300 disabled:opacity-40">
            {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
        </div>

        {/* Conversations */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No conversations yet</p>
            <p className="text-zinc-700 text-xs mt-1">Start a DM from someone's profile</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(c => (
              <Link key={c.id} href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-zinc-900 transition-all group">
                <div className="relative">
                  {c.other?.avatar_url ? (
                    <img src={c.other.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-base">
                      {(c.other?.display_name || c.other?.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {c.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black text-[10px] font-black">
                      {c.unread > 9 ? "9+" : c.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-black text-sm ${c.unread > 0 ? "text-white" : "text-zinc-300"}`}>
                      {c.other?.display_name || c.other?.username}
                    </span>
                    <span className="text-zinc-600 text-xs">{timeAgo(c.last_message_at)}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "text-zinc-200 font-bold" : "text-zinc-500"}`}>
                    {c.last_message || "Start a conversation..."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
