"use client";
import { useState, useEffect } from "react";

import { Building2, CheckCircle, Zap, BarChart3, Star, ArrowRight, Send } from "lucide-react";

const INDUSTRIES = ["Music","Tech","Fashion","Food & Beverage","Finance","Entertainment","Beauty","Sports","Other"];
const BUDGETS    = ["Under ₦50K","₦50K – ₦200K","₦200K – ₦500K","₦500K – ₦1M","Above ₦1M"];

export default function SponsorsPage() {
  const [packages, setPackages]     = useState<any[]>([]);
  const [selected, setSelected]     = useState<string|null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [form, setForm] = useState({
    brand_name:"", contact_name:"", contact_email:"", contact_phone:"",
    website:"", industry:"", campaign_brief:"", budget_range:"",
  });
  const f = (k: string) => (e: any) => setForm(p => ({...p, [k]: e.target.value}));

  useEffect(() => {
    fetch("/api/sponsors").then(r => r.json()).then(d => setPackages(d.packages || []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/sponsors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, package_id: selected }),
    });
    setLoading(false);
    if (res.ok) setSubmitted(true);
    else alert("Submission failed. Please try again.");
  };

  const DEMO_PACKAGES = packages.length ? packages : [
    { id:"1", name:"Starter",          price_display:"₦20,000",  duration_days:1,   features:["1 featured post","Community mention","Stats report"],                                                                         is_featured:false },
    { id:"2", name:"Weekly",           price_display:"₦140,000", duration_days:7,   features:["7 daily posts","Pinned banner","Live space mention","Weekly stats"],                                                           is_featured:true  },
    { id:"3", name:"Monthly",          price_display:"₦350,000", duration_days:30,  features:["30-day campaign","Video space slot","Community ID card feature","Full analytics","Priority support"],                          is_featured:false },
    { id:"4", name:"Brand Ambassador", price_display:"₦750,000", duration_days:90,  features:["Full endorsement","All previous perks","Exclusive community badge","Dedicated content series","Monthly strategy call"],        is_featured:false },
    { id:"5", name:"Premium Partner",  price_display:"₦1.5M",    duration_days:180, features:["6-month exclusivity option","All Ambassador perks","Co-branded events","Revenue share on referred members","CEO-level access"],is_featured:false },
  ];

  if (submitted) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-white font-black text-2xl mb-2">Application Received! 🎉</h2>
        <p className="text-zinc-400 text-sm">Our team will review your application and reach out to <span className="text-yellow-400 font-bold">{form.contact_email}</span> within 24 hours.</p>
        <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left space-y-2">
          <div className="text-zinc-400 text-xs font-bold">WHAT HAPPENS NEXT</div>
          {["Team reviews your brief","You receive a tailored proposal","Campaign goes live 🚌"].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black text-xs">{i+1}</div>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black px-3 py-1.5 rounded-full">
            <Building2 className="w-3.5 h-3.5" /> BRAND SPONSORSHIP PORTAL
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Reach 3,000+ Engaged</h1>
          <h1 className="text-3xl md:text-4xl font-black text-yellow-400">Naija Community Members</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">Promote your music, business, or brand to a highly engaged Nigerian community. Real humans. Real engagement. Real results.</p>
        </div>

        {/* Why Sponsor */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:Users,    label:"3,000+",        sub:"Active Members"        },
            { icon:Zap,      label:"85%",            sub:"Daily Engagement Rate" },
            { icon:BarChart3, label:"₦2.4M+",       sub:"Community Spend/Month" },
            { icon:Star,     label:"Nigeria + Diaspora", sub:"Target Audience"  },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <div className="text-white font-black text-base">{label}</div>
              <div className="text-zinc-600 text-[10px]">{sub}</div>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div>
          <h2 className="text-white font-black text-xl mb-4 text-center">Sponsorship Packages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_PACKAGES.map(pkg => (
              <div key={pkg.id}
                onClick={() => { setSelected(pkg.id); setShowForm(true); }}
                className={`relative cursor-pointer bg-zinc-950 border rounded-2xl p-5 transition-all hover:border-yellow-400/50 ${selected === pkg.id ? "border-yellow-400 bg-yellow-400/5" : "border-zinc-800"}`}>
                {pkg.is_featured && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full">MOST POPULAR</div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-black text-lg">{pkg.name}</div>
                  <div className="text-yellow-400 font-black text-xl">{pkg.price_display}</div>
                </div>
                <div className="text-zinc-500 text-xs mb-4">{pkg.duration_days} day{pkg.duration_days > 1 ? "s" : ""} campaign</div>
                <ul className="space-y-2 mb-4">
                  {(pkg.features || []).map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelected(pkg.id); setShowForm(true); }}
                  className={`w-full py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    pkg.is_featured ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}>
                  Apply for This <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <div id="apply-form" className="bg-zinc-950 border border-yellow-400/20 rounded-2xl p-6">
            <h2 className="text-white font-black text-xl mb-1">Submit Your Application</h2>
            <p className="text-zinc-500 text-xs mb-5">Selected: <span className="text-yellow-400 font-bold">{DEMO_PACKAGES.find(p => p.id === selected)?.name || "Custom"}</span> package</p>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { k:"brand_name",    label:"Brand/Business Name *", ph:"e.g. Lagos Sounds Studio" },
                { k:"contact_name",  label:"Your Name *",           ph:"e.g. Amara Johnson"       },
                { k:"contact_email", label:"Email Address *",       ph:"amara@brand.com"          },
                { k:"contact_phone", label:"Phone Number",          ph:"+234 801 234 5678"         },
                { k:"website",       label:"Website / Social Link", ph:"https://yourwebsite.com"  },
              ].map(({k, label, ph}) => (
                <div key={k}>
                  <label className="text-zinc-400 text-xs font-bold block mb-1.5">{label}</label>
                  <input value={(form as any)[k]} onChange={f(k)} placeholder={ph}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
                </div>
              ))}

              <div>
                <label className="text-zinc-400 text-xs font-bold block mb-1.5">Industry</label>
                <select value={form.industry} onChange={f("industry")}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 text-xs font-bold block mb-1.5">Budget Range</label>
                <select value={form.budget_range} onChange={f("budget_range")}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400">
                  <option value="">Select budget</option>
                  {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-zinc-400 text-xs font-bold block mb-1.5">Campaign Brief * <span className="text-zinc-600 font-normal">(What do you want to promote? Who's your target audience?)</span></label>
                <textarea value={form.campaign_brief} onChange={f("campaign_brief")} rows={4} required
                  placeholder="Tell us about your brand, campaign goals, and what you'd like CC Hub members to do..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none" />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading || !form.brand_name || !form.contact_name || !form.contact_email || !form.campaign_brief}
                  className="flex-1 bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 disabled:opacity-40 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {loading ? "Submitting..." : "Submit Application"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl hover:bg-zinc-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          <div className="text-center">
            <button onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-black font-black px-8 py-3.5 rounded-full hover:bg-yellow-300 text-base flex items-center gap-2 mx-auto">
              Apply for Sponsorship <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-zinc-600 text-xs mt-3">Or DM <span className="text-yellow-400">@TheCruiseCH</span> on X to discuss custom packages</p>
          </div>
        )}
      </main>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
