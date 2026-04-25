import Link from "next/link";
import Image from "next/image";
import { Mic, Gamepad2, Wallet, Megaphone, ArrowRight, Users, TrendingUp, Gift, Music, Film, ShoppingBag, Briefcase, Trophy, Star, Zap } from "lucide-react";

export default function HomePage() {
  const FEATURES = [
    { icon: Mic,         label: "Live Spaces",  desc: "Audio rooms on X community",         href: "/spaces",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20" },
    { icon: Gamepad2,    label: "Entertainment Hub",    desc: "Games, Music & Movies in one place",          href: "/entertainment",    color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20" },
    { icon: Wallet,      label: "CC Wallet",    desc: "Earn points & real Naira",            href: "/wallet",   color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { icon: Megaphone,   label: "PR / ADS",     desc: "Reach 3K+ members",                  href: "/ads",      color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { icon: Music,       label: "Music Hub",    desc: "Playlists + Cruise Connect Radio",       href: "/music",    color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20" },
    { icon: Film,        label: "Movie Hub",    desc: "Cruise Cinema watch parties",           href: "/movies",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20" },
    { icon: ShoppingBag, label: "CC Marketplace",     desc: "Merch, PR/Ads, shop & vendors",       href: "/marketplace",     color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
    { icon: Briefcase,   label: "Jobs Board",   desc: "Naija creative & tech gigs",          href: "/jobs",     color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/20" },
  ];

  const STATS = [
    { icon: Users,      label: "Members",       value: "3,000+" },
    { icon: TrendingUp, label: "Spaces Hosted", value: "100+" },
    { icon: Gift,       label: "Prizes Given",  value: "₦500K+" },
    { icon: Trophy,     label: "Games Played",  value: "2,000+" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-5xl mx-auto px-4 h-14 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-2">
          {/* Real logo */}
          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.jpeg" alt="Cruise Connect Hub" fill sizes="32px" className="object-cover" priority />
          </div>
          <span className="font-black text-xs hidden sm:inline leading-tight">
            <span className="text-white">Cruise Connect</span>
            <span className="text-yellow-400"> Hub〽️</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/feed" className="text-zinc-400 text-xs hover:text-white transition-colors hidden sm:block">Community</Link>
          <Link href="/auth/login" className="text-zinc-400 text-xs hover:text-white transition-colors">Sign In</Link>
          <Link href="/auth/login" className="bg-yellow-400 text-black text-xs font-black px-3 py-1.5 rounded-full hover:bg-yellow-300 transition-all hover:scale-105">
            Continue with X
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
        {/* Logo hero */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-yellow-400/20 ring-2 ring-yellow-400/30">
            <Image src="/logo.jpeg" alt="Cruise Connect" fill sizes="96px" className="object-cover" priority />
          </div>
        </div>

        <Link href="https://x.com/i/communities/1897164314764579242" target="_blank"
          className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1 text-yellow-400 text-xs font-bold mb-6 hover:bg-yellow-400/20 transition-colors">
          🎂 1 Year · 3,000+ Members Strong
        </Link>

        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-[1.1]">
          <span className="text-yellow-400">Cruise.</span>{" "}
          <span className="text-white">Connect.</span>{" "}
          <span className="text-yellow-400">Grow.</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          The home of Naija culture online. Spaces, Games, Music, Movies, Jobs, and a community that{" "}
          <span className="text-white font-semibold">rides together.</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/login"
            className="flex items-center gap-2 bg-yellow-400 text-black font-black px-6 py-3 rounded-xl hover:bg-yellow-300 transition-all hover:scale-105 text-sm shadow-lg shadow-yellow-400/20 w-full sm:w-auto justify-center">
            Continue with X <ArrowRight size={16} />
          </Link>
          <Link href="/feed"
            className="flex items-center gap-2 border border-zinc-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-sm w-full sm:w-auto justify-center">
            Browse the Feed
          </Link>
        </div>
        <p className="text-zinc-500 text-xs text-center mt-4">
          By continuing you agree to the{' '}
          <Link href="/terms" className="underline hover:text-white transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center hover:border-yellow-400/30 transition-colors">
              <Icon size={16} className="text-yellow-400 mx-auto mb-1.5" />
              <div className="text-xl font-black text-white mb-0.5">{value}</div>
              <div className="text-zinc-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-14">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white mb-1.5">Everything in One Bus 🚌</h2>
          <p className="text-zinc-500 text-xs">8 features built for the culture</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc, href, color, bg, border }) => (
            <Link key={href} href={href}
              className={`group bg-zinc-900 border ${border} rounded-xl p-4 hover:border-opacity-60 transition-all hover:-translate-y-0.5`}>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={16} className={color} />
              </div>
              <h3 className="text-white font-bold text-xs mb-1">{label}</h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Community ID CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-14">
        <div className="bg-gradient-to-r from-yellow-400/15 via-yellow-400/8 to-transparent border border-yellow-400/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star size={14} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold text-xs">NEW</span>
            </div>
            <h3 className="text-white font-black text-lg mb-1">Get Your Community ID Card 〽️</h3>
            <p className="text-zinc-400 text-xs">Flex your membership on X, Instagram, WhatsApp & TikTok.</p>
          </div>
          <Link href="/community-id"
            className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-all hover:scale-105 text-xs whitespace-nowrap">
            Get Your ID <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Anniversary Banner */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🎂🚌💛</div>
          <h3 className="text-white font-black text-xl mb-2">1 Year of the Cruise</h3>
          <p className="text-zinc-400 text-xs mb-5 max-w-md mx-auto">One year. 3,000+ members. Infinite gists. The bus never stopped.</p>
          <Link href="https://x.com/i/communities/1897164314764579242" target="_blank"
            className="inline-flex items-center gap-1.5 border border-yellow-400/30 text-yellow-400 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-400/10 transition-colors text-xs">
            Join on X Community <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 rounded-md overflow-hidden">
              <Image src="/logo.jpeg" alt="CC Hub" fill sizes="20px" className="object-cover" />
            </div>
            <span className="text-zinc-500 text-xs">Cruise & Connect Hub〽️</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {[["Feed","/feed"],["Games","/games"],["Music","/music"],["Jobs","/jobs"],["ID Card","/community-id"]].map(([l,h]) => (
              <Link key={h} href={h} className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-zinc-700 text-xs text-center sm:text-right leading-relaxed">
            Created by <span className="text-zinc-500">FX〽️ (Augustine Fagbohun)</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">Community X Account: <span className="text-zinc-500">@TheCruiseCH</span></span>
          </p>
          <p className="text-zinc-700 text-xs">Created by <span className="text-zinc-500">FX〽️ (Augustine Fagbohun)</span> · <a href="mailto:CruiseConnectHub@gmail.com" className="text-yellow-400/50 hover:text-yellow-400 transition-colors">CruiseConnectHub@gmail.com</a></p>
        </div>
      </footer>
    </main>
  );
}
