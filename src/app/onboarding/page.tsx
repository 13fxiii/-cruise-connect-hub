// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, Download, Share2, QrCode } from "lucide-react";

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

const STEPS = ["Rules","Profile","Interests","Your ID"];

function generateCardNumber(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return "CCH-" + Math.abs(hash % 90000 + 10000).toString().padStart(5,"0");
}

function getLevel(pts: number) {
  if (pts >= 5000) return {name:"Community Legend",badge:"🏆"};
  if (pts >= 2500) return {name:"Culture King",badge:"👑"};
  if (pts >= 1000) return {name:"Hub Star",badge:"⭐"};
  if (pts >= 500)  return {name:"Connector",badge:"🔗"};
  if (pts >= 100)  return {name:"Cruiser",badge:"🚌"};
  return {name:"Newcomer",badge:"🌱"};
}

export default function OnboardingPage() {
  const [step, setStep]         = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [form, setForm]         = useState({ display_name:"", username:"", twitter_handle:"", bio:"" });
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [cardNum, setCardNum]   = useState("");
  const router                  = useRouter();
  const supabase                = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUser(data.user);
      setCardNum(generateCardNumber(data.user.id));
      const meta = data.user.user_metadata || {};
      setForm(f => ({
        ...f,
        display_name: meta.full_name || meta.name || "",
        username: meta.username || meta.preferred_username || "",
      }));
    });
  }, []);

  const f = (k: string) => (e: any) => setForm(p => ({...p,[k]:e.target.value}));
  const level = getLevel(0);
  const joinDate = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const handleAgree = async () => {
    if (!agreed || !user) return;
    setLoading(true);
    await supabase.from("member_rules_accepted").upsert({ user_id: user.id }, { onConflict: "user_id" });
    setLoading(false);
    setStep(1);
  };

  const handleProfile = () => {
    if (!form.username.trim() || !form.display_name.trim()) return;
    setStep(2);
  };

  const handleInterests = async () => {
    if (!user || interests.length === 0) return;
    setLoading(true);
    await supabase.from("profiles").upsert({
      id: user.id,
      username: form.username.toLowerCase().replace(/[^a-z0-9_]/g,""),
      display_name: form.display_name,
      twitter_handle: form.twitter_handle,
      bio: form.bio,
      interests,
    }, { onConflict: "id" });
    await supabase.from("community_id_cards").upsert({
      user_id: user.id,
      card_number: cardNum,
      qr_data: JSON.stringify({ id: cardNum, username: form.username, issued: new Date().toISOString().split("T")[0] }),
    }, { onConflict: "user_id" });
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-yellow-400/40">
              <Image src="/logo.jpeg" alt="CC Hub" fill sizes="48px" className="object-cover" />
            </div>
            <div className="text-yellow-400 font-black text-sm">Cruise Connect Hub〽️</div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-600"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-green-500" : "bg-zinc-800"}`} />}
            </div>
          ))}
        </div>

        {/* STEP 0: COMMUNITY RULES */}
        {step === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/10 px-6 py-4 border-b border-zinc-800">
              <h1 className="text-white font-black text-xl">Community Rules 📋</h1>
              <p className="text-zinc-400 text-xs mt-1">Read before joining the cruise — scroll to the bottom</p>
            </div>
            <div
              className="overflow-y-auto max-h-72 p-4 space-y-3"
              onScroll={(e) => {
                const t = e.currentTarget;
                if (t.scrollTop + t.clientHeight >= t.scrollHeight - 20) setScrolled(true);
              }}
            >
              {RULES.map(r => (
                <div key={r.n} className="flex gap-3 p-3 bg-zinc-900 rounded-xl">
                  <div className="text-2xl flex-shrink-0 leading-none">{r.emoji}</div>
                  <div>
                    <div className="text-white font-bold text-sm">{r.n}. {r.title}</div>
                    <div className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{r.body}</div>
                  </div>
                </div>
              ))}
              <div className="h-4 text-center text-zinc-600 text-xs">— End of Rules —</div>
            </div>
            <div className="p-4 border-t border-zinc-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => scrolled && setAgreed(!agreed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    agreed ? "bg-yellow-400 border-yellow-400" : scrolled ? "border-zinc-500 cursor-pointer" : "border-zinc-700 opacity-40 cursor-not-allowed"
                  }`}
                >
                  {agreed && <span className="text-black text-xs font-black">✓</span>}
                </div>
                <span className={`text-xs ${scrolled ? "text-zinc-300" : "text-zinc-600"}`}>
                  I have read and agree to the CC Hub Community Rules
                </span>
              </label>
              {!scrolled && <p className="text-yellow-400/60 text-xs text-center">↑ Scroll up to read all 10 rules first</p>}
              <button
                onClick={handleAgree}
                disabled={!agreed || loading}
                className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Saving..." : <>Accept & Join the Cruise <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: PROFILE */}
        {step === 1 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-black text-xl">Set Up Your Profile 👤</h2>
            {[
              {k:"display_name",label:"Display Name *",ph:"Your Name",type:"input"},
              {k:"username",label:"Username *",ph:"yourhandle"},
              {k:"twitter_handle",label:"X / Twitter Handle",ph:"@yourhandle"},
              {k:"bio",label:"Bio",ph:"Tell the community about yourself...",type:"textarea"},
            ].map(({k,label,ph,type}) => (
              <div key={k}>
                <label className="text-zinc-400 text-xs font-bold block mb-1.5">{label}</label>
                {type === "textarea" ? (
                  <textarea value={(form as any)[k]} onChange={f(k)} placeholder={ph} rows={3}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400 resize-none" />
                ) : (
                  <input value={(form as any)[k]} onChange={f(k)} placeholder={ph}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400" />
                )}
              </div>
            ))}
            <button onClick={handleProfile} disabled={!form.display_name.trim() || !form.username.trim()}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: INTERESTS */}
        {step === 2 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-black text-xl">Your Vibe 🎯</h2>
            <p className="text-zinc-500 text-xs">Pick your interests — select up to 6</p>
            <div className="grid grid-cols-3 gap-2">
              {INTERESTS.map(({ id, label }) => (
                <button key={id}
                  onClick={() => setInterests(p => p.includes(id) ? p.filter(x=>x!==id) : p.length < 6 ? [...p,id] : p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    interests.includes(id) ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={handleInterests} disabled={interests.length === 0 || loading}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? "Creating your ID..." : <>Get My Community ID <QrCode className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* STEP 3: COMMUNITY ID */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-white font-black text-xl">You're In, {form.display_name}!</h2>
              <p className="text-zinc-400 text-xs mt-1">Your official CC Hub Community ID</p>
            </div>

            {/* ID CARD FRONT */}
            <div className="relative bg-gradient-to-br from-zinc-900 via-[#111] to-zinc-800 border-2 border-yellow-400/50 rounded-3xl p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <span className="text-black font-black text-[10px]">C&C</span>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-black text-xs">Cruise & Connect Hub</div>
                    <div className="text-zinc-500 text-[9px] tracking-widest">OFFICIAL MEMBER</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500 text-[9px]">MEMBER ID</div>
                  <div className="text-yellow-400 font-black text-xs tracking-widest">{cardNum}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-black text-black">{(form.display_name||"?").charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-white font-black text-lg leading-tight">{form.display_name}</div>
                  <div className="text-yellow-400 text-xs font-bold">@{form.username}</div>
                  <div className="text-zinc-500 text-[10px] mt-0.5">Since {joinDate}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-yellow-400/10 rounded-xl p-2.5">
                  <div className="text-zinc-500 text-[9px] mb-0.5">LEVEL</div>
                  <div className="text-yellow-400 font-black text-sm">{level.badge} {level.name}</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-2.5">
                  <div className="text-zinc-500 text-[9px] mb-0.5">POINTS</div>
                  <div className="text-white font-black text-sm">⭐ 0 pts</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-white rounded-xl p-2">
                  <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-zinc-700 text-[7px] text-center mt-1">Scan to verify</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-600 text-[9px]">cruise-connect-hub.vercel.app</div>
                  <div className="text-zinc-600 text-[9px]">@TheCruiseCH on X</div>
                  <div className="text-zinc-600 text-[9px]">Issued {new Date().toLocaleDateString("en-GB")}</div>
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 opacity-60" />
            </div>

            {/* Social Banner */}
            <div className="relative bg-gradient-to-r from-[#111] via-zinc-900 to-[#111] border border-yellow-400/30 rounded-2xl overflow-hidden" style={{height:88}}>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />
              <div className="absolute inset-0 flex items-center px-5 gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-black">{(form.display_name||"?").charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-black">{form.display_name}</div>
                  <div className="text-yellow-400 text-xs">CC Hub Member · {cardNum}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-[10px]">@TheCruiseCH</div>
                  <div className="text-zinc-600 text-[9px]">cruise-connect-hub.vercel.app</div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 opacity-50" />
            </div>
            <p className="text-zinc-600 text-xs text-center">☝️ Use this as your X/Instagram banner</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const text = `I just joined Cruise Connect Hub〽️!\n\n🆔 ${cardNum}\n👤 ${form.display_name} (@${form.username})\n🌱 Newcomer\n\nJoin the wave 👉 @TheCruiseCH\n#CruiseAndConnect #CCHub`;
                  if (navigator.share) navigator.share({ text });
                  else { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
                }}
                className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-sm py-3 rounded-xl hover:bg-zinc-800"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button onClick={() => router.push("/feed")}
                className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm py-3 rounded-xl hover:bg-yellow-300">
                Enter Hub 🚌 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
