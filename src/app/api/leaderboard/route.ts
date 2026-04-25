// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type  = searchParams.get('type') || 'points';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get active season
    const { data: season } = await supabaseAdmin
      .from('leaderboard_seasons')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    let query = supabaseAdmin
      .from('profiles')
      .select('id, username, display_name, avatar_url, points, current_streak')
      .limit(limit);

    if (type === 'points') {
      query = query.order('points', { ascending: false });
    } else if (type === 'streak') {
      query = query.order('current_streak', { ascending: false });
    } else {
      // referrals — count from referrals table
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, username, display_name, avatar_url, points')
        .limit(limit);

      // Get referral counts
      const { data: refCounts } = await supabaseAdmin
        .from('profiles')
        .select('referred_by')
        .not('referred_by', 'is', null);

      const countMap: Record<string, number> = {};
      (refCounts || []).forEach((r: any) => {
        countMap[r.referred_by] = (countMap[r.referred_by] || 0) + 1;
      });

      const withRefs = (data || [])
        .map((p: any) => ({ ...p, referral_count: countMap[p.id] || 0 }))
        .sort((a: any, b: any) => b.referral_count - a.referral_count);

      return NextResponse.json({ leaderboard: withRefs, season });
    }

    const { data } = await query;
    return NextResponse.json({ leaderboard: data || [], season });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
