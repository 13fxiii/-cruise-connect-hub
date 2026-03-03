"use client";
import { useState } from "react";
import { Briefcase, MapPin, Clock, DollarSign, Plus, Search, Filter, ExternalLink, ChevronRight, Building, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const JOBS = [
  {
    id: "1", title: "Social Media Manager", company: "C&C Hub", type: "Part-time", location: "Remote", pay: "₦80,000/month",
    category: "Marketing", posted: "2h ago", description: "Manage our X, Instagram, and TikTok accounts. Create viral content, engage with community, schedule posts. Must understand Naija culture and trends.",
    requirements: ["2+ years social media experience", "Strong X/Twitter knowledge", "Video editing skills a plus", "Naija content experience"],
    contact: "@CCHub_", urgent: true,
  },
  {
    id: "2", title: "Graphic Designer (Freelance)", company: "Lagos Creative Agency", type: "Freelance", location: "Remote", pay: "₦15,000–₦50,000/project",
    category: "Design", posted: "1d ago", description: "Looking for talented designers for brand identity, social media graphics, and merch design projects. Must have strong portfolio.",
    requirements: ["Adobe Photoshop/Illustrator", "Strong portfolio", "Quick turnaround", "Experience with brand work"],
    contact: "@lagosbrand", urgent: false,
  },
  {
    id: "3", title: "Content Creator / Vlogger", company: "ThrillSeeka Entertainment", type: "Contract", location: "Lagos / Remote", pay: "Revenue share + ₦30,000 base",
    category: "Content", posted: "2d ago", description: "Create engaging video content for our artist promotion campaigns. Cover events, interviews, and behind-the-scenes content for social media.",
    requirements: ["Video editing (CapCut/Premiere)", "Photography skills", "Strong social following a plus", "Passion for Naija music"],
    contact: "@ThrillSeekaEnt", urgent: false,
  },
  {
    id: "4", title: "React / Next.js Developer", company: "Naija Startup", type: "Full-time", location: "Remote (Nigeria)", pay: "₦200,000–₦400,000/month",
    category: "Tech", posted: "3d ago", description: "Join our growing fintech startup as a frontend developer. Build products used by thousands of Nigerians. Strong React skills required.",
    requirements: ["2+ years React/Next.js", "TypeScript proficiency", "Supabase or Firebase experience", "REST API integration"],
    contact: "@naijastartup", urgent: true,
  },
  {
    id: "5", title: "Community Manager", company: "Lagos Brand Co.", type: "Full-time", location: "Lagos Island", pay: "₦100,000–₦150,000/month",
    category: "Marketing", posted: "4d ago", description: "Build and manage our online community across X and Discord. Create engagement programs, handle DMs, and report community growth metrics.",
    requirements: ["Community management experience", "Excellent communication", "Data-driven mindset", "Crisis handling experience"],
    contact: "@lagosbrandco", urgent: false,
  },
  {
    id: "6", title: "Music A&R Scout", company: "Independent Label", type: "Contract", location: "Lagos / Abuja", pay: "Commission-based",
    category: "Music Industry", posted: "5d ago", description: "Looking for an A&R scout to discover and pitch emerging Naija artists. Strong industry connections preferred. Commission + bonuses for signed artists.",
    requirements: ["Music industry knowledge", "Strong network in Naija industry", "Ear for talent", "Social media savvy"],
    contact: "@indienaija", urgent: false,
  },
];

const CATEGORIES = ["All", "Marketing", "Design", "Tech", "Content", "Music Industry", "Finance", "Customer Service"];
const TYPES = ["All Types", "Full-time", "Part-time", "Freelance", "Contract", "Remote"];

export default function JobsPage() {
  const [tab, setTab] = useState<"browse" | "post">("browse");
  const [cat, setCat] = useState("All");
  const [type, setType] = useState("All Types");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    title: "", company: "", type: "Full-time", location: "", pay: "",
    category: "Marketing", description: "", requirements: "", contact: "",
  });

  const filtered = JOBS.filter(j => {
    const matchCat = cat === "All" || j.category === cat;
    const matchType = type === "All Types" || j.type === type;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

  const apply = (id: string) => {
    setApplied(prev => { const n = new Set(prev); n.add(id); return n; });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Briefcase className="text-yellow-400 w-8 h-8" /> Jobs Board
            </h1>
            <p className="text-zinc-400 mt-1">Find opportunities · Post roles · Build your career in the community</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Listings", value: JOBS.length, icon: "💼" },
            { label: "Remote Roles", value: JOBS.filter(j => j.location.includes("Remote")).length, icon: "🌍" },
            { label: "Urgent Hires", value: JOBS.filter(j => j.urgent).length, icon: "⚡" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-xs text-zinc-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          <button onClick={() => setTab("browse")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === "browse" ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
            💼 Browse Jobs
          </button>
          <button onClick={() => setTab("post")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === "post" ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
            <Plus className="w-4 h-4" /> Post a Job
          </button>
        </div>

        {tab === "browse" && (
          <>
            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  type="text" placeholder="Search jobs, companies..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
              <select value={type} onChange={e => setType(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500 transition-colors">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Job listings */}
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-zinc-500">No jobs match your filter. Try a different category.</div>
              )}
              {filtered.map(job => (
                <div key={job.id} className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${job.urgent ? "border-yellow-500/30" : "border-zinc-800"} hover:border-yellow-400/40`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-black text-white">{job.title}</h3>
                          {job.urgent && <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-400/30">⚡ URGENT</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                          <span className="flex items-center gap-1 text-green-400 font-bold"><DollarSign className="w-3 h-3" /> {job.pay}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">{job.category}</span>
                        <span className="text-xs text-zinc-600">{job.posted}</span>
                      </div>
                    </div>

                    {expanded === job.id && (
                      <div className="mt-4 border-t border-zinc-800 pt-4">
                        <p className="text-sm text-zinc-300 leading-relaxed mb-3">{job.description}</p>
                        <div className="mb-4">
                          <div className="text-xs font-bold text-zinc-400 mb-2">REQUIREMENTS</div>
                          <ul className="space-y-1">
                            {job.requirements.map(r => (
                              <li key={r} className="text-xs text-zinc-300 flex items-start gap-2">
                                <span className="text-yellow-400 mt-0.5 flex-shrink-0">•</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-zinc-400">Contact: <span className="text-yellow-400">{job.contact}</span></div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                        {expanded === job.id ? "Less info ↑" : "More info ↓"}
                      </button>
                      <div className="flex-1" />
                      <a href={`https://twitter.com/${job.contact.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-zinc-800 text-zinc-300 font-bold px-3 py-2 rounded-full hover:bg-zinc-700 transition-colors flex items-center gap-1">
                        DM <ExternalLink className="w-3 h-3" />
                      </a>
                      <button onClick={() => apply(job.id)}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${applied.has(job.id) ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-400 text-black hover:bg-yellow-300"}`}>
                        {applied.has(job.id) ? "✓ Applied!" : "Apply Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "post" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 text-sm text-yellow-300">
              💼 Post a job to reach 15,000+ community members. Free to post. Featured listings available.
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "title", label: "Job Title", placeholder: "e.g. Social Media Manager" },
                { key: "company", label: "Company / Brand Name", placeholder: "e.g. My Brand Lagos" },
                { key: "location", label: "Location", placeholder: "e.g. Remote / Lagos" },
                { key: "pay", label: "Salary / Pay", placeholder: "e.g. ₦100,000/month" },
                { key: "contact", label: "Your X Handle", placeholder: "@yourhandle" },
              ].map(f => (
                <div key={f.key} className={f.key === "title" || f.key === "contact" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs text-zinc-400 mb-2 font-medium">{f.label}</label>
                  <input type="text" placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2 font-medium">Job Type</label>
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500">
                  {["Full-time","Part-time","Freelance","Contract","Internship"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2 font-medium">Category</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm outline-none focus:border-yellow-500">
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Job Description</label>
              <textarea rows={4} placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Requirements (one per line)</label>
              <textarea rows={3} placeholder="e.g. 2+ years experience&#10;Portfolio required&#10;Must be based in Nigeria"
                value={form.requirements}
                onChange={e => setForm(prev => ({ ...prev, requirements: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none"
              />
            </div>

            <button className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-colors text-base">
              Post Job — FREE 💼
            </button>
            <p className="text-xs text-zinc-500 text-center">Want a featured listing? Contact <span className="text-yellow-400">@CCHub_</span> for premium placement — ₦10,000/week</p>
          </div>
        )}
      </main>
    </div>
  );
}
