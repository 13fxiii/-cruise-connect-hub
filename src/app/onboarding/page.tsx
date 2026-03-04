"use client";
import { useState } from "react";
import { Zap, User, Music, Gamepad2, Film, Briefcase, ChevronRight, Mic } from "lucide-react";
import Link from "next/link";

const INTERESTS = [
  {id:"music",label:"Music 🎵",icon:"🎵"},{id:"gaming",label:"Gaming 🎮",icon:"🎮"},
  {id:"movies",label:"Movies 🎬",icon:"🎬"},{id:"business",label:"Business 💼",icon:"💼"},
  {id:"afrobeats",label:"Afrobeats 🔥",icon:"🔥"},{id:"tech",label:"Tech 💻",icon:"💻"},
  {id:"fashion",label:"Fashion 👗",icon:"👗"},{id:"sports",label:"Sports ⚽",icon:"⚽"},
  {id:"comedy",label:"Comedy 😂",icon:"😂"},{id:"art",label:"Art & Design 🎨",icon:"🎨"},
];

const STEPS = ["Welcome","Profile","Interests","Done"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    display_name:"", username:"", twitter_handle:"", bio:"",
    interests:[] as string[],
  });
  const [loading, setLoading] = useState(false);

  const f = (k: string) => (e: any) => setForm(p=>({...p,[k]:e.target.value}));
  const toggleInterest = (id: string) => setForm(p=>({...p,interests:p.interests.includes(id)?p.interests.filter(x=>x!==id):[...p.interests,id]}));

  const next = async () => {
    if (step === 2) {
      setLoading(true);
      try {
        await fetch("/api/onboarding", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      } catch {}
      setLoading(false);
    }
    setStep(p => Math.min(p+1, 3));
  };

  const canNext = () => {
    if (step === 1) return form.display_name.trim().length > 1 && form.username.trim().length > 2;
    return true;
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-black"/></div>
        <span className="font-black text-xl"><span className="text-white">C&C </span><span className="text-yellow-400">Hub〽️</span></span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          {STEPS.map((s,i)=>(
            <span key={s} className={i<=step?"text-yellow-400 font-bold":""}>{s}</span>
          ))}
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
        </div>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        {/* STEP 0 — Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🚌</div>
            <h2 className="text-2xl font-black text-white mb-2">Welcome Aboard!</h2>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              You've joined Cruise & Connect Hub — the dopest community on the internet. 
              Let's set up your profile so the community can find you. Takes 2 mins.
            </p>
            <div className="space-y-2 text-left mb-6">
              {["🎮 Play games & win Naira prizes","🎵 Discover underground artists first","🎬 Weekly movie watch parties","💼 Find jobs & grow your network"].map(b=>(
                <div key={b} className="flex items-center gap-2 text-sm text-zinc-300"><span>{b}</span></div>
              ))}
            </div>
            <button onClick={next} className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
              Let's Go <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        )}

        {/* STEP 1 — Profile */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-black text-white mb-1">Your Profile</h2>
            <p className="text-zinc-400 text-sm mb-5">How should the community know you?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Display Name *</label>
                <input type="text" placeholder="e.g. FX〽️" value={form.display_name} onChange={f("display_name")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Username *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                  <input type="text" placeholder="yourusername" value={form.username} onChange={f("username")}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">X / Twitter Handle</label>
                <div className="relative">
                  <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                  <input type="text" placeholder="@yourxhandle" value={form.twitter_handle} onChange={f("twitter_handle")}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Bio (optional)</label>
                <textarea rows={2} placeholder="Tell the community who you are in 1–2 lines"
                  value={form.bio} onChange={f("bio")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none"/>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Interests */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-black text-white mb-1">Your Interests</h2>
            <p className="text-zinc-400 text-sm mb-5">Pick what you're into — we'll personalise your feed.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {INTERESTS.map(i=>(
                <button key={i.id} onClick={()=>toggleInterest(i.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${form.interests.includes(i.id)?"bg-yellow-400 text-black border-yellow-400":"bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-400/40"}`}>
                  {i.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500">{form.interests.length}/10 selected</p>
          </div>
        )}

        {/* STEP 3 — Done */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-yellow-400"/>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">You're all set! 🎉</h2>
            <p className="text-zinc-400 text-sm mb-2">Welcome to the C&C Hub family, <span className="text-yellow-400 font-bold">{form.display_name || "fam"}</span>.</p>
            <p className="text-zinc-500 text-xs mb-6">We dey cruise, we dey connect & grow 🚌</p>
            <div className="space-y-2">
              <Link href="/feed" className="block w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 transition-colors">
                Go to Feed 🚀
              </Link>
              <Link href="/games" className="block w-full bg-zinc-800 text-white font-bold py-3 rounded-full hover:bg-zinc-700 transition-colors">
                Play Games 🎮
              </Link>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        {step < 3 && (
          <div className="flex items-center gap-3 mt-6">
            {step > 0 && (
              <button onClick={()=>setStep(p=>p-1)} className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-full hover:bg-zinc-700 transition-colors">
                Back
              </button>
            )}
            <button onClick={next} disabled={!canNext() || loading}
              className="flex-1 bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : null}
              {step === 2 ? "Finish Setup ✓" : "Continue"} <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        )}
      </div>

      <p className="text-zinc-600 text-xs mt-6">
        Already set up? <Link href="/feed" className="text-yellow-400 hover:underline">Go to feed →</Link>
      </p>
    </div>
  );
}

function XIcon({className}:{className?:string}) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.85L2.142 2.25h6.9l4.276 5.653 5.926-5.653zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function CheckIcon({className}:{className?:string}) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
}
