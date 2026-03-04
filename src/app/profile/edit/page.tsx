"use client";
import { useState } from "react";
import { User, Camera, Save, ArrowLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function ProfileEditPage() {
  const [form, setForm] = useState({
    display_name:"FX〽️", username:"13fxiii", twitter_handle:"@13fxiii",
    bio:"Lagos creative hustler. Social media marketer, A&R in the making. @CCHub_ founder.",
    avatar_url:"",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const f = (k:string) => (e:any) => setForm(p=>({...p,[k]:e.target.value}));

  const save = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
      });
      setSaved(true); setTimeout(()=>setSaved(false),3000);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar/>
      <main className="max-w-xl mx-auto px-4 py-8">
        <Link href="/profile" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4"/> My Profile
        </Link>
        <h1 className="text-2xl font-black text-white mb-6">Edit Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-black text-black">
              {form.display_name?.[0]||"U"}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center hover:border-yellow-400/40">
              <Camera className="w-3.5 h-3.5 text-zinc-300"/>
            </button>
          </div>
          <div>
            <p className="text-white font-bold">{form.display_name}</p>
            <p className="text-zinc-400 text-sm">@{form.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {key:"display_name",label:"Display Name",placeholder:"How you show up in the community"},
            {key:"username",label:"Username",placeholder:"yourusername",prefix:"@"},
            {key:"twitter_handle",label:"X / Twitter Handle",placeholder:"@yourxhandle"},
          ].map(fi=>(
            <div key={fi.key}>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">{fi.label}</label>
              <div className="relative">
                {fi.prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{fi.prefix}</span>}
                <input type="text" placeholder={fi.placeholder}
                  value={(form as any)[fi.key]} onChange={f(fi.key)}
                  className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl ${fi.prefix?"pl-8":"pl-4"} pr-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600`}/>
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">Bio</label>
            <textarea rows={3} placeholder="Tell the community who you are"
              value={form.bio} onChange={f("bio")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none"/>
          </div>

          <button onClick={save} disabled={loading}
            className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saved ? <><CheckCircle className="w-5 h-5"/>Saved!</> : loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <><Save className="w-5 h-5"/>Save Changes</>}
          </button>
        </div>
      </main>
    </div>
  );
}
