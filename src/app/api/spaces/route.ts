// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data: spaces } = await supabaseAdmin
      .from('live_spaces')
      .select(`
        *,
        profiles!host_id(id, username, display_name, avatar_url, twitter_handle)
      `)
      .in('status', ['live', 'scheduled'])
      .order('status', { ascending: true }) // live first
      .order('scheduled_at', { ascending: true })
      .limit(20);

    return NextResponse.json({ spaces: spaces || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, scheduled_at, x_space_url, topic_tags } = body;

    const { data: space, error } = await supabaseAdmin
      .from('live_spaces')
      .insert({
        host_id: user.id,
        title,
        description,
        scheduled_at,
        x_space_url,
        topic_tags: topic_tags || [],
        status: scheduled_at ? 'scheduled' : 'live',
        source: 'app',
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    // Auto-notify community
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id, // will be fanned out
      type: 'space_started',
      title: `🎙️ Space starting: ${title}`,
      body: description || '',
      link: `/spaces`,
    });

    return NextResponse.json({ space });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
