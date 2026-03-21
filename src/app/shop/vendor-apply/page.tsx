"use client";
import { useState } from "react";
import { Store, ArrowLeft, CheckCircle, Upload, Star, Users, Zap } from "lucide-react";

import Link from "next/link";

const CATEGORIES = ["Fashion","Food & Beverages","Tech & Gadgets","Beauty & Cosmetics","Printing & Merch","Events & Entertainment","Health & Wellness","Education","Services","Other"];

export default function VendorApplyPage() {
  const [form, setForm] = useState({
    business_name:"", category:"Fashion", description:"", twitter_handle:"",
    instagram:"", phone:"", website:"", products_services:"",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const f = (k: string) => (e: any) => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async () => {
    if (!form.business_name.trim() || !form.description.trim()) { setErr("Business name and description are required"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/shop", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action:"vendor_apply", ...form }),
      });
      setDone(true);
    } catch { setErr("Something went wrong. DM @TheCruiseCH on X instead."); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-yellow-400"/>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Application Submitted! 🎉</h2>
        <p className="text-zinc-400 mb-2">We'll review your application within 24–48 hours.</p>
        <p className="text-zinc-400 mb-8">Watch for a DM from <span className="text-yellow-400">@TheCruiseCH</span> on X.</p>
        <Link href="/shop" className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
          Back to Shop
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/shop" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4"/> Back to Shop
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-yellow-400"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">List Your Business</h1>
            <p className="text-zinc-400 text-sm">Join 15,000+ community members and grow your brand</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[{icon:<Users className="w-5 h-5"/>,label:"15K+ Reach"},{icon:<Star className="w-5 h-5"/>,label:"Verified Badge"},{icon:<Zap className="w-5 h-5"/>,label:"Instant Exposure"}].map(b=>(
            <div key={b.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-yellow-400 flex justify-center mb-1">{b.icon}</div>
              <div className="text-xs font-bold text-zinc-300">{b.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Business Name *</label>
              <input type="text" placeholder="e.g. Lagos Drip Store" value={form.business_name} onChange={f("business_name")}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Category</label>
              <select value={form.category} onChange={f("category")}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500">
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Phone Number</label>
              <input type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={f("phone")}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">What do you sell / offer? *</label>
            <textarea rows={3} placeholder="Describe your products or services clearly. Be specific — e.g. 'Custom T-shirt printing, banners, hoodies. Bulk orders available.'"
              value={form.description} onChange={f("description")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none"/>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {key:"twitter_handle",label:"X / Twitter Handle",placeholder:"@yourbusiness"},
              {key:"instagram",label:"Instagram",placeholder:"@yourbusiness"},
              {key:"website",label:"Website (optional)",placeholder:"https://yourbrand.com"},
            ].map(fi=>(
              <div key={fi.key} className={fi.key==="website"?"sm:col-span-2":""}>
                <label className="block text-xs text-zinc-400 mb-2 font-medium">{fi.label}</label>
                <input type="text" placeholder={fi.placeholder} value={(form as any)[fi.key]} onChange={f(fi.key)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm">
            <div className="font-bold text-white mb-2">Listing Tiers</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-zinc-400">Basic Listing</span><span className="text-green-400 font-bold">FREE</span></div>
              <div className="flex items-center justify-between"><span className="text-zinc-400">Featured + Verified Badge</span><span className="text-yellow-400 font-bold">₦20,000/week</span></div>
              <div className="flex items-center justify-between"><span className="text-zinc-400">Pinned Top Placement</span><span className="text-yellow-400 font-bold">₦50,000/month</span></div>
            </div>
          </div>

          {err && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{err}</p>}

          <button onClick={submit} disabled={loading}
            className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base">
            {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Submitting...</> : "Submit Application 🚀"}
          </button>
          <p className="text-xs text-zinc-500 text-center">We'll review and DM you on X within 48 hours.</p>
        </div>
      </main>
    </div>
  );
}
