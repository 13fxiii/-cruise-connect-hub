// @ts-nocheck
'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

function timeStamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const { user }        = useAuth();
  const router          = useRouter();
  const [messages, setM]= useState<any[]>([]);
  const [other, setOther]= useState<any>(null);
  const [text, setText] = useState('');
  const [sending, setSd]= useState(false);
  const [loading, setLd]= useState(true);
  const bottomRef       = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const supabase        = createClient();

  useEffect(() => {
    if (!user) return;
    fetch(`/api/messages/${id}`)
      .then(r => r.json())
      .then(d => {
        setM(d.messages || []);
        setOther(d.other_user || null);
        setLd(false);
      });
  }, [user, id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`dm-${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'dm_messages',
        filter: `conversation_id=eq.${id}`,
      }, payload => {
        setM(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, id]);

  const send = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSd(true);
    // Optimistic
    const optimistic = { id: `opt-${Date.now()}`, sender_id: user?.id, content, created_at: new Date().toISOString() };
    setM(prev => [...prev, optimistic]);
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    } catch {}
    setSd(false);
  };

  const name = other?.display_name || other?.username || 'User';

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900 flex items-center gap-3 px-4 h-14"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 text-zinc-400 active:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        {other?.avatar_url ? (
          <img src={other.avatar_url} className="w-8 h-8 rounded-full object-cover" alt={name} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="text-sm font-bold text-zinc-400">{name[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{name}</p>
          {other?.username && <p className="text-zinc-500 text-xs">@{other.username}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center pt-16"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-16">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-white font-bold">Say hi to {name}</p>
            <p className="text-zinc-500 text-sm mt-1">This is the start of your conversation</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const showTime = i === 0 || 
              (new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime()) > 300000;
            return (
              <div key={msg.id}>
                {showTime && (
                  <div className="text-center my-3">
                    <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded-full">
                      {timeStamp(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isMe
                      ? 'bg-yellow-400 text-black rounded-br-md font-medium'
                      : 'bg-zinc-800 text-white rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-900 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 80px)' }}>
        <input
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50"
          placeholder="Message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform shrink-0">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
