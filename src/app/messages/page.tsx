// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { Search, Plus, Loader2, MessageCircle, X, Send } from 'lucide-react';

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return 'now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

export default function MessagesPage() {
  const { user }         = useAuth();
  const [convos, setC]   = useState<any[]>([]);
  const [loading, setLd] = useState(true);
  const [search, setSrch]= useState('');
  const [newDM, setNew]  = useState('');
  const [modal, setModal]= useState(false);
  const [starting, setSt]= useState(false);

  const load = () => {
    if (!user) return;
    fetch('/api/messages').then(r => r.json()).then(d => {
      setC(d.conversations || []); setLd(false);
    });
  };

  useEffect(() => { load(); }, [user]);

  const start = async () => {
    if (!newDM.trim() || starting) return;
    setSt(true);
    try {
      const r = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newDM.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'User not found');
      if (d.conversation_id) {
        setModal(false); setNew('');
        window.location.href = `/messages/${d.conversation_id}`;
      }
    } catch (err: any) {
      alert(err.message);
    }
    setSt(false);
  };

  const filtered = convos.filter(c => {
    const name = c.other_user?.display_name || c.other_user?.username || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Messages" back action={
        <button onClick={() => setModal(true)} className="p-2 text-yellow-400"><Plus className="w-5 h-5" /></button>
      } />

      {/* New DM modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end" onClick={() => setModal(false)}>
          <div className="w-full bg-zinc-900 rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-white text-lg">New Message</p>
              <button onClick={() => setModal(false)} className="text-zinc-500 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex gap-2">
              <input
                autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50"
                placeholder="Enter @username"
                value={newDM}
                onChange={e => setNew(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && start()}
              />
              <button onClick={start} disabled={!newDM.trim() || starting}
                className="px-4 py-3 bg-yellow-400 text-black font-black rounded-xl disabled:opacity-40 flex items-center gap-2">
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
            placeholder="Search conversations"
            value={search}
            onChange={e => setSrch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="px-4 py-2 space-y-2">
          <QuickGroupCard
            title="Cruise Connect Hangout Planners (CCHP)"
            subtitle="Coordinate hosts, logistics, and schedules."
            href="/messages/group/cchp"
          />
          <QuickGroupCard
            title="Cruise Connect Hangouts"
            subtitle="Open gist, updates, and meetup chatter."
            href="/messages/group/hangouts"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-white font-bold text-lg mb-1">{search ? 'No matches' : 'No messages yet'}</p>
            <p className="text-zinc-500 text-sm mb-6">{search ? 'Try a different name' : 'Start a conversation'}</p>
            {!search && (
              <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-black font-black rounded-full text-sm">
                <Plus className="w-4 h-4" /> New Message
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {filtered.map(c => {
              const other = c.other_user;
              return (
                <Link key={c.id} href={`/messages/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-zinc-900/60">
                  {other?.avatar_url ? (
                    <img src={other.avatar_url} className="w-12 h-12 rounded-full object-cover shrink-0" alt={other.display_name} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <span className="font-bold text-zinc-400">{(other?.display_name || other?.username || '?')[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-white text-sm truncate">{other?.display_name || other?.username}</p>
                      <span className="text-zinc-600 text-xs shrink-0 ml-1">{c.last_message_at ? timeAgo(c.last_message_at) : ''}</span>
                    </div>
                    <p className="text-zinc-500 text-xs truncate">{c.last_message || 'No messages yet'}</p>
                  </div>
                  {c.unread > 0 && (
                    <div className="shrink-0 w-5 h-5 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                      {c.unread > 9 ? '9+' : c.unread}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function QuickGroupCard({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 active:bg-zinc-800/70">
      <p className="text-white text-sm font-bold">{title}</p>
      <p className="text-zinc-500 text-xs">{subtitle}</p>
    </Link>
  );
}
