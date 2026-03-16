"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [messages, setMessages]   = useState<any[]>([]);
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const supabase                  = createClient();

  useEffect(() => {
    if (!user) return;
    fetch(`/api/messages/${params.id}`)
      .then(r => r.json())
      .then(d => { setMessages(d.messages || []); setLoading(false); });
  }, [user, params.id]);

  // Realtime messages
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`dm-${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'dm_messages',
        filter: `conversation_id=eq.${params.id}`,
      }, (payload) => {
        if (payload.new.sender_id !== user.id) {
          setMessages(m => [...m, payload.new]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const optimistic = { id: Date.now().toString(), sender_id: user?.id, content: text.trim(), created_at: new Date().toISOString(), optimistic: true };
    setMessages(m => [...m, optimistic]);
    const saved = text;
    setText("");
    setSending(true);
    const res = await fetch(`/api/messages/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: saved }),
    });
    setSending(false);
    if (!res.ok) {
      setMessages(m => m.filter(x => x.id !== optimistic.id));
      setText(saved);
    }
  };

  function timeOf(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (!user) return <div className="min-h-screen bg-[#0a0a0a]"><Navbar /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="sticky top-14 z-10 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="text-zinc-500 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="text-white font-black text-sm">Conversation</div>
            <div className="text-zinc-600 text-xs">Direct Message</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-sm">Say hello! 👋</div>
          ) : (
            messages.map(m => {
              const isMine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMine ? "bg-yellow-400 text-black rounded-br-sm" : "bg-zinc-900 text-zinc-100 rounded-bl-sm"
                  } ${m.optimistic ? "opacity-70" : ""}`}>
                    <p className="leading-relaxed">{m.content}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-black/60" : "text-zinc-600"}`}>{timeOf(m.created_at)}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="sticky bottom-0 bg-black/90 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} maxLength={1000}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-yellow-400" />
          <button type="submit" disabled={!text.trim() || sending}
            className="bg-yellow-400 text-black rounded-full w-9 h-9 flex items-center justify-center hover:bg-yellow-300 disabled:opacity-40 flex-shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
