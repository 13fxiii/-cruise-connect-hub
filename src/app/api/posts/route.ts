// @ts-nocheck
export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit  = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const cursor = searchParams.get('cursor');

  let query = supabaseAdmin
    .from('posts')
    .select(`
      id, content, created_at, author_id, likes_count, replies_count,
      media_urls, post_type, is_pinned, view_count,
      profiles!author_id(id, display_name, username, avatar_url, twitter_handle)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ posts: [], error: error.message }, { status: 200 });
  }

  // Fetch current user's liked posts
  const user = await auth();
  const postIds = (data || []).map((p: any) => p.id);
  let likedSet = new Set<string>();

  if (user && postIds.length > 0) {
    const { data: userLikes } = await supabaseAdmin
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    (userLikes || []).forEach((l: any) => likedSet.add(l.post_id));
  }

  const posts = (data || []).map((p: any) => ({
    ...p,
    liked_by_me: likedSet.has(p.id),
  }));

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const user = await auth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content, media_urls, post_type } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      author_id: user.id,
      content: content.trim(),
      media_urls: media_urls || [],
      post_type: post_type || 'text',
      is_deleted: false,
    })
    .select(`
      id, content, created_at, author_id, likes_count, replies_count,
      profiles!author_id(id, display_name, username, avatar_url, twitter_handle)
    `)
    .single();

  if (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
