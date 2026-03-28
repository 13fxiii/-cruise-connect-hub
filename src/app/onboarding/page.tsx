// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, QrCode, Loader2, AlertCircle, Share2 } from "lucide-react";

const INTERESTS = [
  {id:"music",label:"Music 🎵"},{id:"gaming",label:"Gaming 🎮"},
  {id:"movies",label:"Movies 🎬"},{id:"business",label:"Business 💼"},
  {id:"afrobeats",label:"Afrobeats 🔥"},{id:"tech",label:"Tech 💻"},
  {id:"fashion",label:"Fashion 👗"},{id:"sports",label:"Sports ⚽"},
  {id:"comedy",label:"Comedy 😂"},{id:"art",label:"Art 🎨"},
  {id:"food",label:"Food 🍛"},{id:"travel",label:"Travel ✈️"},
];

const RULES = [
  {n:1,emoji:"🤝",title:"Respect Everyone",body:"Zero tolerance for hate speech, discrimination, or bullying."},
  {n:2,emoji:"✅",title:"Keep It Real",body:"No spam, fake accounts, or misleading content."},
  {n:3,emoji:"🔞",title:"No Explicit Content",body:"No pornographic or graphic violent material."},
  {n:4,emoji:"🔒",title:"Protect Privacy",body:"Never share personal info about others without consent."},
  {n:5,emoji:"📢",title:"No Self-Promo Spam",body:"Max one self-promo post per day. Excessive = ban."},
  {n:6,emoji:"💬",title:"Engage Positively",body:"Constructive criticism welcome. No trolling or personal attacks."},
  {n:7,emoji:"🇳🇬",title:"Support Naija Creatives",body:"Big up artists, musicians, creators and entrepreneurs."},
  {n:8,emoji:"⚖️",title:"Obey the Mods",body:"Respect mod decisions. Disagree privately, not publicly."},
  {n:9,emoji:"🎯",title:"Stay On Theme",body:"Participate in daily themes and activities."},
  {n:10,emoji:"🚌",title:"Have Fun",body:"This is a safe space to connect, grow, and celebrate!"},
];

const STEPS = ["Rules","Profile","Interests","Done"];

export default function OnboardingPage() {
  const [step, setStep]       = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [form, setForm]       = useState({ display_name:"", username:"", twitter_handle:"", bio:"" });
  const [interests, setInts]  = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [user, setUser]       = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return; }
      setUser(data.user);
      const meta = data.user.user_metadata || {};
      setForm(f => ({
        ...f,
        display_name: meta.full_name || meta.name || "",
        username: (meta.username || meta.preferred_username || "").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,30),
      }));

      // If profile already complete, skip onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.display_name && profile?.username) {
        router.replace("/feed");
      }
    });
  }, []);

  const field = (k: string) => (e: any) => setForm(p => ({...p,[k]:e.target.value}));

  /* ─── STEP 0: agree to rules ─── */
  const handleAgree = () => {
    if (!agreed || !user) return;
    setLoading(true);

    // Never block onboarding UX on this write. If the network request hangs, we still
    // let the user proceed and persist in the background.
    setStep(1);
    const persist = supabase
      .from("member_rules_accepted")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });

    Promise.race([persist, new Promise((r) => setTimeout(r, 2500))])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  /* ─── STEP 1: profile form → just validate, no save yet ─── */
  const handleProfile = () => {
    const u = form.username.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
    if (!form.display_name.trim()) { setError("Display name is required"); return; }
    if (!u || u.length < 3)        { setError("Username must be at least 3 characters"); return; }
    setError("");
    setForm(f => ({...f, username: u}));
    setStep(2);
  };

  /* ─── STEP 2: save everything ─── */
  const handleFinish = async () => {
    if (!user || interests.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:        form.username,
          display_name:    form.display_name.trim(),
          twitter_handle:  form.twitter_handle.trim(),
          bio:             form.bio.trim(),
          interests,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Username taken — suggest a fix
        if (res.status === 409) {
          setError(`@${form.username} is taken. Try @${form.username}_${user.id.slice(0,4)}`);
          setStep(1); // Go back to profile form
          setLoading(false);
          return;
        }
        throw new Error(json.error || "Failed to save profile");
      }

      // Verify it actually saved
      const { data: profile } = await supabase
        .from("profiles").select("id,username").eq("id", user.id).maybeSingle();

      if (!profile) throw new Error("Profile save succeeded but row not found — please try again");

      // All good — go to feed
      setStep(3);
      setLoading(false);

      // Auto-redirect after 2s
      setTimeout(() => { window.location.href = "/feed"; }, 2000);

    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inp = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400 transition-colors placeholder-zinc-600";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-1">🚌</div>
          <p className="text-yellow-400 font-black text-sm tracking-wider">CRUISE CONNECT HUB〽️</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center transition-all ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-600"
              }`}>{i < step ? "✓" : i+1}</div>
              {i < STEPS.length-1 && <div className={`w-6 h-0.5 rounded-full ${i < step ? "bg-green-500" : "bg-zinc-800"}`} />}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ═══ STEP 0: RULES ═══ */}
        {step === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-yellow-400/10 px-5 py-4 border-b border-zinc-800">
              <h1 className="text-white font-black text-lg">Community Rules 📋</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Scroll to the bottom to continue</p>
            </div>
            <div className="overflow-y-auto max-h-64 p-4 space-y-2"
              onScroll={e => {
                const t = e.currentTarget;
                if (t.scrollTop + t.clientHeight >= t.scrollHeight - 10) setScrolled(true);
              }}>
              {RULES.map(r => (
                <div key={r.n} className="flex gap-3 p-3 bg-zinc-900 rounded-xl">
                  <span className="text-xl shrink-0">{r.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-xs">{r.n}. {r.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{r.body}</p>
                  </div>
                </div>
              ))}
              <div className="text-center text-zinc-600 text-xs py-2">— End of Rules —</div>
            </div>
            <div className="p-4 border-t border-zinc-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => scrolled && setAgreed(!agreed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    agreed ? "bg-yellow-400 border-yellow-400" : scrolled ? "border-zinc-500" : "border-zinc-700 opacity-40 cursor-not-allowed"}`}>
                  {agreed && <span className="text-black text-xs font-black">✓</span>}
                </div>
                <span className={`text-xs ${scrolled ? "text-zinc-300" : "text-zinc-600"}`}>
                  I agree to the CC Hub Community Rules
                </span>
              </label>
              {!scrolled && <p className="text-yellow-400/60 text-xs text-center">↑ Scroll to read all 10 rules first</p>}
              <button onClick={handleAgree} disabled={!agreed || loading}
                className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Accept & Continue <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 1: PROFILE ═══ */}
        {step === 1 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-black text-lg">Your Profile 👤</h2>

            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">Display Name *</label>
              <input className={inp} placeholder="Your Name" value={form.display_name} onChange={field("display_name")} />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">Username *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                <input className={inp + " pl-8"} placeholder="yourhandle"
                  value={form.username}
                  onChange={e => setForm(f => ({...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,30)}))} />
              </div>
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">X / Twitter Handle <span className="text-zinc-600">(optional)</span></label>
              <input className={inp} placeholder="@yourhandle" value={form.twitter_handle} onChange={field("twitter_handle")} />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">Bio <span className="text-zinc-600">(optional)</span></label>
              <textarea className={inp + " resize-none"} rows={2} placeholder="Tell the community about yourself…"
                value={form.bio} onChange={field("bio")} />
            </div>

            <button onClick={handleProfile} disabled={!form.display_name.trim() || !form.username.trim()}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══ STEP 2: INTERESTS ═══ */}
        {step === 2 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-black text-lg">Your Vibe 🎯</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Pick at least 1 interest (max 6)</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {INTERESTS.map(({id,label}) => (
                <button key={id}
                  onClick={() => setInts(p => p.includes(id) ? p.filter(x=>x!==id) : p.length < 6 ? [...p,id] : p)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    interests.includes(id) ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "border-zinc-700 text-zinc-400"}`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={interests.length === 0 || loading}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating your profile…</>
                : <>Finish Setup <QrCode className="w-4 h-4" /></>}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-zinc-500 text-xs py-2">← Back</button>
          </div>
        )}

        {/* ═══ STEP 3: DONE ═══ */}
        {step === 3 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="text-white font-black text-xl">You're in, {form.display_name}!</h2>
              <p className="text-zinc-400 text-sm mt-1">Your CC Hub profile is ready</p>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4">
              <p className="text-zinc-400 text-xs mb-1">Your handle</p>
              <p className="text-yellow-400 font-black text-lg">@{form.username}</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => { window.location.href = "/feed"; }}
                className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                Enter the Hub 🚌
              </button>
              <p className="text-zinc-600 text-xs">Redirecting you automatically…</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
