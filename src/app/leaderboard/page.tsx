// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Trophy, Medal, Loader2, Crown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LeaderboardPage() {
  const { user }            = useAuth();
  const [data, setData]     = useState<any[]>([]);
  const [season, setSeason] = useState<any>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState<'points'|'referrals'|'streak'>('points');

  useEffect(() => {
    fetch(`/api/leaderboard?type=${tab}&limit=50`)
      .then(r => r.json())
      .then(d => {
        setData(d.leaderboard || []);
        setSeason(d.season || null);
        if (user && d.leaderboard) {
          const idx = d.leaderboard.findIndex((e: any) => e.id === user.id);
          setMyRank(idx >= 0 ? idx + 1 : null);
        }
        setLoading(false);
      });
  }, [tab, user]);

  const medals = ['🥇','🥈','🥉'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="w-7 h-7 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-black text-white">Leaderboard</h1>
            {season && <p className="text-zinc-400 text-xs">{season.name} · Prize: {season.prize_pool || '₦100K'}</p>}
          </div>
        </div>

        {/* My rank banner */}
        {myRank && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-3 mb-5 flex items-center justify-between">
            <span className="text-yellow-400 font-bold text-sm">Your rank this season</span>
            <span className="text-white font-black text-xl">#{myRank}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
          {(['points','referrals','streak'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setLoading(true); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${tab === t ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <Crown className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p>No rankings yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((member: any, i: number) => {
              const isMe = user?.id === member.id;
              const val  = tab === 'points' ? `${(member.points||0).toLocaleString()} pts`
                         : tab === 'referrals' ? `${member.referral_count||0} invites`
                         : `${member.current_streak||0} days`;
              return (
                <div key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    isMe ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-zinc-900 border-zinc-800'
                  }`}>
                  <div className="w-8 text-center font-black text-sm flex-shrink-0">
                    {i < 3 ? <span className="text-lg">{medals[i]}</span> : <span className="text-zinc-500">#{i+1}</span>}
                  </div>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-yellow-400/20 flex items-center justify-center text-sm font-black text-yellow-400 flex-shrink-0">
                      {(member.display_name||member.username||'?')[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                      {member.display_name || member.username || 'Member'}
                      {isMe && <span className="text-xs text-yellow-400/60 ml-1">(you)</span>}
                    </p>
                    <p className="text-zinc-500 text-xs">@{member.username}</p>
                  </div>
                  <span className={`font-black text-sm ${isMe ? 'text-yellow-400' : 'text-white'}`}>{val}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
