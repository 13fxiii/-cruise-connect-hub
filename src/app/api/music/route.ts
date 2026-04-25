// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre    = searchParams.get('genre');
  const featured = searchParams.get('featured') === '1';
  const search   = searchParams.get('q');
  const limit    = parseInt(searchParams.get('limit') || '20');

  let query = supabaseAdmin
    .from('music_tracks')
    .select('*')
    .eq('is_approved', true)
    .order('play_count', { ascending: false })
    .limit(limit);

  if (featured) query = query.eq('is_featured', true);
  if (genre && genre !== 'all') query = query.eq('genre', genre);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get user liked track IDs
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let likedIds: string[] = [];
  if (user) {
    const { data: likes } = await supabaseAdmin
      .from('music_likes').select('track_id').eq('user_id', user.id);
    likedIds = (likes || []).map((l: any) => l.track_id);
  }

  const tracks = (data || []).map((t: any) => ({ ...t, is_liked: likedIds.includes(t.id) }));
  return NextResponse.json({ tracks });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, track_id } = await req.json();

  if (action === 'play') {
    await supabaseAdmin.from('music_plays').insert({ user_id: user.id, track_id });
    await supabaseAdmin.rpc('increment_play_count', { track_id }).catch(() =>
      supabaseAdmin.from('music_tracks').update({ play_count: supabaseAdmin.rpc('') }).eq('id', track_id)
    );
    // simple increment
    const { data: t } = await supabaseAdmin.from('music_tracks').select('play_count').eq('id', track_id).maybeSingle();
    if (t) await supabaseAdmin.from('music_tracks').update({ play_count: (t.play_count || 0) + 1 }).eq('id', track_id);
    return NextResponse.json({ success: true });
  }

  if (action === 'like') {
    const { data: existing } = await supabaseAdmin
      .from('music_likes').select('id').eq('user_id', user.id).eq('track_id', track_id).maybeSingle();
    
    if (existing) {
      await supabaseAdmin.from('music_likes').delete().eq('user_id', user.id).eq('track_id', track_id);
      const { data: t } = await supabaseAdmin.from('music_tracks').select('like_count').eq('id', track_id).maybeSingle();
      if (t) await supabaseAdmin.from('music_tracks').update({ like_count: Math.max(0, (t.like_count || 0) - 1) }).eq('id', track_id);
      return NextResponse.json({ liked: false });
    } else {
      await supabaseAdmin.from('music_likes').insert({ user_id: user.id, track_id });
      const { data: t } = await supabaseAdmin.from('music_tracks').select('like_count').eq('id', track_id).maybeSingle();
      if (t) await supabaseAdmin.from('music_tracks').update({ like_count: (t.like_count || 0) + 1 }).eq('id', track_id);
      return NextResponse.json({ liked: true });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
