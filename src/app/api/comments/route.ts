import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('post_comments')
    .select('*, profiles!user_id(id, username, display_name, avatar_url, twitter_handle)')
    .eq('post_id', postId)
    .order('is_pinned', { ascending: false })
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
      .from('post_comments')
      .insert({ post_id, user_id: user.id, content: content.trim() })
      .select('*, profiles!user_id(id, username, display_name, avatar_url, twitter_handle)')
      .single();

    if (error) throw error;

    // Increment comment count on post + notify post author
    await supabaseAdmin.rpc('increment_post_comments', { p_post_id: post_id }).catch(() => {
      supabaseAdmin.from('posts').select('id, user_id, comments_count').eq('id', post_id).single().then(({ data: post }) => {
        if (post) {
          supabaseAdmin.from('posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', post_id);
          if (post.user_id !== user.id) {
            const { data: profile } = supabaseAdmin.from('profiles').select('username').eq('id', user.id).single() as any;
            supabaseAdmin.from('notifications').insert({
              user_id: post.user_id, type: 'comment',
              title: `💬 New comment on your post`,
              body: content.trim().substring(0, 80),
              link: '/feed',
            });
          }
        }
      });
    });

    // Award points for engaging
    await supabaseAdmin.from('profiles')
      .update({ points: supabaseAdmin.rpc('profiles.points', {}) as any })
      .eq('id', user.id).catch(() => {});

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

    const { error } = await supabaseAdmin.from('post_comments')
      .delete().eq('id', id).eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
