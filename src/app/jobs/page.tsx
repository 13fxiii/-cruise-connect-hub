"use client";
import { useState, useEffect, useCallback } from "react";
import { Briefcase, MapPin, Clock, DollarSign, Plus, Search, ExternalLink, Building, ChevronDown, ChevronUp, Send, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

type Job = {
  id: string; title: string; company: string; type: string; category: string;
  location: string; pay?: string; description: string; requirements: string[];
  contact_handle?: string; is_urgent: boolean; application_count: number; created_at: string;
};

const CATEGORIES = ["All","Marketing","Design","Tech","Content","Music Industry","Finance","Customer Service"];
const TYPES = ["All Types","Full-time","Part-time","Freelance","Contract","Internship"];
const timeAgo = (iso: string) => { const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000); return d===0?"today":d===1?"1d ago":`${d}d ago`; };

export default function JobsPage() {
  const [tab, setTab] = useState<"browse"|"post">("browse");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [type, setType] = useState("All Types");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string|null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string|null>(null);
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [form, setForm] = useState({ title:"",company:"",type:"Full-time",category:"Marketing",location:"",pay:"",description:"",requirements:"",contact_handle:"" });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (cat!=="All") p.set("category",cat);
      if (type!=="All Types") p.set("type",type);
      if (search) p.set("search",search);
      const r = await fetch(`/api/jobs?${p}`);
      const d = await r.json();
      setJobs(d.jobs||[]);
    } catch { setJobs([]); }
    setLoading(false);
  }, [cat,type,search]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const applyNow = async (id: string) => {
    setApplying(id);
    await new Promise(r=>setTimeout(r,700));
    setApplied(prev=>{const n=new Set(prev);n.add(id);return n;});
    setApplying(null);
  };

  const submitJob = async () => {
    if (!form.title||!form.company||!form.description) return;
    setPosting(true);
    try {
      await fetch("/api/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      setPostSuccess(true);
      setForm({title:"",company:"",type:"Full-time",category:"Marketing",location:"",pay:"",description:"",requirements:"",contact_handle:""});
    } catch {}
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><Briefcase className="text-yellow-400 w-8 h-8"/>Jobs Board</h1>
          <p className="text-zinc-400 mt-1">Find opportunities · Post roles · Build your career in the community</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{l:"Active Listings",v:jobs.length,i:"💼"},{l:"Remote Roles",v:jobs.filter(j=>j.location.toLowerCase().includes("remote")).length,i:"🌍"},{l:"Urgent Hires",v:jobs.filter(j=>j.is_urgent).length,i:"⚡"}].map(s=>(
            <div key={s.l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.i}</div>
              <div className="text-xl font-black text-white">{loading?"—":s.v}</div>
              <div className="text-xs text-zinc-400">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["browse","post"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab===t?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>
              {t==="browse"?"💼 Browse Jobs":"➕ Post a Job"}
            </button>
          ))}
        </div>

        {tab==="browse" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
              </div>
              <select value={type} onChange={e=>setType(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500">
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setCat(c)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat===c?"bg-yellow-400 text-black":"bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>{c}</button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin"/></div>
            ) : jobs.length===0 ? (
              <div className="text-center py-12 text-zinc-500">No jobs match your filter.</div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job=>(
                  <div key={job.id} className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${job.is_urgent?"border-yellow-500/40":"border-zinc-800"} hover:border-yellow-400/30`}>
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-black text-white">{job.title}</h3>
                            {job.is_urgent&&<span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-400/30">⚡ URGENT</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1"><Building className="w-3 h-3"/>{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{job.location}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{job.type}</span>
                            {job.pay&&<span className="text-green-400 font-bold">{job.pay}</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">{job.category}</span>
                          <div className="text-xs text-zinc-600 mt-1">{timeAgo(job.created_at)}</div>
                        </div>
                      </div>

                      {expanded===job.id&&(
                        <div className="mt-4 border-t border-zinc-800 pt-4">
                          <p className="text-sm text-zinc-300 leading-relaxed mb-3">{job.description}</p>
                          {job.requirements?.length>0&&(
                            <div className="mb-3">
                              <div className="text-xs font-bold text-zinc-400 mb-2">REQUIREMENTS</div>
                              <ul className="space-y-1">{job.requirements.map((r,i)=><li key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-yellow-400">•</span>{r}</li>)}</ul>
                            </div>
                          )}
                          {job.contact_handle&&<div className="text-xs text-zinc-400">Contact: <span className="text-yellow-400">{job.contact_handle}</span></div>}
                          {(job.application_count||0)>0&&<div className="text-xs text-zinc-500 mt-1">{job.application_count} applications</div>}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <button onClick={()=>setExpanded(expanded===job.id?null:job.id)} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                          {expanded===job.id?<><ChevronUp className="w-3 h-3"/>Less</>:<><ChevronDown className="w-3 h-3"/>More info</>}
                        </button>
                        <div className="flex-1"/>
                        {job.contact_handle&&<a href={`https://twitter.com/${job.contact_handle.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-zinc-800 text-zinc-300 font-bold px-3 py-2 rounded-full hover:bg-zinc-700 flex items-center gap-1">DM<ExternalLink className="w-3 h-3"/></a>}
                        <button onClick={()=>applyNow(job.id)} disabled={applying===job.id||applied.has(job.id)} className={`text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors ${applied.has(job.id)?"bg-green-500/20 text-green-400 border border-green-500/30":applying===job.id?"bg-zinc-700 text-zinc-400":"bg-yellow-400 text-black hover:bg-yellow-300"}`}>
                          {applying===job.id?<Loader2 className="w-3 h-3 animate-spin"/>:applied.has(job.id)?<><CheckCircle className="w-3 h-3"/>Applied!</>:"Apply Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab==="post"&&(
          <div className="max-w-2xl">
            {postSuccess?(
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3"/>
                <h3 className="text-xl font-black text-white mb-2">Job Posted! 🎉</h3>
                <p className="text-zinc-400 text-sm mb-4">Your listing is now live.</p>
                <button onClick={()=>{setPostSuccess(false);setTab("browse");fetchJobs();}} className="bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300">View All Jobs</button>
              </div>
            ):(
              <div className="space-y-4">
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 text-sm text-yellow-300">💼 Post a job to reach 15,000+ community members. Free to post.</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{k:"title",l:"Job Title *",p:"e.g. Social Media Manager",full:true},{k:"company",l:"Company *",p:"e.g. My Brand Lagos"},{k:"location",l:"Location",p:"e.g. Remote / Lagos"},{k:"pay",l:"Salary / Pay",p:"e.g. ₦100,000/month"},{k:"contact_handle",l:"Your X Handle",p:"@yourhandle",full:true}].map(f=>(
                    <div key={f.k} className={f.full?"sm:col-span-2":""}>
                      <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{f.l}</label>
                      <input type="text" placeholder={f.p} value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-zinc-400 mb-1.5">Job Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500">{["Full-time","Part-time","Freelance","Contract","Internship"].map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label className="block text-xs text-zinc-400 mb-1.5">Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500">{CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <div><label className="block text-xs text-zinc-400 mb-1.5">Description *</label><textarea rows={4} placeholder="Describe the role..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600 resize-none"/></div>
                <div><label className="block text-xs text-zinc-400 mb-1.5">Requirements (one per line)</label><textarea rows={3} placeholder={"2+ years experience\nPortfolio required"} value={form.requirements} onChange={e=>setForm(p=>({...p,requirements:e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600 resize-none"/></div>
                <button onClick={submitJob} disabled={posting||!form.title||!form.company||!form.description} className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 disabled:opacity-50 flex items-center justify-center gap-2">
                  {posting?<><Loader2 className="w-4 h-4 animate-spin"/>Posting...</>:<><Send className="w-4 h-4"/>Post Job — FREE</>}
                </button>
                <p className="text-xs text-zinc-500 text-center">Featured listing: <span className="text-yellow-400">@TheCruiseCH</span> — ₦10,000/week</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
