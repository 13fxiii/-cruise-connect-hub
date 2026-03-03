"use client";
import { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Gift, Trophy, TrendingUp, Copy, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const MOCK_WALLET = {
  balance: 7500,
  total_earned: 28400,
  total_spent: 20900,
};

const MOCK_TXS = [
  { id: "1", type: "gift_received", amount: 2000, description: "Gift from @connectplug in Afrobeats Space", created_at: "2h ago", status: "completed" },
  { id: "2", type: "tournament_win", amount: 5000, description: "Won Trivia Tuesday 🏆", created_at: "Yesterday", status: "completed" },
  { id: "3", type: "gift_sent", amount: -500, description: "Gift sent to @theconnector", created_at: "Yesterday", status: "completed" },
  { id: "4", type: "referral", amount: 1000, description: "Referral bonus — @naijagamer joined", created_at: "3 days ago", status: "completed" },
  { id: "5", type: "withdrawal", amount: -10000, description: "Withdrawal to bank •••• 4521", created_at: "1 week ago", status: "completed" },
  { id: "6", type: "deposit", amount: 2000, description: "Wallet top-up via Paystack", created_at: "1 week ago", status: "completed" },
  { id: "7", type: "ad_payment", amount: -20000, description: "1-Day AD campaign — ThrillSeekaEnt", created_at: "2 weeks ago", status: "completed" },
];

const TX_META: Record<string, { icon: any; color: string; bg: string }> = {
  gift_received: { icon: Gift, color: "text-green-400", bg: "bg-green-400/10" },
  tournament_win: { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  gift_sent: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-400/10" },
  referral: { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
  withdrawal: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-400/10" },
  deposit: { icon: ArrowDownLeft, color: "text-green-400", bg: "bg-green-400/10" },
  ad_payment: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-400/10" },
};

export default function WalletPage() {
  const [tab, setTab] = useState<"overview"|"transactions"|"withdraw">("overview");
  const [copied, setCopied] = useState(false);

  const refCode = "CCH-13FXIII";
  const copy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-yellow-400/20 via-zinc-900 to-zinc-900 border border-yellow-400/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <Wallet className="w-4 h-4" /> Available Balance
          </div>
          <div className="text-5xl font-black text-white mb-1">
            ₦{MOCK_WALLET.balance.toLocaleString()}
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <div className="text-zinc-400">Total Earned</div>
              <div className="font-bold text-green-400">+₦{MOCK_WALLET.total_earned.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-zinc-400">Total Spent</div>
              <div className="font-bold text-red-400">-₦{MOCK_WALLET.total_spent.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setTab("withdraw")}
              className="flex-1 bg-yellow-400 text-black font-bold py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors"
            >
              Withdraw
            </button>
            <button className="flex-1 bg-zinc-800 text-white font-bold py-2.5 rounded-full text-sm hover:bg-zinc-700 transition-colors">
              Top Up
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["overview","transactions","withdraw"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"
              }`}>
              {t === "overview" ? "📊 Overview" : t === "transactions" ? "📋 History" : "💸 Withdraw"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-4">
            {/* Earn ways */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-4">Ways to Earn</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🎁", label: "Receive Gifts", sub: "Get gifted in live spaces" },
                  { icon: "🏆", label: "Win Games", sub: "Compete in tournaments" },
                  { icon: "🔗", label: "Refer Friends", sub: "₦1,000 per referral" },
                  { icon: "📣", label: "Create Content", sub: "Community rewards" },
                ].map(w => (
                  <div key={w.label} className="bg-zinc-800 rounded-xl p-3">
                    <div className="text-2xl mb-2">{w.icon}</div>
                    <div className="text-sm font-bold text-white">{w.label}</div>
                    <div className="text-xs text-zinc-400">{w.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-1">Your Referral Code</h3>
              <p className="text-xs text-zinc-400 mb-3">Share and earn ₦1,000 for every friend who joins</p>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3">
                <code className="flex-1 text-yellow-400 font-bold tracking-widest">{refCode}</code>
                <button onClick={copy} className="text-zinc-400 hover:text-white transition-colors">
                  {copied ? <span className="text-green-400 text-xs font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "transactions" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {MOCK_TXS.map((tx, i) => {
              const meta = TX_META[tx.type] || TX_META.deposit;
              const Icon = meta.icon;
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className={`flex items-center gap-4 px-5 py-4 ${i < MOCK_TXS.length-1 ? "border-b border-zinc-800" : ""} hover:bg-zinc-800/30 transition-colors`}>
                  <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{tx.description}</div>
                    <div className="text-xs text-zinc-500">{tx.created_at}</div>
                  </div>
                  <div className={`font-black text-sm ${isCredit ? "text-green-400" : "text-red-400"}`}>
                    {isCredit ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "withdraw" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Withdraw Funds</h3>
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-sm text-yellow-300">
              Minimum withdrawal: ₦2,000 · Processed within 24hrs via bank transfer
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Bank Name</label>
              <input type="text" placeholder="e.g. GTBank" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Account Number</label>
              <input type="text" placeholder="0123456789" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Amount (₦)</label>
              <input type="number" placeholder="Minimum 2,000" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-500" />
            </div>
            <button className="w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 transition-colors">
              Request Withdrawal
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
