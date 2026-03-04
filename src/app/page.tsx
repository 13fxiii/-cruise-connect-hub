import Link from "next/link";
import { Zap, Mic, Gamepad2, Wallet, Megaphone, ArrowRight, Users, TrendingUp, Gift, Music, Film, ShoppingBag, Briefcase, Trophy, Star } from "lucide-react";

export default function HomePage() {
  const FEATURES = [
    { icon: Mic,        label: "Live Spaces",   desc: "Audio rooms powered by X community",        href: "/spaces",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20" },
    { icon: Gamepad2,   label: "Games Hub",     desc: "Trivia, Ludo, Wordle & tournaments",        href: "/games",    color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20" },
    { icon: Wallet,     label: "CC Wallet",     desc: "Earn points & real Naira rewards",          href: "/wallet",   color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { icon: Megaphone,  label: "PR / ADS",      desc: "Promote your brand to 3K+ members",        href: "/ads",      color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { icon: Music,      label: "Music Hub",     desc: "Stream Naija music on all platforms",       href: "/music",    color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20" },
    { icon: Film,       label: "Movie Hub",     desc: "Watch parties & Nollywood spotlight",       href: "/movies",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20" },
    { icon: ShoppingBag,label: "C&C Shop",      desc: "Merch, vendors & community marketplace",   href: "/shop",     color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
    { icon: Briefcase,  label: "Jobs Board",    desc: "Naija-focused creative & tech gigs",        href: "/jobs",     color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20" },
  ];

  const STATS = [
    { icon: Users,       label: "Community Members", value: "3,000+" },
    { icon: TrendingUp,  label: "Monthly Spaces",    value: "100+" },
    { icon: Gift,        label: "Prizes Distributed", value: "₦500K+" },
    { icon: Trophy,      label: "Games Played",      value: "2,000+" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-yellow-400/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-400/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-5xl mx-auto px-4 h-16 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-black text-sm">
            <span className="text-white">Cruise & Connect</span>
            <span className="text-yellow-400"> Hub〽️</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/feed" className="text-zinc-400 text-sm hover:text-white transition-colors hidden sm:block">Community</Link>
          <Link href="/auth/login" className="text-zinc-400 text-sm hover:text-white transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="bg-yellow-400 text-black text-sm font-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-all hover:scale-105">
            Join Free 🚌
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <Link href="https://x.com/i/communities/1897164314764579242" target="_blank"
          className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-bold mb-8 hover:bg-yellow-400/20 transition-colors">
          🚌 3,000+ Members Strong · One Year Old 🎂
        </Link>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
          <span className="text-yellow-400">Cruise.</span>{" "}
          <span className="text-white">Connect.</span>{" "}
          <span className="text-yellow-400">Grow.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The home of Naija culture online. Live Spaces, Games, Music, Movies, Jobs, and a community
          that genuinely <span className="text-white font-semibold">rides together.</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup"
            className="flex items-center gap-2 bg-yellow-400 text-black font-black px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all hover:scale-105 text-lg shadow-lg shadow-yellow-400/20">
            Join the Community <ArrowRight size={20} />
          </Link>
          <Link href="/feed"
            className="flex items-center gap-2 border border-zinc-700 text-white font-bold px-8 py-4 rounded-2xl hover:bg-zinc-800 transition-colors text-lg">
            Browse the Feed
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center hover:border-yellow-400/30 transition-colors">
              <Icon size={20} className="text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-white mb-1">{value}</div>
              <div className="text-zinc-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">Everything in One Bus 🚌</h2>
          <p className="text-zinc-500">8 features built for the culture</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc, href, color, bg, border }) => (
            <Link key={href} href={href}
              className={`group bg-zinc-900 border ${border} rounded-2xl p-5 hover:border-opacity-60 transition-all hover:-translate-y-1 hover:shadow-lg`}>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{label}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Community ID CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-yellow-400/15 via-yellow-400/8 to-transparent border border-yellow-400/20 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={20} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">NEW FEATURE</span>
            </div>
            <h3 className="text-white font-black text-2xl mb-2">Get Your Community ID Card 〽️</h3>
            <p className="text-zinc-400 text-sm">Flex your membership on X, Instagram, WhatsApp, TikTok and more.</p>
          </div>
          <Link href="/community-id"
            className="flex-shrink-0 flex items-center gap-2 bg-yellow-400 text-black font-black px-6 py-3 rounded-xl hover:bg-yellow-300 transition-all hover:scale-105 whitespace-nowrap">
            Get Your ID <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Anniversary Banner */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-4">🎂🚌💛</div>
          <h3 className="text-white font-black text-2xl mb-3">Celebrating 1 Year of the Cruise</h3>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">One year. 3,000+ members. Infinite gists. The bus never stopped and Year 2 is about to go even harder.</p>
          <Link href="https://x.com/i/communities/1897164314764579242" target="_blank"
            className="inline-flex items-center gap-2 border border-yellow-400/30 text-yellow-400 font-bold px-6 py-3 rounded-xl hover:bg-yellow-400/10 transition-colors">
            Join on X Community <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-yellow-400 flex items-center justify-center">
              <Zap size={12} className="text-black" />
            </div>
            <span className="text-zinc-500 text-sm">Cruise & Connect Hub〽️</span>
          </div>
          <div className="flex items-center gap-6">
            {[["Feed","/feed"],["Games","/games"],["Music","/music"],["Jobs","/jobs"],["Community ID","/community-id"]].map(([l,h]) => (
              <Link key={h} href={h} className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-zinc-700 text-xs">Built by @13fxiii · Est. 2024</p>
        </div>
      </footer>
    </main>
  );
}
