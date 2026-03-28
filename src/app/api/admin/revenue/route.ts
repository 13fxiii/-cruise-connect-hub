// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminUser } from '@/lib/authz';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!isAdminUser(user, profile as any)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const [txns, orders, sponsorApps, gifts] = await Promise.all([
    supabaseAdmin.from('wallet_transactions').select('amount, type, created_at').gte('created_at', since).order('created_at', { ascending: true }),
    supabaseAdmin.from('marketplace_orders').select('platform_fee, created_at').gte('created_at', since),
    supabaseAdmin.from('sponsorship_applications').select('id, brand_name, status, created_at').gte('created_at', since),
    supabaseAdmin.from('gifts').select('platform_fee, created_at').gte('created_at', since),
  ]);

  const giftRevenue = (gifts.data || []).reduce((s: number, g: any) => s + (g.platform_fee || 0), 0);
  const marketRevenue = (orders.data || []).reduce((s: number, o: any) => s + (o.platform_fee || 0), 0);

  // Group daily revenue
  const dailyMap: Record<string, number> = {};
  [...(txns.data || [])].forEach((t: any) => {
    const day = t.created_at.split('T')[0];
    dailyMap[day] = (dailyMap[day] || 0) + Math.abs(t.amount || 0) * 0.05;
  });

  return NextResponse.json({
    summary: {
      gift_revenue: giftRevenue,
      marketplace_revenue: marketRevenue,
      total_revenue: giftRevenue + marketRevenue,
      pending_sponsorships: (sponsorApps.data || []).filter((s: any) => s.status === 'pending').length,
    },
    daily: Object.entries(dailyMap).map(([date, amount]) => ({ date, amount })).slice(-30),
    recent_sponsorships: (sponsorApps.data || []).slice(0, 10),
  });
}
