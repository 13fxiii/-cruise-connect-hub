import Link from "next/link";
import { Zap, Mic, Gamepad2, Wallet, Megaphone, ArrowRight, Users, TrendingUp, Gift } from "lucide-react";

export default function HomePage() {
  const FEATURES = [
    { icon: Mic, label: "Live Spaces", desc: "Audio & video rooms powered by X", href: "/spaces", color: "text-red-400" },
    { icon: Gamepad2, label: "Games Hub", desc: "Tournaments with real Naira prizes", href: "/games", color: "text-green-400" },
    { icon: Wallet, label: "Wallet", desc: "Earn, gift & withdraw real money", href: "/wallet", color: "text-blue-400" },
    { icon: Megaphone, label: "PR / ADS", desc: "Promote your brand to the community", href: "/ads", color: "text-purple-400" },
  ];

  const STATS = [
    { icon: Users, label: "Community Members", value: "15K+" },
    { icon: TrendingUp, label: "Monthly Spaces", value: "200+" },
    { icon: Gift, label: "Prizes Distributed", value: "₦2M+" },
    { icon: Zap, label: "Games Played", value: "5,000+" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-5xl mx-auto px-4 h-16 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-black text-sm"><span className="text-white">Cruise & Connect</span><span className="text-yellow-400"> Hub〽️</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-zinc-400 text-sm hover:text-white transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="bg-yellow-400 text-black text-sm font-black px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">Join Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-bold mb-8">
          🚌 Where Community Meets Culture
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
          <span className="text-yellow-400">Cruise.</span>{" "}
          <span className="text-white">Connect.</span>{" "}
          <span className="text-yellow-400">Grow.</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
          One platform for live audio, gaming, community commerce, and real Naira earnings. Built for Africa, built for the world.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="bg-yellow-400 text-black font-black px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transition-colors flex items-center gap-2">
            Get Started Free <ArrowRight size={20} />
          </Link>
          <Link href="/spaces" className="border border-zinc-700 text-white font-bold px-8 py-4 rounded-full text-lg hover:border-yellow-400/50 hover:text-yellow-400 transition-colors">
            Explore Spaces
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
              <Icon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-zinc-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-black text-white text-center mb-3">Everything in one hub</h2>
        <p className="text-zinc-400 text-center mb-10">No more switching apps. Cruise, connect, and earn — all in one place.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc, href, color }) => (
            <Link key={href} href={href} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-yellow-400/30 transition-all group">
              <Icon className={`w-8 h-8 ${color} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="font-black text-white mb-1">{label}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-to-br from-yellow-400/20 to-zinc-900 border border-yellow-400/30 rounded-3xl p-10">
          <h2 className="text-3xl font-black text-white mb-3">Ready to board the bus? 🚌</h2>
          <p className="text-zinc-400 mb-6">Join 15,000+ members already cruising, connecting, and growing together.</p>
          <Link href="/auth/signup" className="bg-yellow-400 text-black font-black px-8 py-4 rounded-full text-lg hover:bg-yellow-300 transition-colors inline-flex items-center gap-2">
            Join Hub Free <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-zinc-500 mt-4">No credit card required · Free forever for members</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-600 text-sm">
        © 2026 Cruise & Connect Hub〽️ · Built by <span className="text-yellow-400">@13fxiii</span> · <span className="text-zinc-400">@CCHub_</span>
      </footer>
    </main>
  );
}
