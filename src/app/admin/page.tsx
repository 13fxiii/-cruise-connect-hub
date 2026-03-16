"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  LayoutDashboard, Users, FileText, Megaphone, Briefcase, Music,
  CheckCircle, XCircle, Loader2, RefreshCw, TrendingUp, DollarSign,
  Zap, Bell, Bot, Sparkles, Copy, Check, Send, Wand2, Hash,
  CalendarDays, Mic, Gamepad2, ShoppingBag, Star, ChevronDown,
  BarChart2, Eye, Trash2, PenLine, Clock, Radio
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type Tab = "overview" | "autopost" | "ads" | "jobs" | "members" | "announcements";
type PostTone = "hype" | "gist" | "announcement" | "poll" | "game" | "music" | "jobs" | "space";

interface GeneratedPost { id: string; content: string; tone: PostTone; copied: boolean; }
interface AdSub { id: string; brand_name: string; package: string; status: string; amount_ngn: number; contact_email: string; created_at: string; }

/* ── Post tone config ───────────────────────────────────────── */
const TONES: { id: PostTone; label: string; emoji: string; desc: string; color: string }[] = [
  { id: "hype",         label: "Hype Energy",    emoji: "🔥", desc: "Hype the community up",     color: "border-orange-400/40 bg-orange-400/5 text-orange-300" },
  { id: "gist",         label: "Gist & Vibes",   emoji: "👀", desc: "Casual culture gist post",  color: "border-pink-400/40 bg-pink-400/5 text-pink-300" },
  { id: "announcement", label: "Announcement",   emoji: "📣", desc: "Official community update", color: "border-yellow-400/40 bg-yellow-400/5 text-yellow-300" },
  { id: "poll",         label: "Poll/Question",  emoji: "🗳️", desc: "Engage with a question",    color: "border-blue-400/40 bg-blue-400/5 text-blue-300" },
  { id: "game",         label: "Game Night",     emoji: "🎮", desc: "Promote a game session",    color: "border-purple-400/40 bg-purple-400/5 text-purple-300" },
  { id: "music",        label: "Music Drop",     emoji: "🎵", desc: "Naija music promotion",     color: "border-green-400/40 bg-green-400/5 text-green-300" },
  { id: "jobs",         label: "Job Alert",      emoji: "💼", desc: "Share a job opportunity",   color: "border-cyan-400/40 bg-cyan-400/5 text-cyan-300" },
  { id: "space",        label: "Space Invite",   emoji: "🎤", desc: "X Spaces session invite",   color: "border-red-400/40 bg-red-400/5 text-red-300" },
];

const TONE_PROMPTS: Record<PostTone, string> = {
  hype:         `You are the voice of Cruise Connect Hub (CCHub), a 3,000+ member Naija Twitter/X community. Write a SHORT hype post (max 240 chars) in authentic Naija street energy. Use Naija slang naturally. No hashtags inside the text — add 2-3 relevant hashtags at the end only. Topic: `,
  gist:         `You are CCHub — a sharp, fun Naija community voice. Write a SHORT gist/culture post (max 240 chars) that sparks conversation. Naija vibes, relatable, real. Add 2-3 hashtags at the end. Topic: `,
  announcement: `You are the official CCHub admin voice. Write a SHORT announcement post (max 240 chars) — clear, energetic, community-first. Official but not stiff. Add 2-3 hashtags at the end. Topic: `,
  poll:         `You are CCHub. Write a SHORT engaging poll or debate question post (max 200 chars) for a Naija community. End with 2 clear options using A) and B) format or a direct question. Add 2-3 hashtags at the end. Topic: `,
  game:         `You are CCHub. Write a SHORT hype post (max 240 chars) inviting the community to a game night or tournament. Naija energy, fun, competitive. Add 2-3 hashtags at the end. Topic: `,
  music:        `You are CCHub. Write a SHORT music promotion post (max 240 chars) for the Naija community. Highlight the vibe and energy of the track/artist. Add 2-3 music hashtags at the end. Topic: `,
  jobs:         `You are CCHub. Write a SHORT job alert post (max 240 chars) for the community. Make it feel exciting, not corporate. Naija context. Add 2-3 hashtags at the end. Topic: `,
  space:        `You are CCHub. Write a SHORT X Space invite post (max 240 chars). Create urgency and excitement — people NEED to join. Naija energy. Add 2-3 hashtags at the end. Topic: `,
};

const MOCK_ADS: AdSub[] = [
  { id:"1", brand_name:"Splendor Cosmetics", package:"weekly", status:"pending", amount_ngn:45000, contact_email:"splendor@gmail.com", created_at:"2024-01-15T10:00:00Z" },
  { id:"2", brand_name:"AfroBeats FM",       package:"day",    status:"pending", amount_ngn:15000, contact_email:"afrobeats@fm.com",   created_at:"2024-01-14T14:00:00Z" },
];

const PKG_LABELS: Record<string,string> = {
  day:"1-Day AD", day_dual:"1-Day Dual", weekly:"Weekly ADS", monthly:"Monthly ADS",
  ambassador_3m:"3-Month Deal", ambassador_6m:"6-Month Deal"
};

/* ── Stat card data ─────────────────────────────────────────── */
const STATS = [
  { label:"Members",       value:"3,000+",  icon:Users,      color:"text-blue-400",   change:"+38 this week" },
  { label:"Posts Today",   value:"47",      icon:FileText,   color:"text-green-400",  change:"Active feed" },
  { label:"Pending Ads",   value:"2",       icon:Megaphone,  color:"text-yellow-400", change:"Needs review" },
  { label:"Active Jobs",   value:"8",       icon:Briefcase,  color:"text-orange-400", change:"3 urgent" },
  { label:"Games Played",  value:"2,000+",  icon:Zap,        color:"text-purple-400", change:"This month" },
  { label:"Revenue (mo)",  value:"₦450K",   icon:DollarSign, color:"text-yellow-400", change:"+₦120k ads" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [tab, setTab]       = useState<Tab>("overview");
  const [ads, setAds]       = useState<AdSub[]>([]);
  const [loading, setLoading] = useState(false);
  const [actLoading, setActLoading] = useState<string|null>(null);

  useEffect(() => {
    if (tab === "ads") fetchAds();
  }, [tab]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/ads?admin=1");
      const d = await r.json();
      setAds(d.submissions?.length ? d.submissions : MOCK_ADS);
    } catch { setAds(MOCK_ADS); }
    setLoading(false);
  };

  const updateAd = async (id: string, status: "approved"|"rejected") => {
    setActLoading(id + status);
    try { await fetch(`/api/ads/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) }); } catch {}
    setAds(prev => prev.map(a => a.id===id ? {...a, status} : a));
    setActLoading(null);
  };

  const SIDEBAR: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id:"overview",      label:"Overview",         icon:LayoutDashboard },
    { id:"autopost",      label:"Post Automation",  icon:Bot, badge: 1 },
    { id:"announcements", label:"Announcements",    icon:Radio },
    { id:"ads",           label:"Ad Submissions",   icon:Megaphone, badge: 2 },
    { id:"jobs",          label:"Jobs",             icon:Briefcase },
    { id:"members",       label:"Members",          icon:Users },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-3 py-6">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <LayoutDashboard size={20} className="text-yellow-400" />
              Admin Panel
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">Cruise Connect Hub〽️ · @TheCruiseCH</p>
          </div>
          <span className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
            👑 Super Admin
          </span>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col gap-1 w-44 flex-shrink-0">
            {SIDEBAR.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors relative ${
                  tab === id ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                             : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}>
                <Icon size={14} />
                {label}
                {badge && tab !== id && (
                  <span className="ml-auto bg-yellow-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </aside>

          {/* Mobile tab strip */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto scrollbar-hide mb-3 w-full">
            {SIDEBAR.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  tab === id ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400"
                }`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {tab === "overview"      && <OverviewTab />}
            {tab === "autopost"      && <AutoPostTab />}
            {tab === "announcements" && <AnnouncementsTab />}
            {tab === "ads"           && <AdsTab ads={ads} loading={loading} actLoading={actLoading} onUpdate={updateAd} onRefresh={fetchAds} />}
            {tab === "jobs"          && <JobsTab />}
            {tab === "members"       && <MembersTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════════════════════════ */
function OverviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {STATS.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500 text-xs">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-zinc-600 text-[11px] mt-0.5">{change}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label:"New Post",     icon:PenLine,    href:"/feed",        color:"bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
            { label:"Live Space",   icon:Mic,        href:"/spaces",      color:"bg-red-400/10 text-red-400 border-red-400/20" },
            { label:"Run Game",     icon:Gamepad2,   href:"/games",       color:"bg-purple-400/10 text-purple-400 border-purple-400/20" },
            { label:"Post Bot",     icon:Bot,        href:"#",            color:"bg-green-400/10 text-green-400 border-green-400/20" },
          ].map(({ label, icon: Icon, color }) => (
            <button key={label}
              className={`border ${color} rounded-xl p-3 flex flex-col items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-yellow-400" />
          Recent Activity
        </h3>
        <div className="space-y-2.5">
          {[
            { text:"New ad submission from Splendor Cosmetics", time:"2m ago", dot:"bg-yellow-400" },
            { text:"3 new members joined the community", time:"15m ago", dot:"bg-green-400" },
            { text:"Game Night trivia — 47 players participated", time:"1h ago", dot:"bg-purple-400" },
            { text:"Music submission from @ThrillSeekaEnt approved", time:"3h ago", dot:"bg-blue-400" },
            { text:"Job listing: Senior React Dev — 12 applications", time:"5h ago", dot:"bg-orange-400" },
          ].map(({ text, time, dot }) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 text-xs leading-snug">{text}</p>
                <p className="text-zinc-600 text-[11px]">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI POST AUTOMATION TAB
═══════════════════════════════════════════════════════════════ */
function AutoPostTab() {
  const [tone, setTone]         = useState<PostTone>("hype");
  const [topic, setTopic]       = useState("");
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts]       = useState<GeneratedPost[]>([]);
  const [error, setError]       = useState("");
  const [count, setCount]       = useState(3);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generate = async () => {
    if (!topic.trim()) { setError("Give me a topic first king 👑"); return; }
    setGenerating(true);
    setError("");
    const newPosts: GeneratedPost[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const prompt = TONE_PROMPTS[tone] + topic + `. Generate post #${i+1} of ${count}. Make each one UNIQUE and different from the others. Return ONLY the post text, no explanation.`;
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        const text = data.content?.[0]?.text?.trim() || "";
        if (text) {
          newPosts.push({ id: `${Date.now()}-${i}`, content: text, tone, copied: false });
        }
      } catch {
        setError("Generation failed — check your connection");
      }
    }

    setPosts(prev => [...newPosts, ...prev].slice(0, 20));
    setGenerating(false);
  };

  const copyPost = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, copied: true } : p));
    setTimeout(() => setPosts(prev => prev.map(p => p.id === id ? { ...p, copied: false } : p)), 2000);
  };

  const deletePost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));

  const selectedTone = TONES.find(t => t.id === tone)!;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent border border-yellow-400/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot size={16} className="text-yellow-400" />
          <h2 className="text-white font-black text-sm">AI Post Generator</h2>
          <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">BETA</span>
        </div>
        <p className="text-zinc-400 text-xs">Generate Naija-flavoured posts for your X Community. Pick a vibe, give a topic, copy & post.</p>
      </div>

      {/* Tone selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-white font-bold text-xs mb-3 flex items-center gap-1.5">
          <Sparkles size={13} className="text-yellow-400" /> Choose Post Vibe
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className={`border rounded-xl p-2.5 text-left transition-all ${
                tone === t.id ? t.color + " ring-1 ring-current" : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}>
              <div className="text-lg mb-0.5">{t.emoji}</div>
              <div className="text-xs font-bold leading-tight">{t.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic input + generate */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-white font-bold text-xs mb-3 flex items-center gap-1.5">
          <PenLine size={13} className="text-yellow-400" /> What&apos;s the Topic?
        </h3>
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={`e.g. "Tonight's trivia game starts 9pm" or "New track from Burna Boy" or "Job alert for UI designers"...`}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none resize-none transition-colors"
        />

        {/* Count + generate row */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs">Generate</span>
            {[1,2,3,5].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  count === n ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {n}
              </button>
            ))}
            <span className="text-zinc-500 text-xs">posts</span>
          </div>
          <button onClick={generate} disabled={generating || !topic.trim()}
            className="ml-auto flex items-center gap-2 bg-yellow-400 text-black font-black text-xs px-4 py-2 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {generating
              ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
              : <><Wand2 size={13} /> Generate Posts</>}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-2.5 mt-3">{error}</p>
        )}
      </div>

      {/* Generated posts */}
      {generating && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!generating && posts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-xs flex items-center gap-1.5">
              <CheckCircle size={13} className="text-green-400" />
              Generated Posts ({posts.length})
            </h3>
            <button onClick={() => setPosts([])} className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
              Clear all
            </button>
          </div>
          {posts.map(post => {
            const t = TONES.find(x => x.id === post.tone)!;
            return (
              <div key={post.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors group">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-sm">{t.emoji}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.color}`}>{t.label}</span>
                  <span className="text-zinc-600 text-[10px] ml-auto">{post.content.length} chars</span>
                </div>
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => copyPost(post.id, post.content)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      post.copied
                        ? "bg-green-400/20 text-green-400 border border-green-400/30"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                    }`}>
                    {post.copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Post</>}
                  </button>
                  <a href={`https://x.com/i/communities/1897164314764579242`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Post to X
                  </a>
                  <button onClick={() => deletePost(post.id)}
                    className="ml-auto p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {posts.length === 0 && !generating && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-zinc-400 font-bold text-xs mb-2.5">💡 Post Ideas for Today</h3>
          <div className="space-y-2">
            {[
              "🎮 Game night tonight — invite members to trivia",
              "🎵 Spotlight a Naija artist from the music hub",
              "🔥 Ask members: who's the GOAT Afrobeats artiste?",
              "📣 Anniversary celebration — 1 year of cruising",
              "💼 Job alert for creatives in Lagos",
              "🎤 Announce next X Space date and topic",
            ].map(idea => (
              <button key={idea} onClick={() => setTopic(idea.substring(3))}
                className="w-full text-left text-xs text-zinc-400 hover:text-yellow-400 py-1.5 px-2.5 rounded-lg hover:bg-yellow-400/5 transition-colors border border-transparent hover:border-yellow-400/10">
                {idea}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANNOUNCEMENTS TAB
═══════════════════════════════════════════════════════════════ */
function AnnouncementsTab() {
  const [msg, setMsg]       = useState("");
  const [sent, setSent]     = useState(false);
  const [copied, setCopied] = useState(false);

  const TEMPLATES = [
    { label:"🎮 Game Night",      text:"🎮 GAME NIGHT ALERT!\n\nCC Hub Game Night is LIVE tonight 9PM WAT!\n\nTrivia · Ludo · Prizes up for grabs 🏆\n\nJoin the community now 👇\nhttps://cruise-connect-hub.vercel.app/games\n\n#CruiseConnect #CCHub #NaijaGames" },
    { label:"🎤 X Space",         text:"🎤 X SPACE STARTING NOW!\n\nDrop what you're doing — we're live!\n\nCome through 👇\nhttps://x.com/i/communities/1897164314764579242\n\n#CruiseConnect #CCHub #NaijaTwitter" },
    { label:"📣 New Feature",     text:"📣 BIG ANNOUNCEMENT!\n\nNew feature just dropped on the CC Hub app 🚀\n\nCheck it out 👇\nhttps://cruise-connect-hub.vercel.app\n\n#CruiseConnect #CCHub" },
    { label:"🏆 Winner",          text:"🏆 WE HAVE A WINNER!\n\nBig ups to today's champion 👑\n\nWant to be next? Join the hub 👇\nhttps://cruise-connect-hub.vercel.app/games\n\n#CruiseConnect #CCHub #NaijaWinner" },
    { label:"🎂 Anniversary",     text:"🎂 1 YEAR OF CRUISING!\n\nOne year. 3,000+ members. Infinite gists.\n\nThank you for riding with us 🙏🚌\n\nhttps://cruise-connect-hub.vercel.app\n\n#CruiseConnect #CCHub #NaijaCommunity" },
    { label:"💼 Job Alert",       text:"💼 JOB ALERT!\n\nNew opportunity just posted on CC Hub Jobs Board.\n\nNaija creatives & tech folks — this one's for you 👇\nhttps://cruise-connect-hub.vercel.app/jobs\n\n#CruiseConnect #CCHub #NaijaJobs" },
  ];

  const copy = () => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-white font-black text-sm mb-1 flex items-center gap-2">
          <Radio size={15} className="text-yellow-400" /> Announcement Builder
        </h2>
        <p className="text-zinc-500 text-xs mb-4">Pick a template or write your own. Copy and post to X Community.</p>

        {/* Templates */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => setMsg(t.text)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all text-left">
              {t.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <textarea value={msg} onChange={e => setMsg(e.target.value)}
          placeholder="Write your announcement here, or pick a template above..."
          rows={8}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none resize-none transition-colors font-mono" />

        <div className="flex items-center gap-2 mt-3">
          <span className="text-zinc-600 text-xs">{msg.length} chars</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={copy} disabled={!msg}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                copied ? "bg-green-400 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
              } disabled:opacity-40`}>
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
            <a href="https://x.com/i/communities/1897164314764579242" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition-colors">
              <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Post to X Community
            </a>
          </div>
        </div>
      </div>

      {/* Posting schedule tips */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-white font-bold text-xs mb-3 flex items-center gap-1.5">
          <Clock size={13} className="text-yellow-400" /> Best Times to Post (WAT)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { time:"8–10 AM", label:"Morning gist", color:"bg-blue-400/20 text-blue-300", tip:"High engagement" },
            { time:"12–2 PM", label:"Lunch break",  color:"bg-green-400/20 text-green-300", tip:"Naija lunch scroll" },
            { time:"7–9 PM",  label:"Evening peak", color:"bg-yellow-400/20 text-yellow-300", tip:"Best for games/spaces" },
            { time:"10–11 PM",label:"Night owls",   color:"bg-purple-400/20 text-purple-300", tip:"Deep engagement" },
          ].map(({ time, label, color, tip }) => (
            <div key={time} className={`${color} rounded-xl p-3`}>
              <div className="font-black text-sm">{time}</div>
              <div className="font-semibold text-xs opacity-90">{label}</div>
              <div className="text-[11px] opacity-70">{tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADS TAB
═══════════════════════════════════════════════════════════════ */
function AdsTab({ ads, loading, actLoading, onUpdate, onRefresh }: {
  ads: AdSub[]; loading: boolean; actLoading: string|null;
  onUpdate: (id:string, s:"approved"|"rejected")=>void; onRefresh: ()=>void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-black text-sm">Ad Submissions</h2>
        <button onClick={onRefresh} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-yellow-400" size={24} />
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm">No submissions yet</div>
      ) : (
        ads.map(ad => (
          <div key={ad.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-white font-bold text-sm">{ad.brand_name}</h3>
                <p className="text-zinc-500 text-xs">{ad.contact_email}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                ad.status==="approved" ? "bg-green-400/10 text-green-400 border-green-400/20" :
                ad.status==="rejected" ? "bg-red-400/10 text-red-400 border-red-400/20" :
                "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
              }`}>
                {ad.status.charAt(0).toUpperCase()+ad.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
              <span>📦 {PKG_LABELS[ad.package] || ad.package}</span>
              <span>💰 ₦{ad.amount_ngn.toLocaleString()}</span>
              <span>📅 {new Date(ad.created_at).toLocaleDateString()}</span>
            </div>
            {ad.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => onUpdate(ad.id,"approved")} disabled={!!actLoading}
                  className="flex items-center gap-1.5 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-bold px-3 py-2 rounded-lg hover:bg-green-400/20 transition-colors disabled:opacity-50">
                  {actLoading===ad.id+"approved" ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle size={12}/>} Approve
                </button>
                <button onClick={() => onUpdate(ad.id,"rejected")} disabled={!!actLoading}
                  className="flex items-center gap-1.5 bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-400/20 transition-colors disabled:opacity-50">
                  {actLoading===ad.id+"rejected" ? <Loader2 size={12} className="animate-spin"/> : <XCircle size={12}/>} Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JOBS TAB
═══════════════════════════════════════════════════════════════ */
function JobsTab() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
      <Briefcase size={32} className="text-yellow-400 mx-auto mb-3" />
      <h2 className="text-white font-black text-sm mb-1">Jobs Management</h2>
      <p className="text-zinc-500 text-xs mb-4">Review and manage job listings from the community.</p>
      <a href="/jobs" className="inline-flex items-center gap-1.5 bg-yellow-400 text-black font-black text-xs px-4 py-2 rounded-xl hover:bg-yellow-300 transition-colors">
        View Jobs Board →
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MEMBERS TAB
═══════════════════════════════════════════════════════════════ */
function MembersTab() {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-white font-black text-sm mb-3">Member Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:"Total Members", value:"3,000+", color:"text-blue-400" },
            { label:"Active This Week", value:"847",   color:"text-green-400" },
            { label:"New This Month",  value:"234",   color:"text-yellow-400" },
            { label:"X Community",     value:"2,900+",color:"text-purple-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-zinc-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
        <Users size={28} className="text-yellow-400 mx-auto mb-2" />
        <p className="text-zinc-400 text-xs">Full member management (ban, promote, DM) coming in Phase 5</p>
      </div>
    </div>
  );
}
