// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('post_comments' as any)
    .select('*, profiles!user_id(id, username, display_name, avatar_url, twitter_handle)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { post_id, content } = await req.json();
    if (!post_id || !content?.trim()) return NextResponse.json({ error: 'post_id and content required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('post_comments' as any)
      .insert({ post_id, user_id: user.id, content: content.trim() })
      .select('*, profiles!user_id(id, username, display_name, avatar_url, twitter_handle)')
      .single();

    if (error) throw error;
    return NextResponse.json({ comment: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await (supabaseAdmin.from('post_comments' as any) as any).delete().eq('id', id).eq('user_id', user.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
