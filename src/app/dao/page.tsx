// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Vote, Plus, Clock, CheckCircle, XCircle, Users, Loader2, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:      { label: 'Open',        color: 'text-green-400 bg-green-400/10'  },
  passed:      { label: 'Passed ✅',   color: 'text-blue-400 bg-blue-400/10'   },
  rejected:    { label: 'Rejected',    color: 'text-red-400 bg-red-400/10'     },
  implemented: { label: 'Live 🚀',     color: 'text-yellow-400 bg-yellow-400/10'},
  draft:       { label: 'Draft',       color: 'text-zinc-400 bg-zinc-800'      },
};

const CAT_EMOJI: Record<string, string> = {
  rules:'⚖️', features:'✨', events:'🎉', moderation:'🛡️',
  treasury:'💰', partnerships:'🤝', general:'💬',
};

function timeLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
}

export default function DAOPage() {
  const { user }            = useAuth();
  const [proposals, setPs]  = useState<any[]>([]);
  const [loading, setLd]    = useState(true);
  const [filter, setFilter] = useState('all');
  const [userVotes, setUV]  = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setLd(true);
      try {
        const r = await fetch('/api/dao');
        const d = await r.json();
        setPs(d.proposals || []);
      } catch {}
      setLd(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!user || proposals.length === 0) return;
    fetch('/api/dao?my_votes=1').then(r => r.json()).then(d => {
      const map: Record<string, string> = {};
      (d.votes || []).forEach((v: any) => { map[v.proposal_id] = v.vote; });
      setUV(map);
    }).catch(() => {});
  }, [user, proposals]);

  const vote = async (proposalId: string, voteChoice: string) => {
    if (!user || userVotes[proposalId]) return;
    // Optimistic update
    setUV(prev => ({ ...prev, [proposalId]: voteChoice }));
    setPs(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      return { ...p, [`votes_${voteChoice}`]: (p[`votes_${voteChoice}`] || 0) + 1 };
    }));
    try {
      const res = await fetch('/api/dao/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: proposalId, vote: voteChoice }),
      });
      if (!res.ok) {
        // Revert on failure
        setUV(prev => { const s = {...prev}; delete s[proposalId]; return s; });
        setPs(prev => prev.map(p => {
          if (p.id !== proposalId) return p;
          return { ...p, [`votes_${voteChoice}`]: Math.max(0, (p[`votes_${voteChoice}`] || 1) - 1) };
        }));
        const d = await res.json();
        alert(d.error || "Vote failed. Try again.");
      }
    } catch {
      // Revert on network error
      setUV(prev => { const s = {...prev}; delete s[proposalId]; return s; });
    }
  };

  const filtered = filter === 'all'
    ? proposals
    : proposals.filter(p => p.status === filter);

  const FILTERS = [
    { v: 'all',      l: 'All' },
    { v: 'active',   l: '🟢 Active' },
    { v: 'passed',   l: '✅ Passed' },
    { v: 'implemented', l: '🚀 Live' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="DAO Voting" back action={
        user && <Link href="/dao/create" className="p-2 text-yellow-400"><Plus className="w-5 h-5" /></Link>
      } />

      {/* Filter pills */}
      <div className="flex gap-2 px-4 mt-4 mb-5 overflow-x-auto scrollbar-none">
        {FILTERS.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === f.v ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-yellow-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚖️</div>
            <p className="text-white font-bold text-lg mb-1">No proposals yet</p>
            <p className="text-zinc-500 text-sm mb-6">Be the first to propose something</p>
            {user && (
              <Link href="/dao/create" className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-black font-black rounded-full text-sm">
                <Plus className="w-4 h-4" /> New Proposal
              </Link>
            )}
          </div>
        ) : filtered.map(p => {
          const cfg      = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
          const catEmoji = CAT_EMOJI[p.category] || '💬';
          const total    = (p.votes_for || 0) + (p.votes_against || 0) + (p.votes_abstain || 0);
          const forPct   = total > 0 ? Math.round((p.votes_for || 0) / total * 100) : 0;
          const myVote   = userVotes[p.id];
          const isActive = p.status === 'active';

          return (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">{catEmoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    {isActive && p.voting_ends_at && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />{timeLeft(p.voting_ends_at)}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-white text-sm leading-tight">{p.title}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${forPct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                <span className="text-green-400 font-bold">{p.votes_for || 0} for</span>
                <span>{total} total votes</span>
                <span className="text-red-400 font-bold">{p.votes_against || 0} against</span>
              </div>

              {/* Vote buttons or voted state */}
              {isActive && user && (
                myVote ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                    <CheckCircle className="w-4 h-4 text-yellow-400" />
                    You voted <span className="text-yellow-400 font-bold">{myVote}</span>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2 border-t border-zinc-800">
                    <button onClick={() => vote(p.id, 'for')}
                      className="flex-1 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold rounded-xl active:scale-95">
                      👍 For
                    </button>
                    <button onClick={() => vote(p.id, 'against')}
                      className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl active:scale-95">
                      👎 Against
                    </button>
                    <button onClick={() => vote(p.id, 'abstain')}
                      className="flex-1 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold rounded-xl active:scale-95">
                      🤷 Abstain
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
