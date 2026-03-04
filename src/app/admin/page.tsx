"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, FileText, Megaphone, Briefcase, Music, ShoppingBag, BarChart2, CheckCircle, XCircle, Eye, Loader2, RefreshCw, TrendingUp, DollarSign, Zap, Bell } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

type AdSubmission = { id: string; brand_name: string; package: string; status: string; amount_ngn: number; contact_email: string; created_at: string; };
type Job = { id: string; title: string; company: string; status: string; category: string; created_at: string; };

const PACKAGE_LABELS: Record<string,string> = { day:"1 Day AD", day_dual:"1 Day Dual AD", weekly:"Weekly ADS", monthly:"Monthly ADS", ambassador_3m:"3 Month Deal", ambassador_6m:"6 Month Deal" };

const STATS = [
  { label:"Total Members", value:"15,247", icon:<Users className="w-5 h-5"/>, color:"text-blue-400", change:"+234 this week" },
  { label:"Active Posts", value:"1,893", icon:<FileText className="w-5 h-5"/>, color:"text-green-400", change:"+47 today" },
  { label:"Pending Ads", value:"3", icon:<Megaphone className="w-5 h-5"/>, color:"text-yellow-400", change:"Needs review" },
  { label:"Monthly Revenue", value:"₦2.1M", icon:<DollarSign className="w-5 h-5"/>, color:"text-yellow-400", change:"+₦350k from ads" },
  { label:"Games Played", value:"4,521", icon:<Zap className="w-5 h-5"/>, color:"text-purple-400", change:"+189 today" },
  { label:"Active Jobs", value:"12", icon:<Briefcase className="w-5 h-5"/>, color:"text-orange-400", change:"6 urgent" },
];

const SIDEBAR_TABS = [
  { id:"overview", label:"Overview", icon:<LayoutDashboard className="w-4 h-4"/> },
  { id:"ads", label:"Ad Submissions", icon:<Megaphone className="w-4 h-4"/> },
  { id:"posts", label:"Posts", icon:<FileText className="w-4 h-4"/> },
  { id:"jobs", label:"Jobs", icon:<Briefcase className="w-4 h-4"/> },
  { id:"music", label:"Track Reviews", icon:<Music className="w-4 h-4"/> },
  { id:"members", label:"Members", icon:<Users className="w-4 h-4"/> },
];

export default function AdminPage() {
  const [tab, setTab] = useState("overview");
  const [ads, setAds] = useState<AdSubmission[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string|null>(null);

  useEffect(() => {
    if (tab==="ads") fetchAds();
    if (tab==="jobs") fetchJobs();
  }, [tab]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/ads?admin=1");
      const d = await r.json();
      setAds(d.submissions||[]);
    } catch { setAds(MOCK_ADS); }
    setLoading(false);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/jobs");
      const d = await r.json();
      setJobs(d.jobs||[]);
    } catch { setJobs([]); }
    setLoading(false);
  };

  const approveAd = async (id: string) => {
    setActionLoading(id);
    try { await fetch(`/api/ads/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"approved"})}); } catch {}
    setAds(prev=>prev.map(a=>a.id===id?{...a,status:"approved"}:a));
    setActionLoading(null);
  };

  const rejectAd = async (id: string) => {
    setActionLoading(id);
    try { await fetch(`/api/ads/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"rejected"})}); } catch {}
    setAds(prev=>prev.map(a=>a.id===id?{...a,status:"rejected"}:a));
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><LayoutDashboard className="text-yellow-400 w-6 h-6"/>Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-0.5">C&C Hub Management Console</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <span className="text-xs text-green-400 font-medium">All systems live</span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 hidden md:block">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 space-y-1 sticky top-24">
              {SIDEBAR_TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${tab===t.id?"bg-yellow-400/10 text-yellow-400":"text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile tab row */}
          <div className="md:hidden overflow-x-auto flex gap-2 pb-2 w-full mb-4">
            {SIDEBAR_TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${tab===t.id?"bg-yellow-400 text-black":"bg-zinc-800 text-zinc-300"}`}>{t.label}</button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* OVERVIEW */}
            {tab==="overview"&&(
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {STATS.map(s=>(
                    <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className={`${s.color} mb-2`}>{s.icon}</div>
                      <div className="text-xl font-black text-white">{s.value}</div>
                      <div className="text-xs text-zinc-400">{s.label}</div>
                      <div className="text-xs text-green-400 mt-1">{s.change}</div>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-yellow-400"/>Quick Actions</h3>
                    <div className="space-y-2">
                      {[
                        { label:"Review pending ads", count:3, tab:"ads", color:"bg-yellow-400/20 text-yellow-400 border-yellow-400/30" },
                        { label:"Review track submissions", count:7, tab:"music", color:"bg-purple-400/20 text-purple-400 border-purple-400/30" },
                        { label:"Moderate flagged posts", count:2, tab:"posts", color:"bg-red-400/20 text-red-400 border-red-400/30" },
                      ].map(a=>(
                        <button key={a.label} onClick={()=>setTab(a.tab)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium hover:opacity-80 transition-opacity ${a.color}`}>
                          <span>{a.label}</span>
                          <span className="font-black">{a.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-yellow-400"/>Revenue Breakdown</h3>
                    <div className="space-y-3">
                      {[{label:"PR/ADS Campaigns",val:"₦1,400,000",pct:67},{label:"Merch Sales",val:"₦480,000",pct:23},{label:"Tournament Entry",val:"₦210,000",pct:10}].map(r=>(
                        <div key={r.label}>
                          <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">{r.label}</span><span className="text-white font-bold">{r.val}</span></div>
                          <div className="h-1.5 bg-zinc-800 rounded-full"><div className="h-full bg-yellow-400 rounded-full" style={{width:`${r.pct}%`}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ADS */}
            {tab==="ads"&&(
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-white">Ad Submissions</h2>
                  <button onClick={fetchAds} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"><RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`}/>Refresh</button>
                </div>
                {loading?<div className="text-center py-12"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin mx-auto"/></div>:(
                  <div className="space-y-3">
                    {(ads.length?ads:MOCK_ADS).map(ad=>(
                      <div key={ad.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{ad.brand_name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ad.status==="pending"?"bg-yellow-400/20 text-yellow-400":ad.status==="approved"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{ad.status}</span>
                            </div>
                            <div className="text-xs text-zinc-400">{PACKAGE_LABELS[ad.package]||ad.package} · ₦{(ad.amount_ngn||0).toLocaleString()}</div>
                            <div className="text-xs text-zinc-500">{ad.contact_email} · {new Date(ad.created_at).toLocaleDateString()}</div>
                          </div>
                          {ad.status==="pending"&&(
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={()=>approveAd(ad.id)} disabled={actionLoading===ad.id} className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-500/30 flex items-center gap-1">
                                {actionLoading===ad.id?<Loader2 className="w-3 h-3 animate-spin"/>:<CheckCircle className="w-3 h-3"/>}Approve
                              </button>
                              <button onClick={()=>rejectAd(ad.id)} disabled={actionLoading===ad.id} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-500/30 flex items-center gap-1">
                                <XCircle className="w-3 h-3"/>Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* JOBS */}
            {tab==="jobs"&&(
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-white">Job Listings</h2>
                  <button onClick={fetchJobs} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"><RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`}/>Refresh</button>
                </div>
                {loading?<div className="text-center py-12"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin mx-auto"/></div>:(
                  <div className="space-y-3">
                    {jobs.map(job=>(
                      <div key={job.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white text-sm">{job.title}</div>
                          <div className="text-xs text-zinc-400">{job.company} · {job.category} · <span className={`font-medium ${job.status==="active"?"text-green-400":"text-zinc-500"}`}>{job.status}</span></div>
                        </div>
                        <div className="text-xs text-zinc-500">{new Date(job.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                    {jobs.length===0&&<div className="text-center py-12 text-zinc-500">No jobs yet</div>}
                  </div>
                )}
              </div>
            )}

            {/* MUSIC */}
            {tab==="music"&&(
              <div>
                <h2 className="font-black text-white mb-4">Track Submissions — A&R Review Queue</h2>
                <div className="space-y-3">
                  {MOCK_TRACKS.map(t=>(
                    <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                      <div className="text-3xl">{t.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{t.title}</div>
                        <div className="text-xs text-zinc-400">{t.artist} · {t.genre}</div>
                        <a href={t.url} target="_blank" className="text-xs text-yellow-400 hover:underline">{t.url.slice(0,40)}...</a>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-500/30 flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Approve</button>
                        <button className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEMBERS */}
            {tab==="members"&&(
              <div>
                <h2 className="font-black text-white mb-4">Community Members</h2>
                <div className="space-y-2">
                  {MOCK_MEMBERS.map(m=>(
                    <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-black text-yellow-400">{m.display_name.slice(0,2).toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{m.display_name}</div>
                        <div className="text-xs text-zinc-400">{m.username} · {m.role} · {m.points} pts</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${m.role==="admin"?"bg-red-500/20 text-red-400":m.role==="mod"?"bg-purple-500/20 text-purple-400":"bg-zinc-800 text-zinc-400"}`}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POSTS */}
            {tab==="posts"&&(
              <div>
                <h2 className="font-black text-white mb-4">Post Moderation</h2>
                <div className="space-y-3">
                  {MOCK_POSTS.map(p=>(
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-xs text-zinc-500 mb-1 block">{p.author} · {p.time}</span>
                          <p className="text-sm text-zinc-200 leading-relaxed">{p.content}</p>
                          <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                            <span>❤️ {p.likes}</span><span>💬 {p.comments}</span>
                            {p.flagged&&<span className="text-red-400 font-bold">⚠️ Flagged</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {p.flagged&&<button className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-xs font-bold">Clear</button>}
                          <button className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_ADS = [
  { id:"1", brand_name:"Lagos Fashion Week", package:"weekly", status:"pending", amount_ngn:140000, contact_email:"info@lagfashion.com", created_at:new Date().toISOString() },
  { id:"2", brand_name:"Naija Crypto Exchange", package:"monthly", status:"pending", amount_ngn:350000, contact_email:"ads@naijacrypto.com", created_at:new Date(Date.now()-86400000).toISOString() },
  { id:"3", brand_name:"AfroBeats Radio", package:"day", status:"approved", amount_ngn:20000, contact_email:"partner@afroradio.ng", created_at:new Date(Date.now()-172800000).toISOString() },
];

const MOCK_TRACKS = [
  { id:"1", title:"Wave Season", artist:"Young Cruise", genre:"Afrobeats", url:"https://audiomack.com/youngcruise/song/wave-season", emoji:"🌊" },
  { id:"2", title:"Lagos 2 LA", artist:"Naija Boy", genre:"Afropop", url:"https://open.spotify.com/track/sample", emoji:"✈️" },
  { id:"3", title:"Money Moves", artist:"CashGod", genre:"Hip-Hop", url:"https://audiomack.com/cashgod/song/money-moves", emoji:"💰" },
];

const MOCK_MEMBERS = [
  { id:"1", display_name:"FX〽️", username:"@13fxiii", role:"admin", points:11800 },
  { id:"2", display_name:"ConnectPlug", username:"@connectplug", role:"mod", points:12400 },
  { id:"3", display_name:"ThrillSeeka", username:"@ThrillSeekaEnt", role:"mod", points:6100 },
  { id:"4", display_name:"NaijaGamer", username:"@naijagamer", role:"member", points:9200 },
  { id:"5", display_name:"LagosKing", username:"@lagosking", role:"member", points:3200 },
];

const MOCK_POSTS = [
  { id:"1", author:"@connectplug", time:"2h ago", content:"The C&C Hub Trivia session last night was ELECTRIC 🔥 Who was there? We almost broke the record for most participants!", likes:47, comments:12, flagged:false },
  { id:"2", author:"@unknown_user", time:"5h ago", content:"Spam content removed by moderator.", likes:0, comments:0, flagged:true },
  { id:"3", author:"@13fxiii", time:"1d ago", content:"Big announcement coming this Friday for the C&C Hub community. Stay locked in 🚌〽️", likes:234, comments:45, flagged:false },
];
