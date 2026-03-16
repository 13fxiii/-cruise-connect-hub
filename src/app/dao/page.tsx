"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { Vote, Plus, Clock, CheckCircle, XCircle, Users, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_CONFIG: Record<string, { label:string; color:string; bg:string }> = {
  active:      { label:"Voting Open",   color:"text-green-400",  bg:"bg-green-400/10 border-green-400/20" },
  passed:      { label:"Passed ✅",     color:"text-blue-400",   bg:"bg-blue-400/10 border-blue-400/20" },
  rejected:    { label:"Rejected",      color:"text-red-400",    bg:"bg-red-400/10 border-red-400/20" },
  implemented: { label:"Implemented 🚀",color:"text-yellow-400", bg:"bg-yellow-400/10 border-yellow-400/20" },
  draft:       { label:"Draft",         color:"text-zinc-400",   bg:"bg-zinc-800/50 border-zinc-700" },
};

const CATEGORY_EMOJI: Record<string, string> = {
  rules:"⚖️", features:"✨", events:"🎉", moderation:"🛡️",
  treasury:"💰", partnerships:"🤝", general:"💬",
};

const DEMO_PROPOSALS = [
  { id:"1", title:"Add Yoruba language support to the Hub", description:"Proposal to add Yoruba as a supported language across the app UI, game prompts, and daily themes. This would make CC Hub more accessible to our growing Yoruba-speaking member base.", category:"features", status:"active", votes_for:47, votes_against:8, votes_abstain:3, voting_ends_at: new Date(Date.now() + 5 * 86400000).toISOString(), profiles:{display_name:"CommunityVoice", username:"communityvoice"} },
  { id:"2", title:"Weekly ₦50,000 Community Prize Pool from Platform Fees", description:"Proposal to allocate 10% of weekly platform fees (gift commissions + tournament fees) into a community prize pool, distributed to top contributors each Sunday.", category:"treasury", status:"active", votes_for:89, votes_against:12, votes_abstain:5, voting_ends_at: new Date(Date.now() + 3 * 86400000).toISOString(), profiles:{display_name:"TreasuryDAO", username:"treasurydao"} },
  { id:"3", title:"Ban spam posting — implement 5-post daily limit", description:"Some members are flooding the feed with low-quality posts. This proposal enforces a 5-post daily limit per user to improve feed quality.", category:"rules", status:"passed", votes_for:134, votes_against:22, votes_abstain:10, voting_ends_at: new Date(Date.now() - 2 * 86400000).toISOString(), profiles:{display_name:"ModTeam", username:"modteam"} },
  { id:"4", title:"Monthly Community Town Hall Space", description:"Hold a monthly live space town hall where all members can raise issues, celebrate wins, and vote on upcoming activities. Hosted by @TheCruiseCH.", category:"events", status:"implemented", votes_for:201, votes_against:5, votes_abstain:12, voting_ends_at: new Date(Date.now() - 10 * 86400000).toISOString(), profiles:{display_name:"SpacesTeam", username:"spacesteam"} },
];

function timeLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Voting ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
}

export default function DAOPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState(DEMO_PROPOSALS);
  const [filter, setFilter]       = useState("all");
  const [expanded, setExpanded]   = useState<string|null>(null);
  const [voting, setVoting]       = useState<string|null>(null);
  const [myVotes, setMyVotes]     = useState<Record<string,string>>({});
  const [showNew, setShowNew]     = useState(false);
  const [newForm, setNewForm]     = useState({ title:"", description:"", category:"general" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/dao?status=all")
      .then(r => r.json())
      .then(d => { if (d.proposals?.length > 0) setProposals(d.proposals); });
  }, []);

  const castVote = async (proposalId: string, vote: string) => {
    if (!user || myVotes[proposalId]) return;
    setVoting(proposalId);
    const res = await fetch("/api/dao/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_id: proposalId, vote }),
    });
    const data = await res.json();
    setVoting(null);
    if (res.ok) {
      setMyVotes(v => ({ ...v, [proposalId]: vote }));
      setProposals(ps => ps.map(p => p.id === proposalId
        ? { ...p, votes_for: data.votes_for, votes_against: data.votes_against }
        : p
      ));
    }
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title || !newForm.description) return;
    setSubmitting(true);
    const res = await fetch("/api/dao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setProposals(ps => [data.proposal, ...ps]);
      setShowNew(false);
      setNewForm({ title:"", description:"", category:"general" });
    } else {
      alert(data.error || "Failed to submit proposal");
    }
  };

  const filtered = proposals.filter(p =>
    filter === "all" ? true : p.status === filter
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Vote className="w-6 h-6 text-yellow-400" /> Community DAO
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Vote on proposals that shape CC Hub's future 🚌</p>
          </div>
          {user && (
            <button onClick={() => setShowNew(!showNew)}
              className="bg-yellow-400 text-black font-black px-3 py-2 rounded-xl text-sm hover:bg-yellow-300 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Propose
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ["🗳️","Active Votes", proposals.filter(p => p.status === "active").length],
            ["✅","Proposals Passed", proposals.filter(p => p.status === "passed" || p.status === "implemented").length],
            ["👥","Votes Cast", proposals.reduce((a, p) => a + p.votes_for + p.votes_against + p.votes_abstain, 0)],
          ].map(([icon, label, val]) => (
            <div key={String(label)} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-2xl">{icon}</div>
              <div className="text-white font-black text-lg">{val}</div>
              <div className="text-zinc-600 text-[10px]">{label}</div>
            </div>
          ))}
        </div>

        {/* New Proposal Form */}
        {showNew && (
          <form onSubmit={submitProposal} className="bg-zinc-950 border border-yellow-400/20 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-black">Submit a Proposal</h3>
            <p className="text-zinc-500 text-xs">Requires 100 community points. Voting runs for 7 days. Passes at 60% approval.</p>
            <input value={newForm.title} onChange={e => setNewForm(p => ({...p, title: e.target.value}))}
              placeholder="Proposal title (be specific)" required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
            <textarea value={newForm.description} onChange={e => setNewForm(p => ({...p, description: e.target.value}))}
              placeholder="Describe your proposal in detail — what problem does it solve? How would it work?" rows={4} required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none" />
            <select value={newForm.category} onChange={e => setNewForm(p => ({...p, category: e.target.value}))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 capitalize">
              {["rules","features","events","moderation","treasury","partnerships","general"].map(c => (
                <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="flex-1 bg-yellow-400 text-black font-black py-2.5 rounded-xl hover:bg-yellow-300 disabled:opacity-40">
                {submitting ? "Submitting..." : "Submit Proposal"}
              </button>
              <button type="button" onClick={() => setShowNew(false)}
                className="px-4 bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl hover:bg-zinc-700">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {[["all","All"],["active","Active"],["passed","Passed"],["implemented","Implemented"],["rejected","Rejected"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === val ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Proposals */}
        <div className="space-y-3">
          {filtered.map(proposal => {
            const total = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;
            const forPct = total > 0 ? Math.round((proposal.votes_for / total) * 100) : 0;
            const againstPct = total > 0 ? Math.round((proposal.votes_against / total) * 100) : 0;
            const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
            const isExpanded = expanded === proposal.id;
            const myVote = myVotes[proposal.id];
            const isActive = proposal.status === "active" && new Date(proposal.voting_ends_at) > new Date();

            return (
              <div key={proposal.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all">
                <button onClick={() => setExpanded(isExpanded ? null : proposal.id)}
                  className="w-full text-left p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{CATEGORY_EMOJI[proposal.category] || "💬"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-zinc-600 text-[10px] capitalize">{proposal.category}</span>
                      </div>
                      <h3 className="text-white font-black text-base leading-tight">{proposal.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {total} votes</span>
                        {isActive && <span className="flex items-center gap-1 text-yellow-400"><Clock className="w-3 h-3" /> {timeLeft(proposal.voting_ends_at)}</span>}
                        <span>by @{proposal.profiles?.username}</span>
                      </div>

                      {/* Vote bar */}
                      <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full transition-all" style={{ width: `${forPct}%` }} />
                        <div className="bg-red-500 h-full transition-all" style={{ width: `${againstPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1">
                        <span className="text-green-400 font-bold">✅ {forPct}% For ({proposal.votes_for})</span>
                        <span className="text-red-400 font-bold">❌ {againstPct}% Against ({proposal.votes_against})</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-zinc-800">
                    <p className="text-zinc-300 text-sm mt-4 leading-relaxed">{proposal.description}</p>

                    {isActive && user && (
                      <div className="mt-4 flex gap-2">
                        {voting === proposal.id ? (
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Casting vote...
                          </div>
                        ) : myVote ? (
                          <div className="text-sm text-zinc-400">You voted: <span className={`font-black ${myVote === "for" ? "text-green-400" : myVote === "against" ? "text-red-400" : "text-zinc-300"}`}>{myVote}</span></div>
                        ) : (
                          <>
                            <button onClick={() => castVote(proposal.id, "for")}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-black py-2 rounded-xl hover:bg-green-500/20 text-sm">
                              <CheckCircle className="w-4 h-4" /> Vote For
                            </button>
                            <button onClick={() => castVote(proposal.id, "against")}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-black py-2 rounded-xl hover:bg-red-500/20 text-sm">
                              <XCircle className="w-4 h-4" /> Vote Against
                            </button>
                            <button onClick={() => castVote(proposal.id, "abstain")}
                              className="px-3 bg-zinc-800 text-zinc-400 font-bold py-2 rounded-xl hover:bg-zinc-700 text-sm">
                              Abstain
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {isActive && !user && (
                      <Link href="/auth/login" className="mt-4 block text-center text-yellow-400 text-sm font-bold hover:underline">
                        Sign in to vote →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Vote className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No proposals in this category</p>
          </div>
        )}
      </main>
    </div>
  );
}
