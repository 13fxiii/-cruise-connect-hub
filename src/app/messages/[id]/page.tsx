// @ts-nocheck
'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@appdeploy/client';
import { useRouter } from 'next/navigation';
import { Send, Loader2, ChevronLeft } from 'lucide-react';

function timeStamp(value: string | number) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setM] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSd] = useState(false);
  const [loading, setLd] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/api/messages');
      const all = data?.messages || [];
      setM(all.filter((msg: any) => msg.senderId === id || msg.recipientId === id));
    } finally {
      setLd(false);
    }
  };

  useEffect(() => { void load(); }, [user, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending || !user) return;
    const content = text.trim();
    setText('');
    setSd(true);
    const optimistic = { id: `opt-${Date.now()}`, senderId: user.userId || user.id, recipientId: id, text: content, createdAt: Date.now() };
    setM(prev => [...prev, optimistic]);
    try {
      const { data } = await api.post('/api/messages', { recipientId: id, text: content });
      if (data) setM(prev => prev.map(m => m.id === optimistic.id ? data : m));
    } catch (err: any) {
      setM(prev => prev.filter(m => m.id !== optimistic.id));
      alert(err?.message || 'Could not send message');
    } finally {
      setSd(false);
    }
  };

  const myId = user?.userId || user?.id;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900 flex items-center gap-3 px-4 h-14" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 text-zinc-400 active:text-white"><ChevronLeft className="w-6 h-6" /></button>
        <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center"><span className="text-xs font-black text-yellow-400">〽️</span></div>
        <div className="flex-1 min-w-0"><p className="font-bold text-white text-sm truncate">Cruiser</p><p className="text-zinc-500 text-xs truncate">{id}</p></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center pt-16"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-16"><div className="text-4xl mb-3">👋</div><p className="text-white font-bold">Start the conversation</p><p className="text-zinc-500 text-sm mt-1">Your messages are stored securely in BCH.</p></div>
        ) : messages.map((msg, i) => {
          const isMe = msg.senderId === myId;
          const createdAt = msg.createdAt || Date.now();
          const showTime = i === 0 || (Number(createdAt) - Number(messages[i - 1].createdAt || 0)) > 300000;
          return <div key={msg.id}>
            {showTime && <div className="text-center my-3"><span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded-full">{timeStamp(createdAt)}</span></div>}
            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isMe ? 'bg-yellow-400 text-black rounded-br-md font-medium' : 'bg-zinc-800 text-white rounded-bl-md'}`}>{msg.text || msg.content}</div></div>
          </div>;
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-900 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 80px)' }}>
        <input className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50" placeholder="Message…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
        <button onClick={send} disabled={!text.trim() || sending} className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform shrink-0">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
      </div>
    </div>
  );
}
