"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

const CATEGORIES = ["music","beats","design","shoutout","service","course","collab","other"];

export default function SellPage() {
  const router = useRouter();
  const [form, setForm]   = useState({ title:"", description:"", category:"beats", price:"", tags:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const f = (k: string) => (e: any) => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price) { setError("Fill all required fields"); return; }
    setLoading(true);
    const res = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }),
    });
    const data = await res.json();
    if (res.ok) router.push("/marketplace");
    else { setError(data.error || "Failed to create listing"); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/marketplace" className="text-zinc-500 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="text-xl font-black text-white">Create Listing</h1>
        </div>
        <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
          {[
            {k:"title",label:"Title *",ph:"e.g. Custom Afrobeats Beat (Exclusive)"},
            {k:"price",label:"Price (₦) *",ph:"e.g. 5000",type:"number"},
          ].map(({k,label,ph,type}) => (
            <div key={k}>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">{label}</label>
              <input value={(form as any)[k]} onChange={f(k)} placeholder={ph} type={type||"text"}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Category *</label>
            <select value={form.category} onChange={f("category")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Description *</label>
            <textarea value={form.description} onChange={f("description")} rows={4}
              placeholder="Describe what buyers get in detail..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none" />
          </div>
          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Tags (comma separated)</label>
            <input value={form.tags} onChange={f("tags")} placeholder="e.g. afrobeats, exclusive, studio quality"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
          </div>
          <p className="text-zinc-600 text-xs">Platform takes 5% fee on each sale. You keep 95%.</p>
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 disabled:opacity-40 flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" /> {loading ? "Publishing..." : "Publish Listing"}
          </button>
        </form>
      </main>
    </div>
  );
}
