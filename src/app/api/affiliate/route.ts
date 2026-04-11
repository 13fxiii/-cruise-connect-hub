// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Profile with referral info
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('referral_code, points, wallet_balance, level')
    .eq('id', user.id).maybeSingle();

  // Referrals made
  const { data: referrals } = await supabaseAdmin
    .from('referrals')
    .select('*, profiles!referred_id(username, display_name, avatar_url, created_at)')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Payouts
  const { data: payouts } = await supabaseAdmin
    .from('referral_payouts')
    .select('*').eq('referrer_id', user.id)
    .order('created_at', { ascending: false }).limit(10);

  // Tiers
  const { data: tiers } = await supabaseAdmin
    .from('affiliate_tiers').select('*').order('level');

  const referralCount = (referrals || []).length;
  const totalEarned = (payouts || []).reduce((a: number, p: any) => a + (p.amount || 0), 0);

  // Current tier
  const currentTier = (tiers || []).reduce((curr: any, t: any) =>
    referralCount >= t.min_referrals ? t : curr
  , tiers?.[0] || null);

  // Next tier
  const nextTier = (tiers || []).find((t: any) => t.level === (currentTier?.level || 0) + 1);

  return NextResponse.json({
    profile,
    referrals: referrals || [],
    payouts: payouts || [],
    tiers: tiers || [],
    stats: {
      referral_count: referralCount,
      total_earned: totalEarned,
      current_tier: currentTier,
      next_tier: nextTier,
      progress_to_next: nextTier
        ? Math.round((referralCount / nextTier.min_referrals) * 100)
        : 100,
    },
  });
}
