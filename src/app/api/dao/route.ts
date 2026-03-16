import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'active';

  const { data: proposals } = await supabaseAdmin
    .from('dao_proposals')
    .select(`*, profiles!proposer_id(username, display_name, avatar_url)`)
    .eq('status', status === 'all' ? undefined as any : status)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ proposals: proposals || [] });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, category } = await req.json();
    if (!title || !description) return NextResponse.json({ error: 'Title and description required' }, { status: 400 });

    // Check user has enough points to propose (min 100)
    const { data: profile } = await supabaseAdmin.from('profiles').select('points').eq('id', user.id).single();
    if (!profile || (profile.points || 0) < 100) {
      return NextResponse.json({ error: 'You need at least 100 community points to submit a proposal' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('dao_proposals')
      .insert({
        proposer_id: user.id, title, description,
        category: category || 'general',
        voting_ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ proposal: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
