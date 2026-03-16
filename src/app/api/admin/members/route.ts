import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_IDS = ['81341f73-3a9b-4f89-abcc-cf49c4f7ce20'];

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_IDS.includes(user.id)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'created_at';
  const limit = 20;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, avatar_url, level, points, wallet_balance, twitter_handle, created_at, is_banned, referral_code', { count: 'exact' })
    .order(sortBy === 'points' ? 'points' : 'created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,twitter_handle.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ members: data || [], total: count || 0, page, pages: Math.ceil((count || 0) / limit) });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_IDS.includes(user.id)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { member_id, action, value } = await req.json();

  const updates: Record<string, any> = {};
  if (action === 'ban')    updates.is_banned = true;
  if (action === 'unban')  updates.is_banned = false;
  if (action === 'set_level') updates.level = value;
  if (action === 'add_points') {
    const { data: p } = await supabaseAdmin.from('profiles').select('points').eq('id', member_id).single();
    if (p) updates.points = (p.points || 0) + parseInt(value);
  }

  const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', member_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_id: user.id, action, target_type: 'member', target_id: member_id, details: { value }
  });

  return NextResponse.json({ success: true });
}
