// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Mic, Users, ExternalLink, Plus, Radio, Clock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Starting soon';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

export default function SpacesPage() {
  const [tab, setTab]       = useState<'live'|'scheduled'>('live');
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLd]    = useState(true);

  const load = async (status: string) => {
    setLd(true);
    try {
      const r = await fetch(`/api/spaces?status=${status}`);
      const d = await r.json();
      setSpaces(d.spaces || []);
    } catch {}
    setLd(false);
  };

  useEffect(() => { load(tab === 'live' ? 'live' : 'scheduled'); }, [tab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Cruise Connect Live Spaces" action={
        <Link href="/spaces/create" className="p-2 text-yellow-400"><Plus className="w-5 h-5" /></Link>
      } back />

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 mb-5 bg-zinc-900 p-1 rounded-2xl">
        {(['live','scheduled'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl capitalize transition-all ${
              tab === t ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}>
            {t === 'live' ? '🔴 Live Now' : '📅 Scheduled'}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-yellow-400 animate-spin" /></div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{tab === 'live' ? '🎙️' : '📅'}</div>
            <p className="text-white font-bold text-lg mb-1">
              {tab === 'live' ? 'No live spaces' : 'Nothing scheduled'}
            </p>
            <p className="text-zinc-500 text-sm mb-6">
              {tab === 'live' ? 'Check back soon or start one yourself' : 'Schedule the next big cruise'}
            </p>
            <Link href="/spaces/create" className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-black font-black rounded-full text-sm">
              <Plus className="w-4 h-4" /> Host a Space
            </Link>
          </div>
        ) : spaces.map(space => (
          <SpaceCard key={space.id} space={space} tab={tab} />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

function SpaceCard({ space, tab }: any) {
  const isLive = space.status === 'live';
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLive
              ? <span className="flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />LIVE</span>
              : <span className="flex items-center gap-1 text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />{timeUntil(space.scheduled_at)}</span>
            }
          </div>
          <h3 className="font-bold text-white text-base leading-tight truncate">{space.title}</h3>
          {space.description && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{space.description}</p>}
        </div>
        <div className="shrink-0 w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
          {isLive ? <Radio className="w-5 h-5 text-red-400 animate-pulse" /> : <Clock className="w-5 h-5 text-blue-400" />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {space.host && <span className="font-medium">@{space.host.username}</span>}
          {isLive && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{space.listener_count || 0}</span>}
        </div>
        {(space.x_space_url || space.twitter_space_url) && (
          <a href={space.x_space_url || space.twitter_space_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-black text-xs font-black rounded-full">
            {isLive ? <><Mic className="w-3.5 h-3.5" /> Join</> : <><ExternalLink className="w-3.5 h-3.5" /> RSVP</>}
          </a>
        )}
      </div>
    </div>
  );
}
