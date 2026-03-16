// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('user_id') || user.id;
    const range = searchParams.get('range') || '30'; // days

    // Base analytics
    const { data: analytics } = await supabaseAdmin
      .from('creator_analytics' as any)
      .select('*')
      .eq('user_id', targetId)
      .single();

    // Wallet transactions for earnings breakdown
    const sinceDate = new Date(Date.now() - parseInt(range) * 86400000).toISOString();
    const { data: txns } = await supabaseAdmin
      .from('wallet_transactions')
      .select('type, amount, created_at')
      .eq('user_id', targetId)
      .gte('created_at', sinceDate)
      .order('created_at', { ascending: false });

    // Post engagement
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('id, created_at, likes_count, comments_count')
      .eq('user_id', targetId)
      .gte('created_at', sinceDate)
      .order('created_at', { ascending: false });

    // 30-day snapshots for chart
    const { data: snapshots } = await supabaseAdmin
      .from('analytics_snapshots' as any)
      .select('*')
      .eq('user_id', targetId)
      .gte('snapshot_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    // Compute earnings breakdown from transactions
    const earningsBreakdown = (txns || []).reduce((acc: Record<string, number>, t: any) => {
      if (t.amount > 0) {
        const key = t.type?.includes('gift') ? 'gifts' :
                    t.type?.includes('tournament') ? 'tournaments' :
                    t.type?.includes('referral') ? 'referrals' :
                    t.type?.includes('merch') || t.type?.includes('marketplace') ? 'marketplace' : 'other';
        acc[key] = (acc[key] || 0) + t.amount;
      }
      return acc;
    }, {});

    // Top posts by engagement
    const topPosts = (posts || [])
      .sort((a: any, b: any) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count))
      .slice(0, 5);

    // Profile for follower count etc.
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance, points, level, referral_code')
      .eq('id', targetId)
      .single();

    return NextResponse.json({
      analytics: analytics || {},
      earningsBreakdown,
      snapshots: snapshots || [],
      topPosts: topPosts || [],
      totalEarned: Object.values(earningsBreakdown).reduce((a: any, b: any) => a + b, 0),
      profile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
