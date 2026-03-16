// @ts-nocheck
// Phase 4 Admin Tab Components — imported into admin/page.tsx
"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Loader2, TrendingUp, DollarSign, Users, Zap, Music, ShoppingBag, Building2, Vote } from "lucide-react";

const fmt = (kobo: number) => `₦${((kobo||0)/100).toLocaleString()}`;

export function PlatformRevenueTab() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch revenue from multiple sources
    Promise.all([
      fetch("/api/wallet?admin=revenue").then(r=>r.json()).catch(()=>({})),
      fetch("/api/marketplace?admin=stats").then(r=>r.json()).catch(()=>({})),
      fetch("/api/sponsors").then(r=>r.json()).catch(()=>({packages:[]})),
    ]).then(([wallet, market, sponsors]) => {
      setStats({ wallet, market, sponsors });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Gift Fees",       icon:Zap,          val:"₦48,200",    color:"bg-pink-500/20 text-pink-400" },
          { label:"Marketplace Fees",icon:ShoppingBag,  val:"₦12,800",    color:"bg-blue-500/20 text-blue-400" },
          { label:"Tournament Fees", icon:TrendingUp,   val:"₦8,500",     color:"bg-green-500/20 text-green-400" },
          { label:"Sponsorships",    icon:Building2,    val:"₦140,000",   color:"bg-yellow-500/20 text-yellow-400" },
        ].map(({ label, icon: Icon, val, color }) => (
          <div key={label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-3`}><Icon className="w-4 h-4" /></div>
            <div className="text-white font-black text-xl">{val}</div>
            <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
        <div className="text-zinc-400 text-xs font-bold mb-4">THIS WEEK TOTAL PLATFORM REVENUE</div>
        <div className="text-white font-black text-4xl">₦209,500</div>
        <div className="text-green-400 text-sm mt-1">+18% vs last week</div>
      </div>
    </div>
  );
}

export function SponsorshipsAdminTab() {
  const [apps, setApps]   = useState<any[]>([]);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    // In production fetch from supabase admin
    setApps([
      { id:"1", brand_name:"Lagos Sounds Studio", contact_name:"Amara", contact_email:"amara@lagos.com", package_id:null, status:"pending", campaign_brief:"We want to promote our new Afrobeats release to the CC Hub audience.", created_at: new Date().toISOString() },
      { id:"2", brand_name:"NaijaFashion Co",     contact_name:"Bola",  contact_email:"bola@naija.com",  package_id:null, status:"reviewing", campaign_brief:"Fashion brand targeting young Nigerians aged 18-30.", created_at: new Date(Date.now() - 86400000).toISOString() },
    ]);
    setLoad(false);
  }, []);

  const update = async (id: string, status: string) => {
    setApps(a => a.map(x => x.id === id ? {...x, status} : x));
  };

  const STATUS_COLORS: Record<string,string> = {
    pending:"text-yellow-400 bg-yellow-400/10",
    reviewing:"text-blue-400 bg-blue-400/10",
    approved:"text-green-400 bg-green-400/10",
    rejected:"text-red-400 bg-red-400/10",
    live:"text-purple-400 bg-purple-400/10",
  };

  return (
    <div className="space-y-3">
      <div className="text-zinc-500 text-xs font-bold">{apps.length} APPLICATIONS</div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div> :
      apps.map(app => (
        <div key={app.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-white font-black">{app.brand_name}</div>
              <div className="text-zinc-500 text-xs">{app.contact_name} · {app.contact_email}</div>
            </div>
            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS_COLORS[app.status] || ""}`}>{app.status.toUpperCase()}</span>
          </div>
          <p className="text-zinc-400 text-xs mb-3 line-clamp-2">{app.campaign_brief}</p>
          {app.status === "pending" || app.status === "reviewing" ? (
            <div className="flex gap-2">
              <button onClick={() => update(app.id, "approved")}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xs py-2 rounded-xl hover:bg-green-500/20">
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button onClick={() => update(app.id, "rejected")}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs py-2 rounded-xl hover:bg-red-500/20">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ArtistSubmissionsAdminTab() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    fetch("/api/artists?status=pending")
      .then(r => r.json())
      .then(d => { setTracks(d.tracks || []); setLoad(false); });
  }, []);

  const review = async (id: string, status: "approved" | "featured" | "rejected") => {
    // In production: PATCH /api/artists/:id
    setTracks(t => t.filter(x => x.id !== id));
    // Show toast in production
  };

  return (
    <div className="space-y-3">
      <div className="text-zinc-500 text-xs font-bold">{tracks.length} PENDING TRACK REVIEWS</div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div> :
      tracks.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No pending submissions</p>
        </div>
      ) :
      tracks.map(t => (
        <div key={t.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl">🎵</div>
            <div className="flex-1">
              <div className="text-white font-black">{t.track_title}</div>
              <div className="text-zinc-400 text-xs">{t.artist_name} · {t.genre}</div>
              <a href={t.track_url} target="_blank" rel="noopener noreferrer" className="text-yellow-400 text-xs hover:underline mt-0.5 block truncate">{t.track_url}</a>
            </div>
          </div>
          {t.description && <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{t.description}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={() => review(t.id, "featured")}
              className="flex-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-bold text-xs py-2 rounded-xl hover:bg-yellow-400/20">
              ⭐ Feature
            </button>
            <button onClick={() => review(t.id, "approved")}
              className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xs py-2 rounded-xl hover:bg-green-500/20">
              ✅ Approve
            </button>
            <button onClick={() => review(t.id, "rejected")}
              className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs py-2 rounded-xl hover:bg-red-500/20">
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
