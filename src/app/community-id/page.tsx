// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Copy, Check, Share2, Twitter } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const LEVELS = [
  { min:0,    name:'Newcomer',     badge:'🌱', color:'text-zinc-400' },
  { min:100,  name:'Cruiser',      badge:'🚌', color:'text-blue-400' },
  { min:500,  name:'Connector',    badge:'🔗', color:'text-green-400' },
  { min:1000, name:'Hub Star',     badge:'⭐', color:'text-yellow-400' },
  { min:2500, name:'Culture King', badge:'👑', color:'text-orange-400' },
  { min:5000, name:'Legend',       badge:'🏆', color:'text-yellow-300' },
];
function getLevel(pts: number) {
  return [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0];
}

export default function CommunityIDPage() {
  const { user }          = useAuth();
  const [profile, setP]   = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => setP(data));
  }, [user]);

  if (!profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const level    = getLevel(profile.points || 0);
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-GB', { month:'short', year:'numeric' });
  const refLink  = `https://cruise-connect-hub.vercel.app?ref=${profile.referral_code}`;

  const shareText = `Just copped my C&C Hub Community ID 🚌✨\n\n🆔 ${profile.referral_code}\n👤 ${profile.display_name || profile.username}\n${level.badge} ${level.name} · ${(profile.points||0).toLocaleString()} pts\n📅 Member since ${joinDate}\n\n@TheCruiseCH #CruiseAndConnect`;

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <Navbar />
      <main className="max-w-sm mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-white mb-6 text-center">Your Community ID</h1>

        {/* ID Card */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-yellow-400/30 rounded-3xl p-6 mb-6 shadow-2xl shadow-yellow-400/5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-yellow-400 font-black text-sm tracking-wider">CRUISE & CONNECT HUB〽️</div>
            <div className="text-zinc-500 text-xs">MEMBER ID</div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-yellow-400/30" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400/30 flex items-center justify-center text-3xl font-black text-yellow-400">
                {(profile.display_name||profile.username||'?')[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-black text-lg">{profile.display_name || profile.username}</p>
              <p className="text-zinc-400 text-sm">@{profile.username}</p>
              {profile.twitter_handle && (
                <p className="text-zinc-500 text-xs mt-0.5">{profile.twitter_handle}</p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Level',  value: `${level.badge} ${level.name}` },
              { label: 'Points', value: (profile.points || 0).toLocaleString() },
              { label: 'Joined', value: joinDate },
            ].map(s => (
              <div key={s.label} className="bg-zinc-800/50 rounded-xl p-2.5 text-center">
                <div className="text-white text-xs font-bold">{s.value}</div>
                <div className="text-zinc-600 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ID code */}
          <div className="bg-zinc-950 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-zinc-500 text-xs">Member Code</div>
              <div className="text-yellow-400 font-black tracking-widest">{profile.referral_code || '—'}</div>
            </div>
            <div className="w-10 h-10 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center">
              <span className="text-yellow-400 text-lg">〽️</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-black py-3.5 rounded-xl hover:bg-yellow-300 transition-colors">
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Referral Link</>}
          </button>

          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </a>

          <p className="text-center text-zinc-600 text-xs">Share your ID to invite friends · Earn ₦1,000 per join</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
