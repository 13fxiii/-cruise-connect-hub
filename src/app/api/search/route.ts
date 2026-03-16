import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q    = searchParams.get('q')?.trim();
  const type = searchParams.get('type') || 'all'; // all | users | posts | music

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const results: any[] = [];
  const like = `%${q}%`;

  // ── Users ──────────────────────────────────────────────────
  if (type === 'all' || type === 'users') {
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio, level, points, followers_count')
      .or(`username.ilike.${like},display_name.ilike.${like}`)
      .limit(type === 'all' ? 5 : 15);

    (users || []).forEach(u => results.push({
      type: 'user',
      id: u.id,
      title: u.display_name || u.username,
      subtitle: '@' + (u.username || ''),
      avatar: u.avatar_url,
      meta: u.level || 'newcomer',
      link: `/profile/${u.id}`,
    }));
  }

  // ── Posts ──────────────────────────────────────────────────
  if (type === 'all' || type === 'posts') {
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('id, content, created_at, likes_count, profiles!inner(username, display_name, avatar_url)')
      .ilike('content', like)
      .eq('status', 'published')
      .order('likes_count', { ascending: false })
      .limit(type === 'all' ? 4 : 15);

    (posts || []).forEach((p: any) => results.push({
      type: 'post',
      id: p.id,
      title: p.content.substring(0, 90) + (p.content.length > 90 ? '…' : ''),
      subtitle: (p.profiles?.display_name || p.profiles?.username) + ' · ' + p.likes_count + ' likes',
      avatar: p.profiles?.avatar_url,
      link: '/feed',
    }));
  }

  // ── Music ──────────────────────────────────────────────────
  if (type === 'all' || type === 'music') {
    const { data: tracks } = await supabaseAdmin
      .from('artist_submissions')
      .select('id, track_title, artist_name, genre, play_count, status')
      .or(`track_title.ilike.${like},artist_name.ilike.${like}`)
      .in('status', ['approved', 'featured'])
      .limit(type === 'all' ? 3 : 15);

    (tracks || []).forEach(t => results.push({
      type: 'music',
      id: t.id,
      title: t.track_title,
      subtitle: t.artist_name + ' · ' + t.genre,
      avatar: null,
      meta: t.play_count + ' plays',
      link: '/music/artists',
    }));
  }

  // ── Marketplace ────────────────────────────────────────────
  if (type === 'all' || type === 'marketplace') {
    const { data: listings } = await supabaseAdmin
      .from('marketplace_listings')
      .select('id, title, price_display, category, profiles!seller_id(username)')
      .ilike('title', like)
      .eq('status', 'active')
      .limit(type === 'all' ? 3 : 10);

    (listings || []).forEach((l: any) => results.push({
      type: 'marketplace',
      id: l.id,
      title: l.title,
      subtitle: l.price_display + ' · ' + l.category,
      avatar: null,
      link: '/marketplace',
    }));
  }

  return NextResponse.json({ results, query: q });
}
