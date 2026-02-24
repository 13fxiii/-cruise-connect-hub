import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bus, Zap, Mic, Gamepad2, Wallet, Megaphone, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/feed");

  return (
    <main className="min-h-screen bg-cch-black overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cch-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cch-gold flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <span className="font-bold text-sm">
            <span className="text-white">Cruise & Connect</span>
            <span className="text-cch-gold"> Hub〽️</span>
          </span>
        </div>
        <Link href="/auth/signin" className="btn-outline text-sm">Sign In</Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cch-gold/10 border border-cch-gold/30 rounded-full px-4 py-1.5 text-cch-gold text-sm font-medium mb-8">
          <Bus size={14} /> Where Community Meets Culture
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="gradient-text">Cruise.</span>{" "}
          <span className="text-white">Connect.</span>{" "}
          <span className="gradient-text">Grow.</span>
        </h1>

        <p className="text-cch-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The African community where culture lives — live spaces, games, music promos, movie nights & giveaways. No dull moment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signin" className="btn-gold text-base px-8 py-3 flex items-center gap-2">
            Join the Cruise <ArrowRight size={16} />
          </Link>
          <Link href="/feed" className="btn-outline text-base px-8 py-3">
            View Feed
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Mic, label: "Live Spaces", desc: "Audio rooms, AMA sessions" },
            { icon: Gamepad2, label: "Games", desc: "Trivia, ludo, tournaments" },
            { icon: Wallet, label: "Earn Points", desc: "Win rewards daily" },
            { icon: Megaphone, label: "PR/ADS", desc: "Promote your brand" },
          ].map((f) => (
            <div key={f.label} className="glass-card p-5 hover:border-cch-gold/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-cch-gold/10 flex items-center justify-center mb-3 group-hover:bg-cch-gold/20 transition-colors">
                <f.icon size={18} className="text-cch-gold" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{f.label}</h3>
              <p className="text-cch-muted text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-t border-cch-border py-12">
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { val: "15K+", label: "Community Members" },
            { val: "100%", label: "Africa-First" },
            { val: "∞", label: "No Dull Moments" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-cch-gold mb-1">{s.val}</div>
              <div className="text-cch-muted text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
