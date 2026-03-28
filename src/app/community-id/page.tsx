// @ts-nocheck
'use client';
import AppHeader from '@/components/layout/AppHeader';
import { useState, useEffect } from 'react';
import { Copy, CheckCheck, Share2, Download, RotateCcw } from 'lucide-react';

import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cruise-connect-hub.vercel.app';
const appHost = new URL(appUrl).host;

const LEVELS: Record<string, string> = {
  newcomer: 'Newcomer', cruiser: 'Cruiser', connector: 'Connector',
  hub_star: 'Hub Star', culture_king: 'Culture King', legend: 'Legend',
};

function getLevelName(pts: number) {
  if (pts >= 5000) return 'Legend';
  if (pts >= 2500) return 'Culture King';
  if (pts >= 1000) return 'Hub Star';
  if (pts >= 500)  return 'Connector';
  if (pts >= 100)  return 'Cruiser';
  return 'Newcomer';
}

export default function CommunityIDPage() {
  const { user }          = useAuth();
  const [profile, setP]   = useState<any>(null);
  const [flipped, setF]   = useState(false);
  const [copied, setC]    = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => setP(data));
  }, [user]);

  if (!user || !profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <AppHeader title="Member ID" back />
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const displayName = profile.display_name || profile.username || 'Member';
  const username    = profile.username || 'user';
  const refCode     = profile.referral_code || 'CCH-000000';
  const level       = getLevelName(profile.points || 0);
  const joinDate    = new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  const profileUrl  = `${appUrl}?ref=${refCode}`;
  const qrUrl       = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=000000&margin=10`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setC(true); setTimeout(() => setC(false), 2000);
  };

  const shareCard = () => {
    if (navigator.share) {
      navigator.share({ title: 'My CC Hub Member Card', text: `I'm a ${level} at Cruise & Connect Hub!`, url: profileUrl });
    } else copyLink();
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      
      <main className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center">

        <h1 className="text-2xl font-black text-white mb-1 text-center">Member ID Card</h1>
        <p className="text-zinc-500 text-xs mb-8 text-center">Tap the card to flip it</p>

        {/* ─── FLIP CARD ─────────────────────────────────── */}
        <div
          onClick={() => setF(!flipped)}
          className="cursor-pointer w-[300px] h-[420px]"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* ══ FRONT ══════════════════════════════════════ */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1400] via-[#0d0d0d] to-[#0a0800]" />

              {/* Bokeh glow spots */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[15%] left-[20%] w-28 h-28 rounded-full bg-yellow-500/10 blur-2xl" />
                <div className="absolute bottom-[20%] right-[10%] w-36 h-36 rounded-full bg-amber-400/8 blur-3xl" />
                <div className="absolute top-[40%] right-[25%] w-20 h-20 rounded-full bg-yellow-300/6 blur-xl" />
                <div className="absolute bottom-[35%] left-[5%] w-24 h-24 rounded-full bg-amber-600/8 blur-2xl" />
              </div>

              {/* Glass orbs */}
              <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm" />
              <div className="absolute -top-4 right-4 w-20 h-20 rounded-full border border-white/5 bg-white/2" />
              <div className="absolute bottom-12 -right-8 w-32 h-32 rounded-full border border-white/5 bg-white/2" />
              <div className="absolute bottom-32 left-2 w-16 h-16 rounded-full border border-white/5 bg-white/2" />

              {/* Gold curved border top */}
              <div className="absolute top-3 left-3 right-3 h-20 rounded-2xl border border-yellow-500/30"
                style={{ boxShadow: '0 0 12px rgba(245,166,35,0.15) inset' }} />

              {/* Gold sparkle particles */}
              {[
                { top:'18%',left:'15%',size:'2px' }, { top:'30%',left:'70%',size:'1.5px' },
                { top:'55%',left:'25%',size:'2px' }, { top:'65%',right:'20%',size:'1.5px' },
                { top:'75%',left:'60%',size:'2px' }, { top:'85%',left:'35%',size:'1.5px' },
                { top:'45%',right:'12%',size:'2px' }, { top:'22%',right:'35%',size:'1px' },
              ].map((p,i) => (
                <div key={i} className="absolute rounded-full bg-yellow-300/70 animate-pulse"
                  style={{ top:p.top, left:p.left, right:(p as any).right, width:p.size, height:p.size,
                    animationDelay:`${i*0.4}s`, animationDuration:`${2+i*0.3}s` }} />
              ))}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center h-full px-6 pt-6 pb-6">
                {/* Header */}
                <div className="text-center mb-5">
                  <p className="text-yellow-400 font-black text-xl tracking-widest leading-tight"
                    style={{ textShadow: '0 0 20px rgba(245,166,35,0.6), 0 0 40px rgba(245,166,35,0.3)' }}>
                    CRUISE CONNECT
                  </p>
                  <p className="text-yellow-500/80 font-bold text-sm tracking-[0.3em]">COMMUNITY</p>
                </div>

                {/* Photo placeholder */}
                <div className="relative mb-5">
                  <div className="w-[110px] h-[130px] rounded-2xl overflow-hidden"
                    style={{
                      border: '2px solid rgba(245,166,35,0.6)',
                      boxShadow: '0 0 20px rgba(245,166,35,0.4), 0 0 40px rgba(245,166,35,0.15), inset 0 0 20px rgba(245,166,35,0.05)',
                    }}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400/10 to-amber-600/5 flex items-center justify-center">
                        <span className="text-5xl font-black text-yellow-400/60">
                          {displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Corner glow accents */}
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-yellow-400/70 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-yellow-400/70 rounded-br" />
                </div>

                {/* Name & details */}
                <div className="text-center space-y-1.5">
                  <p className="text-yellow-400 font-black text-2xl leading-tight"
                    style={{ textShadow: '0 0 15px rgba(245,166,35,0.5)' }}>
                    {displayName}
                  </p>
                  <p className="text-white/80 font-bold text-xs tracking-wider">
                    MEMBERSHIP ID: {refCode}
                  </p>
                  <p className="text-yellow-500/70 text-xs">
                    {level} &nbsp;|&nbsp; Joined: {joinDate}
                  </p>
                </div>

                {/* Bottom gold line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.6) 30%, rgba(245,166,35,0.8) 50%, rgba(245,166,35,0.6) 70%, transparent)' }} />
              </div>
            </div>

            {/* ══ BACK ════════════════════════════════════════ */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1400] via-[#0d0d0d] to-[#0a0800]" />

              {/* Bokeh */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] right-[15%] w-32 h-32 rounded-full bg-yellow-500/8 blur-3xl" />
                <div className="absolute bottom-[25%] left-[10%] w-28 h-28 rounded-full bg-amber-400/8 blur-2xl" />
                <div className="absolute top-[50%] right-[5%] w-20 h-20 rounded-full bg-yellow-300/6 blur-xl" />
              </div>

              {/* Glass orbs */}
              <div className="absolute top-20 -right-8 w-24 h-24 rounded-full border border-white/5 bg-white/2" />
              <div className="absolute bottom-16 -left-8 w-28 h-28 rounded-full border border-white/5 bg-white/2" />
              <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full border border-white/5 bg-white/2" />

              {/* Gold sparkle particles */}
              {[
                { top:'12%',right:'25%',size:'1.5px' }, { top:'35%',left:'8%',size:'2px' },
                { top:'60%',right:'15%',size:'1.5px' }, { top:'80%',left:'45%',size:'2px' },
                { top:'25%',left:'30%',size:'1px' },
              ].map((p,i) => (
                <div key={i} className="absolute rounded-full bg-yellow-300/70 animate-pulse"
                  style={{ top:p.top, left:p.left, right:(p as any).right, width:p.size, height:p.size,
                    animationDelay:`${i*0.5}s`, animationDuration:`${2.5+i*0.3}s` }} />
              ))}

              {/* Curved gold line top-left */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-br-full border-b-2 border-r-2 border-yellow-500/20" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center h-full px-5 pt-5 pb-4">
                {/* Logo */}
                <div className="text-4xl mb-1">🚌</div>
                <p className="text-white font-black text-lg leading-tight text-center">
                  Cruise &amp; Connect <span className="text-yellow-400">Hub〽️</span>
                </p>
                <p className="text-zinc-400 text-[11px] mb-3">Where Community Meets Culture.</p>

                {/* Divider */}
                <div className="w-full h-px mb-3"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.4), transparent)' }} />

                {/* QR Code */}
                <p className="text-zinc-400 font-bold text-[10px] tracking-widest mb-2">SCAN TO VERIFY</p>
                <div className="p-2 bg-white rounded-xl mb-4"
                  style={{ boxShadow: '0 0 20px rgba(245,166,35,0.2)' }}>
                  <img src={qrUrl} alt="QR Code" className="w-[120px] h-[120px]" />
                </div>

                {/* Social handles */}
                <div className="w-full space-y-1.5 mb-3">
                  {[
                    { icon: '🌐', handle: `@${username}` },
                    { icon: '📸', handle: profile.twitter_handle || `@${username}` },
                    { icon: '🐦', handle: profile.twitter_handle || `@${username}` },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-white/80 font-semibold text-xs">{s.handle}</span>
                    </div>
                  ))}
                </div>

                {/* Website pill */}
                <div className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-full py-1.5 px-4">
                  <span className="text-xs">🌐</span>
                  <span className="text-white/70 text-[11px]">{appHost}</span>
                </div>

                {/* Bottom gold line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.6) 30%, rgba(245,166,35,0.8) 50%, rgba(245,166,35,0.6) 70%, transparent)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Flip hint */}
        <div className="flex items-center gap-2 mt-4 text-zinc-600 text-xs">
          <RotateCcw className="w-3 h-3" />
          {flipped ? 'Tap to see front' : 'Tap to see back'}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 w-full">
          <button onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm py-3.5 rounded-2xl hover:bg-yellow-300 transition-all active:scale-95">
            {copied ? <><CheckCheck className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
          </button>
          <button onClick={shareCard}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-white font-bold text-sm py-3.5 rounded-2xl hover:border-zinc-500 hover:bg-zinc-800 transition-all active:scale-95">
            <Share2 className="w-4 h-4" /> Share Card
          </button>
        </div>

        {/* X share */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just copped my official Cruise & Connect Hub member card! 🚌✨\n\n🆔 ${refCode}\n⭐ ${level} Member\n\n@TheCruiseCH #CruiseAndConnect #CCHub`)}`}
          target="_blank" rel="noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white font-bold text-sm py-3 rounded-2xl hover:border-zinc-600 transition-all">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Flex on X
        </a>

      </main>
      <BottomNav />
    </div>
  );
}
