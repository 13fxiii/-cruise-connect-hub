// @ts-nocheck
'use client';
import AppHeader from '@/components/layout/AppHeader';
import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Gift, Trophy, Wallet, Loader2, Copy, CheckCheck } from 'lucide-react';

import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cruise-connect-hub.vercel.app';
const appHost = new URL(appUrl).host;
const minWithdrawalNgn = Number(process.env.NEXT_PUBLIC_MIN_WITHDRAWAL || 100);

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
  const [payLoading, setPayLoading] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAccountName, setWithdrawAccountName] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawBankCode, setWithdrawBankCode] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [verifyingDeposit, setVerifyingDeposit] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch('/api/wallet')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [user]);

  // After Flutterwave redirect back, verify tx_ref and then poll until the wallet credit shows up.
  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const verify = params.get("verify");
    const txRef = params.get("tx_ref");
    if (!verify || !txRef) return;

    let cancelled = false;
    const run = async () => {
      setVerifyingDeposit(true);
      setVerifyMsg("Verifying payment...");
      try {
        const res = await fetch("/api/wallet/flutterwave?action=verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tx_ref: txRef }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Unable to verify payment");

        if (cancelled) return;
        setVerifyMsg("Payment verified. Waiting for wallet credit...");

        const started = Date.now();
        while (!cancelled && Date.now() - started < 120_000) {
          const r = await fetch("/api/wallet");
          const d = await r.json();
          const txns = d?.transactions || [];
          const credited = txns.some((t: any) => t?.reference === txRef && Number(t?.amount || 0) > 0);
          setData(d);
          if (credited) {
            setVerifyMsg("Wallet funded successfully.");
            break;
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      } catch (err: any) {
        if (!cancelled) setVerifyMsg(err?.message || "Payment verification failed.");
      } finally {
        if (!cancelled) {
          setVerifyingDeposit(false);
          // Clean URL so refresh doesn't re-verify.
          try { window.history.replaceState({}, "", "/wallet"); } catch {}
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!showWithdraw) return;
    let cancelled = false;
    fetch("/api/wallet/flutterwave?action=banks")
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        setBanks(d.banks || []);
      })
      .catch(() => {
        if (cancelled) return;
        setWithdrawError("Unable to load bank list. Try again.");
      });
    return () => { cancelled = true; };
  }, [showWithdraw]);

  useEffect(() => {
    if (!showWithdraw) return;
    if (!withdrawBankCode || withdrawAccountNumber.length < 10) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setResolvingAccount(true);
      try {
        const qs = new URLSearchParams({
          action: "resolve",
          account_number: withdrawAccountNumber,
          account_bank: withdrawBankCode,
        });
        const res = await fetch(`/api/wallet/flutterwave?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Unable to resolve account");
        if (!cancelled && data?.account_name) {
          setWithdrawAccountName(data.account_name);
          setWithdrawError("");
        }
      } catch (err: any) {
        if (!cancelled) {
          setWithdrawError(err?.message || "Unable to resolve account");
        }
      } finally {
        if (!cancelled) setResolvingAccount(false);
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [showWithdraw, withdrawBankCode, withdrawAccountNumber]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <AppHeader title="Wallet" back />
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );

  const p    = data?.profile || {};
  const txns = (data?.transactions || []).filter((t: any) =>
    tab === 'all' ? true : tab === 'in' ? t.amount > 0 : t.amount < 0
  );

  const copyRef = () => {
    navigator.clipboard.writeText(`${appUrl}?ref=${p.referral_code}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const startTopup = async (amount: number) => {
    if (payLoading) return;
    if (!user?.email) {
      setDepositError("No email found for your account.");
      return;
    }
    setPayLoading(true);
    try {
      const res = await fetch("/api/wallet/flutterwave?action=initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount,
          currency: "NGN",
          metadata: { user_id: user.id, purpose: "wallet_topup" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Payment init failed");
      window.location.href = data.payment_link || data.authorization_url;
    } catch (err: any) {
      setDepositError(err?.message || "Unable to start payment. Try again.");
      setPayLoading(false);
    }
  };

  const openDeposit = () => {
    setDepositAmount("");
    setDepositError("");
    setShowDeposit(true);
  };

  const submitDeposit = async () => {
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDepositError("Enter a valid amount in NGN.");
      return;
    }
    setDepositError("");
    await startTopup(amount);
  };

  const openWithdraw = () => {
    setWithdrawAmount("");
    setWithdrawAccountName("");
    setWithdrawAccountNumber("");
    setWithdrawBankCode("");
    setWithdrawError("");
    setShowWithdraw(true);
  };

  const submitWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawError("Enter a valid amount in NGN.");
      return;
    }
    if (amount < minWithdrawalNgn) {
      setWithdrawError(`Minimum withdrawal is ₦${minWithdrawalNgn.toLocaleString()}.`);
      return;
    }
    if (!withdrawBankCode || !withdrawAccountNumber) {
      setWithdrawError("Bank and account number are required.");
      return;
    }
    setWithdrawLoading(true);
    setWithdrawError("");
    try {
      const res = await fetch("/api/wallet/flutterwave?action=withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: withdrawAccountNumber,
          bank_code: withdrawBankCode,
          account_name: withdrawAccountName || "CC Hub User",
          amount,
          user_id: user?.id,
          currency: "NGN",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Withdrawal failed");
      setShowWithdraw(false);
      // Refresh wallet + transactions after submit.
      fetch('/api/wallet').then(r => r.json()).then(d => setData(d)).catch(() => {});
    } catch (err: any) {
      setWithdrawError(err?.message || "Unable to withdraw. Try again.");
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      
      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Wallet className="text-yellow-400" /> Wallet
        </h1>

        {(verifyingDeposit || verifyMsg) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm font-bold text-white">
              {verifyingDeposit ? "Processing your deposit..." : "Deposit status"}
            </p>
            {verifyMsg && <p className="text-xs text-zinc-400 mt-1">{verifyMsg}</p>}
          </div>
        )}

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
          <button
            onClick={openDeposit}
            disabled={payLoading}
            className="bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <ArrowDownLeft className="w-4 h-4" /> {payLoading ? "Starting..." : "Add Money"}
          </button>
          <button
            onClick={openWithdraw}
            className="bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm border border-zinc-700"
          >
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
        </div>

        {/* Referral */}
        {p.referral_code && (
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-4">
            <p className="text-white font-bold text-sm mb-2">🤝 Referral — ₦1,000 per invite</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-3 border border-zinc-700">
              <code className="text-yellow-400 text-xs flex-1 truncate">
                {appHost}?ref={p.referral_code}
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

      {showDeposit && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-[#0b0b0b] border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-black text-lg">Add Money</h3>
              <button
                onClick={() => setShowDeposit(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <label className="block text-zinc-400 text-xs mb-1">Amount (NGN)</label>
            <input
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g. 5000"
              inputMode="numeric"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {[5000, 10000, 20000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(String(amt))}
                  className="px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-white hover:border-yellow-400"
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {depositError && (
              <p className="text-red-400 text-xs mt-2">{depositError}</p>
            )}

            <button
              onClick={submitDeposit}
              disabled={payLoading}
              className="mt-4 w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {payLoading ? "Starting..." : "Continue to Payment"}
            </button>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-[#0b0b0b] border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-black text-lg">Withdraw</h3>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <label className="block text-zinc-400 text-xs mb-1">Bank</label>
            <select
              value={withdrawBankCode}
              onChange={(e) => setWithdrawBankCode(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400"
            >
              <option value="">Select bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>

            <label className="block text-zinc-400 text-xs mb-1 mt-3">Account Number</label>
            <input
              value={withdrawAccountNumber}
              onChange={(e) => setWithdrawAccountNumber(e.target.value)}
              placeholder="0123456789"
              inputMode="numeric"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400"
            />

            <label className="block text-zinc-400 text-xs mb-1 mt-3">Account Name (optional)</label>
            <input
              value={withdrawAccountName}
              onChange={(e) => setWithdrawAccountName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400"
            />
            {resolvingAccount && (
              <p className="text-zinc-500 text-[11px] mt-1">Resolving account name...</p>
            )}

            <label className="block text-zinc-400 text-xs mb-1 mt-3">Amount (NGN)</label>
            <input
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 5000"
              inputMode="numeric"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400"
            />

            {withdrawError && (
              <p className="text-red-400 text-xs mt-2">{withdrawError}</p>
            )}

            <button
              onClick={submitWithdraw}
              disabled={withdrawLoading}
              className="mt-4 w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {withdrawLoading ? "Submitting..." : "Submit Withdrawal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
