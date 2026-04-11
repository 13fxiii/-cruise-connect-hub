// @ts-nocheck
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Download, Share2, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const INTERESTS = [
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'movies', label: 'Movies' },
  { id: 'business', label: 'Business' },
  { id: 'afrobeats', label: 'Afrobeats' },
  { id: 'tech', label: 'Tech' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'sports', label: 'Sports' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'art', label: 'Art' },
  { id: 'food', label: 'Food' },
  { id: 'travel', label: 'Travel' },
];

const COMMUNITY_RULES = {
  dos: [
    '🤝 Respect every member — we ride together',
    '🎶 Share music, creativity & Naija culture',
    '💬 Engage genuinely — real talk only',
    '🚀 Hype each other\'s wins & growth',
    '📢 Promote your work tastefully',
    '🛡️ Report anything sus to the admins',
  ],
  donts: [
    '🚫 No hate speech, discrimination or bullying',
    '🚫 No spam, scams or fake promotions',
    '🚫 No unsolicited DMs or harassment',
    '🚫 No NSFW content in public spaces',
    '🚫 No spreading misinformation',
    '🚫 No begging or aggressive soliciting',
  ],
};

const HOW_TO_USE = [
  { icon: '📰', title: 'Feed', desc: 'Your community timeline — post, react, connect with 3,000+ members' },
  { icon: '🎮', title: 'Games Hub', desc: 'Play Naija Wordle, Trivia, Ludo & compete in tournaments for prize pools' },
  { icon: '🎵', title: 'Music', desc: 'Stream Afrobeats stations & discover indie Naija artists first' },
  { icon: '🎬', title: 'Movies', desc: 'Watch party with the community — vote on what to stream next' },
  { icon: '💰', title: 'Wallet', desc: 'Fund your wallet with Paystack, earn points, withdraw winnings' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Climb the ranks — top members get shoutouts & rewards' },
  { icon: '💼', title: 'Jobs Board', desc: 'Find Naija & remote gigs posted by community members' },
  { icon: '🛍️', title: 'Merch', desc: 'Rep the culture — limited CC Hub drops, design your own' },
];

// ── Community ID Card Component ──────────────────────────────────────────────
function IDCard({ user, username, displayName, avatar, memberNumber }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `CCHub_ID_${username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size: Twitter header ratio 3:1  (1500x500)
    canvas.width = 1500;
    canvas.height = 500;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 1500, 500);
    bg.addColorStop(0, '#0a0a0a');
    bg.addColorStop(0.5, '#1a1200');
    bg.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1500, 500);

    // Yellow accent bar top
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(0, 0, 1500, 8);
    ctx.fillRect(0, 492, 1500, 8);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(234,179,8,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1500; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke();
    }
    for (let y = 0; y < 500; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1500, y); ctx.stroke();
    }

    // Glow circle behind avatar
    const glow = ctx.createRadialGradient(200, 250, 0, 200, 250, 150);
    glow.addColorStop(0, 'rgba(234,179,8,0.2)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 500, 500);

    // Avatar circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 250, 110, 0, Math.PI * 2);
    ctx.strokeStyle = '#EAB308';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.clip();

    if (avatar) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 90, 140, 220, 220);
        ctx.restore();
        drawText(ctx, displayName, username, memberNumber);
      };
      img.onerror = () => {
        ctx.restore();
        // Fallback: initials
        ctx.fillStyle = '#EAB308';
        ctx.arc(200, 250, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((displayName || username || 'U')[0].toUpperCase(), 200, 275);
        drawText(ctx, displayName, username, memberNumber);
      };
      img.src = avatar;
    } else {
      ctx.restore();
      drawText(ctx, displayName, username, memberNumber);
    }

    function drawText(ctx, displayName, username, memberNumber) {
      // CC Hub branding
      ctx.textAlign = 'left';
      ctx.fillStyle = '#EAB308';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('CRUISE & CONNECT HUB〽️', 380, 100);

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px Arial';
      ctx.fillText('COMMUNITY MEMBER ID', 380, 128);

      // Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 72px Arial';
      const name = displayName || username || 'Member';
      ctx.fillText(name.length > 18 ? name.slice(0, 18) + '…' : name, 380, 230);

      // Username
      ctx.fillStyle = '#EAB308';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('@' + (username || 'member'), 380, 285);

      // Member number
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '24px Arial';
      ctx.fillText(`Member #${memberNumber}`, 380, 340);

      // Bottom bar
      ctx.fillStyle = '#EAB308';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('cruise-connect-hub.vercel.app  |  @CCHub_  |  @13fxiii_', 380, 420);

      // Barcode lines (decorative)
      ctx.fillStyle = 'rgba(234,179,8,0.3)';
      const bx = 1280;
      for (let i = 0; i < 30; i++) {
        const w = Math.random() > 0.5 ? 3 : 6;
        ctx.fillRect(bx + i * 6, 380, w, 60);
      }
    }
  }, [avatar, displayName, username, memberNumber]);

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-yellow-400/30 shadow-lg shadow-yellow-400/10"
        style={{ imageRendering: 'crisp-edges' }}
      />
      <div className="flex gap-2">
        <button
          onClick={downloadCard}
          className="flex-1 bg-yellow-400 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Download Card
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Check me out on Cruise Connect Hub!',
                text: `I just joined @CCHub_ — the hottest Naija community! Come cruise with us 🚌⚡`,
                url: 'https://cruise-connect-hub.vercel.app',
              });
            }
          }}
          className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          <Share2 className="w-4 h-4" /> Share on X
        </button>
      </div>
      <p className="text-zinc-500 text-xs text-center">
        Use this as your X banner/header to rep the culture 🚌
      </p>
    </div>
  );
}

// ── Welcome Animation Component ───────────────────────────────────────────────
function WelcomeAnimation({ displayName, avatar, onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: phase >= 2
            ? 'radial-gradient(ellipse at center, rgba(234,179,8,0.12) 0%, transparent 70%)'
            : 'transparent',
        }}
      />

      {/* Bus road lines */}
      {phase >= 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden">
          <div
            className="flex gap-8 h-full"
            style={{ animation: 'slideLeft 0.8s linear infinite' }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="bg-yellow-400 w-16 h-full rounded-full opacity-60" />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6 px-8 text-center">

        {/* Logo + Bus emoji */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(30px)',
          }}
        >
          <div className="text-6xl mb-2">🚌</div>
          <div className="text-yellow-400 font-black text-xs tracking-widest">CRUISE & CONNECT HUB〽️</div>
        </div>

        {/* Welcome text */}
        <div
          className="transition-all duration-700 delay-100"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <h1 className="text-white font-black text-2xl leading-tight">
            WELCOME TO<br />
            <span className="text-yellow-400">THE BUS</span> 🔥
          </h1>
        </div>

        {/* Avatar + Name */}
        <div
          className="transition-all duration-700 delay-200 flex items-center gap-3 bg-zinc-900/80 border border-yellow-400/30 rounded-2xl px-5 py-3"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-10 h-10 rounded-full border-2 border-yellow-400" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-lg">
              {(displayName || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <p className="text-yellow-400 font-black text-sm">{displayName}</p>
            <p className="text-zinc-500 text-xs">You're officially on the bus 🚌</p>
          </div>
        </div>

        {/* Tagline */}
        <div
          className="transition-all duration-700 delay-300"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p className="text-zinc-400 text-sm">We dey Cruise, we dey Connect & Grow 🚀🤝</p>
        </div>
      </div>

      {/* Skip / Continue button — appears after phase 3 */}
      {phase >= 3 && (
        <button
          onClick={onDone}
          className="absolute bottom-12 bg-yellow-400 text-black font-black px-8 py-3 rounded-full text-sm transition-all duration-500"
          style={{ opacity: phase >= 4 ? 1 : 0.7 }}
        >
          Let's Go ⚡
        </button>
      )}

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-128px); }
        }
      `}</style>
    </div>
  );
}

// ── Main Onboarding Page ──────────────────────────────────────────────────────
export default function OnboardingPage() {
  // Steps: -1=welcome-anim, 0=rules, 1=interests, 2=id-card, 3=tutorial, 4=done
  const [step, setStep] = useState(-1);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [memberNumber, setMemberNumber] = useState(1000);
  const [tutorialIdx, setTutorialIdx] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace('/auth/login'); return; }

      setUser(data.user);
      const meta = data.user.user_metadata || {};

      // Pull X/Twitter data automatically
      const xDisplayName = meta.full_name || meta.name || meta.preferred_username || 'CC Member';
      const xUsername = (meta.preferred_username || meta.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30)
        || `user_${data.user.id.slice(0, 6)}`;
      const xAvatar = meta.avatar_url || meta.picture || '';

      setProfile({
        display_name: xDisplayName,
        username: xUsername,
        avatar: xAvatar,
      });

      // Count members for ID number
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      setMemberNumber(1000 + (count || 0));

      // Check if already onboarded
      const { data: existingProfile } = await supabase
        .from('profiles').select('onboarding_done, interests').eq('id', data.user.id).maybeSingle();

      if (existingProfile?.onboarding_done) {
        router.replace('/feed');
      }
    })();
  }, []);

  const handleFinish = async () => {
    if (!user || interests.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          display_name: profile.display_name,
          x_username: profile.username,
          x_display_name: profile.display_name,
          x_avatar_url: profile.avatar,
          avatar_url: profile.avatar,
          interests,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      setLoading(false);
      setStep(2); // Show ID card
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ── Welcome animation ──
  if (step === -1) {
    return (
      <WelcomeAnimation
        displayName={profile?.display_name || ''}
        avatar={profile?.avatar || ''}
        onDone={() => setStep(0)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 pb-12">
      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="text-center">
          <div className="text-yellow-400 font-black text-sm tracking-wider mb-1">🚌 CRUISE CONNECT HUB〽️</div>
          <div className="flex items-center justify-center gap-1.5">
            {['Rules', 'Vibe', 'Your ID', 'How It Works'].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center transition-all ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < 3 && <div className={`w-4 h-0.5 rounded-full ${i < step ? 'bg-green-500' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 0: COMMUNITY RULES ── */}
        {step === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* User card at top */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-transparent border-b border-zinc-800 p-4 flex items-center gap-3">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-yellow-400" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-xl">
                  {(profile.display_name || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-black text-sm">{profile.display_name}</p>
                <p className="text-yellow-400 text-xs">@{profile.username}</p>
              </div>
              <div className="ml-auto text-2xl">🎉</div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-white font-black text-lg">The Bus Rules 🚌</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Read these — we run a tight ship</p>
              </div>

              <div className="space-y-2">
                <p className="text-green-400 text-xs font-black tracking-wider">✅ THE DO'S</p>
                {COMMUNITY_RULES.dos.map((rule, i) => (
                  <div key={i} className="bg-green-500/5 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-zinc-300">
                    {rule}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-red-400 text-xs font-black tracking-wider">❌ THE DON'TS</p>
                {COMMUNITY_RULES.donts.map((rule, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-zinc-300">
                    {rule}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                I Agree, Let's Ride 🚌 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: INTERESTS ── */}
        {step === 1 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-black text-lg">Your Vibe 🔥</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Pick at least 1 interest (max 6)</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {INTERESTS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() =>
                    setInterests((p) =>
                      p.includes(id) ? p.filter((x) => x !== id) : p.length < 6 ? [...p, id] : p
                    )
                  }
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    interests.includes(id)
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                      : 'border-zinc-700 text-zinc-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={interests.length === 0 || loading}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Setting you up...</>
              ) : (
                <>Get My ID Card 🪪</>
              )}
            </button>

            <button onClick={() => setStep(0)} className="w-full text-zinc-500 text-xs py-1">
              ← Back
            </button>
          </div>
        )}

        {/* ── STEP 2: COMMUNITY ID CARD ── */}
        {step === 2 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-black text-lg">Your CC Hub ID 🪪</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Download & use as your X banner to rep the culture!</p>
            </div>

            <IDCard
              user={user}
              username={profile.username}
              displayName={profile.display_name}
              avatar={profile.avatar}
              memberNumber={memberNumber}
            />

            <button
              onClick={() => setStep(3)}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              Next: See How It Works <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 3: HOW TO USE ── */}
        {step === 3 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-black text-lg">Your Control Room 🎛️</h2>
              <p className="text-zinc-500 text-xs mt-0.5">
                Here's everything the bus has to offer — tap through
              </p>
            </div>

            {/* Feature card */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-center space-y-2 min-h-[140px] flex flex-col items-center justify-center">
              <div className="text-5xl">{HOW_TO_USE[tutorialIdx].icon}</div>
              <p className="text-yellow-400 font-black text-base">{HOW_TO_USE[tutorialIdx].title}</p>
              <p className="text-zinc-400 text-xs leading-relaxed">{HOW_TO_USE[tutorialIdx].desc}</p>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5">
              {HOW_TO_USE.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTutorialIdx(i)}
                  className={`rounded-full transition-all ${
                    i === tutorialIdx ? 'w-6 h-2 bg-yellow-400' : 'w-2 h-2 bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setTutorialIdx((p) => Math.max(0, p - 1))}
                disabled={tutorialIdx === 0}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-400 font-black py-3 rounded-xl text-sm disabled:opacity-30"
              >
                ← Prev
              </button>
              {tutorialIdx < HOW_TO_USE.length - 1 ? (
                <button
                  onClick={() => setTutorialIdx((p) => p + 1)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-black py-3 rounded-xl text-sm"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => { window.location.href = '/feed'; }}
                  className="flex-1 bg-yellow-400 text-black font-black py-3 rounded-xl text-sm"
                >
                  Enter the Hub 🚌
                </button>
              )}
            </div>

            <button
              onClick={() => { window.location.href = '/feed'; }}
              className="w-full text-zinc-500 text-xs py-1"
            >
              Skip tutorial →
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-zinc-700 text-xs text-center">
          Created by <span className="text-zinc-500">FX〽️ (Augustine Fagbohun)</span> •{' '}
          <a href="mailto:CruiseConnectHub@gmail.com" className="text-yellow-400/60">
            CruiseConnectHub@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
