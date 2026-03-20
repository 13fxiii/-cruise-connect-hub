// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Gift, Trophy, Wallet, Loader2, Copy, CheckCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';

function fmt(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG');
}

const TX_ICONS: Record<string, any> = {
  gift_received: { icon: Gift,          color: 'text-pink-400' },
  gift_sent:     { icon: Gift,          color: 'text-zinc-400' },
  tournament_win:{ icon: Trophy,        color: 'text-yellow-400' },
  referral:      { icon: '🤝',          color: 'text-green-400' },
  deposit:       { icon: ArrowDownLeft, color: 'text-green-400' },
  withdrawal:    { icon: ArrowUpRight,  color: 'text-red-400' },
};

export default function WalletPage() {
  const { user } = useAuth();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [tab, setTab]         = useState<'all'|'in'|'out'>('all');

  useEffect(() => {
    if (!user) return;
    fetch('/api/wallet').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );

  const p    = data?.profile || {};
  const txns = (data?.transactions || []).filter((t: any) =>
    tab === 'all' ? true : tab === 'in' ? t.amount > 0 : t.amount < 0
  );

  const copyRef = () => {
    navigator.clipboard.writeText(`https://cruise-connect-hub.vercel.app?ref=${p.referral_code}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Wallet className="text-yellow-400" /> Wallet
        </h1>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Balance',      value: fmt(p.wallet_balance || 0),  color: 'text-yellow-400' },
            { label: 'Total Earned', value: fmt(p.total_earned   || 0),  color: 'text-green-400'  },
            { label: 'Points',       value: (p.points || 0).toLocaleString(), color: 'text-blue-400' },
          ].map(c => (
            <div key={c.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <div className={`text-lg font-black ${c.color}`}>{c.value}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Fund / Withdraw */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 text-sm">
            <ArrowDownLeft className="w-4 h-4" /> Add Money
          </button>
          <button className="bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm border border-zinc-700">
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
        </div>

        {/* Referral */}
        {p.referral_code && (
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-4">
            <p className="text-white font-bold text-sm mb-2">🤝 Referral — ₦1,000 per invite</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-3 border border-zinc-700">
              <code className="text-yellow-400 text-xs flex-1 truncate">
                cruise-connect-hub.vercel.app?ref={p.referral_code}
              </code>
              <button onClick={copyRef} className="text-zinc-400 hover:text-white text-xs flex items-center gap-1">
                {copied ? <><CheckCheck className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold">Transactions</h2>
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {(['all','in','out'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${tab === t ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {txns.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <p className="text-3xl mb-2">💸</p>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
              {txns.map((t: any) => {
                const cfg  = TX_ICONS[t.type] || { icon: Wallet, color: 'text-zinc-400' };
                const isIn = t.amount > 0;
                return (
                  <div key={t.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      {typeof cfg.icon === 'string'
                        ? <span>{cfg.icon}</span>
                        : <cfg.icon className={`w-4 h-4 ${cfg.color}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.description || t.type}</p>
                      <p className="text-zinc-500 text-xs">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-black text-sm ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                      {isIn ? '+' : ''}{fmt(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
