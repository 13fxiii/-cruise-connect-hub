// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAdmin(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('is_admin, role').eq('id', user.id).single();
  if (!(profile as any)?.is_admin && (profile as any)?.role !== 'admin') return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get('tab') || 'overview';

  if (tab === 'overview') {
    // Platform metrics last 30 days
    const { data: metrics } = await supabaseAdmin
      .from('platform_metrics' as any)
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(30);

    // Today's snapshot
    const today = metrics?.[0] || {};

    // Member counts
    const { count: totalMembers } = await supabaseAdmin
      .from('profiles').select('*', { count: 'exact', head: true });

    // Pending items
    const { count: pendingAds } = await supabaseAdmin
      .from('ad_submissions' as any).select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingJobs } = await supabaseAdmin
      .from('job_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingMod } = await supabaseAdmin
      .from('moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingSponsors } = await supabaseAdmin
      .from('sponsorship_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return NextResponse.json({
      overview: {
        total_members: totalMembers || 0,
        today,
        metrics: (metrics || []).reverse(),
        pending: {
          ads: pendingAds || 0,
          jobs: pendingJobs || 0,
          moderation: pendingMod || 0,
          sponsors: pendingSponsors || 0,
        },
      },
    });
  }

  if (tab === 'members') {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    let query = supabaseAdmin
      .from('profiles')
      .select('id, username, display_name, avatar_url, role, is_admin, is_verified, points, wallet_balance, level, created_at, twitter_handle')
      .order('created_at', { ascending: false })
      .limit(50);
    if (q) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
    const { data } = await query;
    return NextResponse.json({ members: data || [] });
  }

  if (tab === 'moderation') {
    const { data } = await supabaseAdmin
      .from('moderation_queue')
      .select(`*, reporter:reporter_id(username, display_name)`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(30);
    return NextResponse.json({ reports: data || [] });
  }

  if (tab === 'sponsors') {
    const { data } = await supabaseAdmin
      .from('sponsorship_applications')
      .select(`*, sponsorship_packages(name, price_display)`)
      .order('created_at', { ascending: false })
      .limit(30);
    return NextResponse.json({ applications: data || [] });
  }

  if (tab === 'revenue') {
    const { data: txns } = await supabaseAdmin
      .from('wallet_transactions')
      .select('type, amount, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('created_at', { ascending: false })
      .limit(200);

    const revenue = (txns || []).reduce((acc: Record<string, number>, t: any) => {
      if (t.amount > 0) {
        const key = t.type || 'other';
        acc[key] = (acc[key] || 0) + t.amount;
      }
      return acc;
    }, {});

    return NextResponse.json({ revenue, transactions: (txns || []).slice(0, 20) });
  }

  return NextResponse.json({ error: 'Unknown tab' }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, target_id, target_type, data } = await req.json();

  // Log admin action
  const logAction = async (details: any) => {
    await supabaseAdmin.from('admin_audit_log' as any).insert({
      admin_id: admin.id, action, target_type, target_id, details,
    }).catch(() => {});
  };

  if (action === 'verify_member') {
    await supabaseAdmin.from('profiles').update({ is_verified: true }).eq('id', target_id);
    await logAction({ verified: true });
    return NextResponse.json({ success: true });
  }

  if (action === 'ban_member') {
    await supabaseAdmin.from('profiles').update({ role: 'banned' }).eq('id', target_id);
    await logAction({ banned: true, reason: data?.reason });
    return NextResponse.json({ success: true });
  }

  if (action === 'approve_ad') {
    await supabaseAdmin.from('ad_submissions' as any).update({ status: 'approved' }).eq('id', target_id);
    await logAction({});
    return NextResponse.json({ success: true });
  }

  if (action === 'approve_job') {
    await supabaseAdmin.from('job_listings').update({ status: 'active' }).eq('id', target_id);
    await logAction({});
    return NextResponse.json({ success: true });
  }

  if (action === 'resolve_report') {
    await supabaseAdmin.from('moderation_queue').update({
      status: 'actioned', reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      action_taken: data?.action || 'reviewed',
    }).eq('id', target_id);
    await logAction({ action: data?.action });
    return NextResponse.json({ success: true });
  }

  if (action === 'approve_sponsor') {
    await supabaseAdmin.from('sponsorship_applications').update({ status: 'approved' }).eq('id', target_id);
    await logAction({});
    return NextResponse.json({ success: true });
  }

  if (action === 'feature_track') {
    await supabaseAdmin.from('music_tracks').update({ is_featured: data?.featured ?? true }).eq('id', target_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
