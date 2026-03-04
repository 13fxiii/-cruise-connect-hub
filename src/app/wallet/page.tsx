"use client";
import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Gift, Trophy, TrendingUp, Copy, ExternalLink, Plus, Minus, AlertCircle, CheckCircle, X, Loader2, Building, CreditCard, Phone } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const BALANCE = 7500;
const TOTAL_EARNED = 28400;
const TOTAL_SPENT = 20900;
const REF_CODE = "CCH-13FXIII";

const TXS = [
  { id:"1", type:"gift_received", amount:2000, description:"Gift from @connectplug in Afrobeats Space", created_at:"2h ago", status:"completed" },
  { id:"2", type:"tournament_win", amount:5000, description:"Won Trivia Tuesday 🏆", created_at:"Yesterday", status:"completed" },
  { id:"3", type:"gift_sent", amount:-500, description:"Gift sent to @theconnector", created_at:"Yesterday", status:"completed" },
  { id:"4", type:"referral", amount:1000, description:"Referral bonus — @naijagamer joined", created_at:"3 days ago", status:"completed" },
  { id:"5", type:"withdrawal", amount:-10000, description:"Withdrawal to bank •••• 4521", created_at:"1 week ago", status:"completed" },
  { id:"6", type:"deposit", amount:2000, description:"Wallet top-up via Paystack", created_at:"1 week ago", status:"completed" },
  { id:"7", type:"ad_payment", amount:-20000, description:"1-Day AD campaign — ThrillSeekaEnt", created_at:"2 weeks ago", status:"completed" },
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

const NIGERIAN_BANKS = [
  { name:"Access Bank", code:"044" }, { name:"GTBank", code:"058" },
  { name:"First Bank", code:"011" }, { name:"Zenith Bank", code:"057" },
  { name:"UBA", code:"033" }, { name:"Opay", code:"999992" },
  { name:"Kuda Bank", code:"090267" }, { name:"PalmPay", code:"999991" },
  { name:"Moniepoint", code:"090405" }, { name:"Wema Bank", code:"035" },
  { name:"Stanbic IBTC", code:"221" }, { name:"FCMB", code:"214" },
  { name:"Union Bank", code:"032" }, { name:"Fidelity Bank", code:"070" },
  { name:"Ecobank", code:"050" }, { name:"Polaris Bank", code:"076" },
];

const TOP_UP_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

type Modal = "topup"|"withdraw"|"send"|null;

export default function WalletPage() {
  const [tab, setTab] = useState<"overview"|"transactions"|"earn">("overview");
  const [modal, setModal] = useState<Modal>(null);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(BALANCE);
  const [txs, setTxs] = useState(TXS);

  // Withdraw form
  const [wBank, setWBank] = useState("");
  const [wAcct, setWAcct] = useState("");
  const [wName, setWName] = useState("");
  const [wAmount, setWAmount] = useState("");
  const [wLoading, setWLoading] = useState(false);
  const [wSuccess, setWSuccess] = useState(false);
  const [wError, setWError] = useState("");

  // Top up form
  const [topupAmount, setTopupAmount] = useState(2000);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupEmail, setTopupEmail] = useState("");

  // Send gift form
  const [sendHandle, setSendHandle] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const copy = () => { navigator.clipboard.writeText(REF_CODE); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWError("");
    const amt = parseInt(wAmount);
    if (!wBank || !wAcct || !wName || !amt) { setWError("All fields required"); return; }
    if (amt < 2000) { setWError("Minimum withdrawal is ₦2,000"); return; }
    if (amt > balance) { setWError("Insufficient balance"); return; }
    setWLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setBalance(b => b - amt);
    setTxs(t => [{ id: String(Date.now()), type:"withdrawal", amount:-amt, description:`Withdrawal to ${wBank} •••• ${wAcct.slice(-4)}`, created_at:"Just now", status:"completed" }, ...t]);
    setWLoading(false); setWSuccess(true);
    setTimeout(() => { setModal(null); setWSuccess(false); setWBank(""); setWAcct(""); setWName(""); setWAmount(""); }, 2500);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupEmail) { return; }
    setTopupLoading(true);
    // Real implementation: call /api/wallet/paystack?action=initialize and redirect
    // For now: simulate successful top-up
    await new Promise(r => setTimeout(r, 1500));
    setBalance(b => b + topupAmount);
    setTxs(t => [{ id: String(Date.now()), type:"deposit", amount:topupAmount, description:`Wallet top-up via Paystack`, created_at:"Just now", status:"completed" }, ...t]);
    setTopupLoading(false); setModal(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(sendAmount);
    if (!sendHandle || !amt || amt < 100) return;
    if (amt > balance) { return; }
    setSendLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setBalance(b => b - amt);
    setTxs(t => [{ id:String(Date.now()), type:"gift_sent", amount:-amt, description:`Gift sent to ${sendHandle}${sendNote ? ` — "${sendNote}"` : ""}`, created_at:"Just now", status:"completed" }, ...t]);
    setSendLoading(false); setSendSuccess(true);
    setTimeout(() => { setModal(null); setSendSuccess(false); setSendHandle(""); setSendAmount(""); setSendNote(""); }, 2000);
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
            ₦{balance.toLocaleString()}
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div><div className="text-zinc-400">Total Earned</div><div className="font-bold text-green-400">+₦{TOTAL_EARNED.toLocaleString()}</div></div>
            <div><div className="text-zinc-400">Total Spent</div><div className="font-bold text-red-400">-₦{TOTAL_SPENT.toLocaleString()}</div></div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setModal("topup")} className="flex-1 bg-yellow-400 text-black font-bold py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Top Up
            </button>
            <button onClick={() => setModal("withdraw")} className="flex-1 bg-zinc-800 text-white font-bold py-2.5 rounded-full text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
              <Minus className="w-4 h-4" /> Withdraw
            </button>
            <button onClick={() => setModal("send")} className="flex-1 bg-zinc-800 text-white font-bold py-2.5 rounded-full text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" /> Send Gift
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["overview","transactions","earn"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab===t?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>
              {t==="overview"?"📊 Overview":t==="transactions"?"📋 History":"💰 Earn"}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[{icon:"🎁",l:"Receive Gifts",s:"Get gifted in live spaces"},{icon:"🏆",l:"Win Games",s:"Compete in tournaments"},{icon:"🔗",l:"Refer Friends",s:"₦1,000 per referral"},{icon:"📣",l:"Create Content",s:"Community rewards"}].map(w=>(
                <div key={w.l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-2xl mb-2">{w.icon}</div>
                  <div className="text-sm font-bold text-white">{w.l}</div>
                  <div className="text-xs text-zinc-400">{w.s}</div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-1">Your Referral Code</h3>
              <p className="text-xs text-zinc-400 mb-3">Share and earn ₦1,000 for every friend who joins C&C Hub</p>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3">
                <code className="flex-1 text-yellow-400 font-bold tracking-widest text-lg">{REF_CODE}</code>
                <button onClick={copy} className="text-zinc-400 hover:text-white transition-colors">
                  {copied ? <span className="text-green-400 text-xs font-bold">Copied!</span> : <Copy className="w-4 h-4"/>}
                </button>
              </div>
              <button className="mt-3 w-full bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-full text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4"/> Share Referral Link
              </button>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab==="transactions" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {txs.map((tx,i)=>{
              const meta = TX_META[tx.type] || TX_META.deposit;
              const Icon = meta.icon;
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className={`flex items-center gap-4 px-5 py-4 ${i<txs.length-1?"border-b border-zinc-800":""} hover:bg-zinc-800/30 transition-colors`}>
                  <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{tx.description}</div>
                    <div className="text-xs text-zinc-500">{tx.created_at}</div>
                  </div>
                  <div className={`font-black text-sm flex-shrink-0 ${isCredit?"text-green-400":"text-red-400"}`}>
                    {isCredit?"+":""}₦{Math.abs(tx.amount).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EARN */}
        {tab==="earn" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-2xl p-5">
              <h3 className="font-black text-white text-lg mb-1">₦1,000 Per Referral</h3>
              <p className="text-zinc-400 text-sm mb-4">Every friend who joins C&C Hub using your code earns you ₦1,000 directly to your wallet.</p>
              <div className="flex items-center gap-3 bg-zinc-900 rounded-xl px-4 py-3 mb-3">
                <code className="flex-1 text-yellow-400 font-bold tracking-widest">{REF_CODE}</code>
                <button onClick={copy} className="text-zinc-400 hover:text-white"><Copy className="w-4 h-4"/></button>
              </div>
              <button className="w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 transition-colors">Share Now</button>
            </div>
            {[
              { emoji:"🎮", title:"Win Game Tournaments", desc:"Top 3 in weekly Trivia & Ludo tournaments earn cash prizes. New tournaments every week.", cta:"Play Now", href:"/games" },
              { emoji:"🎵", title:"Submit Your Track", desc:"Artists on Music Hub earn community points when their track gets plays and likes.", cta:"Submit Track", href:"/music" },
              { emoji:"📢", title:"Promote on C&C Hub", desc:"Earn commission for referring businesses to advertise on the platform.", cta:"View Ad Rates", href:"/ads" },
            ].map(e=>(
              <div key={e.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{e.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{e.title}</h3>
                  <p className="text-sm text-zinc-400 mb-3">{e.desc}</p>
                  <a href={e.href} className="text-yellow-400 text-sm font-bold hover:underline">{e.cta} →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md">

            {/* TOP UP */}
            {modal==="topup" && (
              <form onSubmit={handleTopup} className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white">Top Up Wallet</h2>
                  <button type="button" onClick={()=>setModal(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <p className="text-sm text-zinc-400 mb-4">Add funds via card, bank transfer, or USSD through Paystack</p>
                <div className="mb-4">
                  <label className="text-xs text-zinc-400 mb-2 block font-medium">Your Email</label>
                  <input type="email" required value={topupEmail} onChange={e=>setTopupEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-zinc-400 mb-2 block font-medium">Select Amount (₦)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {TOP_UP_AMOUNTS.map(a=>(
                      <button type="button" key={a} onClick={()=>setTopupAmount(a)}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${topupAmount===a?"bg-yellow-400 text-black border-yellow-400":"bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-yellow-400/50"}`}>
                        ₦{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={topupAmount} onChange={e=>setTopupAmount(parseInt(e.target.value)||0)} min="500"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 mt-1"/>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 mb-4 text-xs text-zinc-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-yellow-400 flex-shrink-0"/>
                  <span>Supports: Card · Bank Transfer · USSD · Opay · PalmPay</span>
                </div>
                <button type="submit" disabled={topupLoading||!topupEmail||topupAmount<500} className="w-full bg-yellow-400 text-black font-black py-3.5 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {topupLoading?<><Loader2 className="w-5 h-5 animate-spin"/> Processing...</>:`Pay ₦${topupAmount.toLocaleString()}`}
                </button>
              </form>
            )}

            {/* WITHDRAW */}
            {modal==="withdraw" && (
              <form onSubmit={handleWithdraw} className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white">Withdraw Funds</h2>
                  <button type="button" onClick={()=>setModal(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                {wSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3"/>
                    <h3 className="text-xl font-black text-white mb-1">Withdrawal Submitted!</h3>
                    <p className="text-zinc-400 text-sm">Your funds will arrive within 24hrs</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-sm text-yellow-300 mb-4">
                      Min ₦2,000 · Available: ₦{balance.toLocaleString()} · Processed within 24hrs
                    </div>
                    {wError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{wError}</div>}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Bank</label>
                        <select value={wBank} onChange={e=>setWBank(e.target.value)} required
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500">
                          <option value="">Select your bank...</option>
                          {NIGERIAN_BANKS.map(b=><option key={b.code} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Account Number</label>
                        <input type="text" value={wAcct} onChange={e=>setWAcct(e.target.value.replace(/\D/g,"").slice(0,10))} required placeholder="0123456789" maxLength={10}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Account Name</label>
                        <input type="text" value={wName} onChange={e=>setWName(e.target.value)} required placeholder="As on your bank account"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Amount (₦)</label>
                        <input type="number" value={wAmount} onChange={e=>setWAmount(e.target.value)} required min="2000" max={balance}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500"/>
                      </div>
                    </div>
                    <button type="submit" disabled={wLoading} className="w-full mt-4 bg-yellow-400 text-black font-black py-3.5 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {wLoading?<><Loader2 className="w-5 h-5 animate-spin"/>Processing...</>:"Withdraw Funds"}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* SEND GIFT */}
            {modal==="send" && (
              <form onSubmit={handleSend} className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white">Send Gift 🎁</h2>
                  <button type="button" onClick={()=>setModal(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                {sendSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🎁</div>
                    <h3 className="text-xl font-black text-white mb-1">Gift Sent!</h3>
                    <p className="text-zinc-400 text-sm">Your gift was delivered successfully</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Recipient X Handle</label>
                        <input type="text" value={sendHandle} onChange={e=>setSendHandle(e.target.value)} required placeholder="@username"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Amount (₦)</label>
                        <div className="flex gap-2 mb-2">
                          {[100,200,500,1000].map(a=>(
                            <button type="button" key={a} onClick={()=>setSendAmount(String(a))}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${sendAmount===String(a)?"bg-yellow-400 text-black border-yellow-400":"bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-yellow-400/50"}`}>
                              ₦{a}
                            </button>
                          ))}
                        </div>
                        <input type="number" value={sendAmount} onChange={e=>setSendAmount(e.target.value)} required min="100" max={balance} placeholder="Custom amount"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Note (optional)</label>
                        <input type="text" value={sendNote} onChange={e=>setSendNote(e.target.value)} placeholder="Add a message..." maxLength={100}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-600"/>
                      </div>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-3 my-3 text-xs text-zinc-400">
                      Available: ₦{balance.toLocaleString()}
                    </div>
                    <button type="submit" disabled={sendLoading||!sendHandle||!sendAmount} className="w-full bg-yellow-400 text-black font-black py-3.5 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {sendLoading?<><Loader2 className="w-5 h-5 animate-spin"/>Sending...</>:"Send Gift 🎁"}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
