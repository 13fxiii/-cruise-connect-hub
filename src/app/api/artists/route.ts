import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'approved';
  const genre  = searchParams.get('genre');
  const featured = searchParams.get('featured') === '1';

  let query = supabaseAdmin
    .from('artist_submissions')
    .select('*, profiles!artist_id(id, username, display_name, avatar_url, twitter_handle)')
    .order('featured_from', { ascending: false, nullsFirst: false })
    .order('like_count', { ascending: false })
    .limit(20);

  if (featured) {
    query = query.eq('status', 'featured').gt('featured_until', new Date().toISOString());
  } else {
    query = query.eq('status', status);
    if (genre) query = query.eq('genre', genre);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tracks: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { artist_name, track_title, track_url, cover_url, genre, description, social_links } = body;

    if (!artist_name || !track_title || !track_url)
      return NextResponse.json({ error: 'artist_name, track_title, and track_url are required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('artist_submissions')
      .insert({
        artist_id: user.id, artist_name, track_title, track_url,
        cover_url: cover_url || '', genre: genre || 'afrobeats',
        description: description || '', social_links: social_links || {},
        status: 'pending',
      })
      .select().single();

    if (error) throw error;

    // Notify admin
    await supabaseAdmin.from('notifications').insert({
      user_id: '81341f73-3a9b-4f89-abcc-cf49c4f7ce20',
      type: 'artist_submission',
      title: `🎵 New track submission: "${track_title}" by ${artist_name}`,
      body: `Genre: ${genre || 'afrobeats'}. Review in admin panel.`,
      link: '/admin',
    });

    return NextResponse.json({ track: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
