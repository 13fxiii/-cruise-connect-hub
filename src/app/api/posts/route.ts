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
      id, content, created_at, author_id,
      profiles!author_id(id, display_name, username, avatar_url, twitter_handle)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch like counts separately
  const postIds = (data || []).map((p: any) => p.id);
  let likeCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: likes } = await supabaseAdmin
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds);
    (likes || []).forEach((l: any) => {
      likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
    });
  }

  const posts = (data || []).map((p: any) => ({
    ...p,
    likes_count: likeCounts[p.id] || 0,
  }));

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }
  if (body.content.length > 2000) {
    return NextResponse.json({ error: 'Max 2000 characters' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      author_id: session.user.id,
      content:   body.content.trim(),
      tags:      body.tags || [],
    })
    .select(`
      id, content, created_at, author_id,
      profiles!author_id(id, display_name, username, avatar_url, twitter_handle)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: { ...data, likes_count: 0 } }, { status: 201 });
}
