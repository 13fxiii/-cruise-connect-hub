// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { proposal_id, vote, reason } = await req.json();
    if (!proposal_id || !vote) return NextResponse.json({ error: 'proposal_id and vote required' }, { status: 400 });

    // Check proposal is still active
    const { data: proposal } = await supabaseAdmin
      .from('dao_proposals' as any).select('*').eq('id', proposal_id).maybeSingle();
    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    if (proposal.status !== 'active') return NextResponse.json({ error: 'Voting is closed' }, { status: 400 });
    if (new Date(proposal.voting_ends_at) < new Date()) return NextResponse.json({ error: 'Voting period has ended' }, { status: 400 });

    // Record vote (upsert to allow vote change)
    const { error: voteError } = await supabaseAdmin.from('dao_votes' as any).upsert({
      proposal_id, voter_id: user.id, vote, reason: reason || '',
    }, { onConflict: 'proposal_id,voter_id' });

    if (voteError) throw voteError;

    // Recount votes
    const { data: allVotes } = await supabaseAdmin
      .from('dao_votes' as any).select('vote').eq('proposal_id', proposal_id);
    const votesFor = (allVotes || []).filter((v: any) => v.vote === 'for').length;
    const votesAgainst = (allVotes || []).filter((v: any) => v.vote === 'against').length;
    const votesAbstain = (allVotes || []).filter((v: any) => v.vote === 'abstain').length;
    const total = votesFor + votesAgainst + votesAbstain;

    // Check if proposal passes
    let newStatus = proposal.status;
    if (total >= (proposal.min_votes || 10)) {
      const passRate = total > 0 ? (votesFor / total) * 100 : 0;
      if (passRate >= (proposal.pass_threshold || 60)) newStatus = 'passed';
    }

    await supabaseAdmin.from('dao_proposals' as any).update({
      votes_for: votesFor, votes_against: votesAgainst, votes_abstain: votesAbstain,
      status: newStatus,
    }).eq('id', proposal_id);

    return NextResponse.json({ success: true, votes_for: votesFor, votes_against: votesAgainst, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
