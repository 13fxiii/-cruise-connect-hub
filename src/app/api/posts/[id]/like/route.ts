// @ts-nocheck
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // likes table has: user_id, post_id
  const { error } = await supabaseAdmin.from('likes').insert({
    post_id: params.id,
    user_id: session.user.id,
  });

  if (error?.code === '23505') return NextResponse.json({ liked: true, message: 'Already liked' });
  if (error) {
    // Fallback: increment likes_count directly
    await supabaseAdmin.rpc('increment_likes' as any, { row_id: params.id }).catch(() => {});
    return NextResponse.json({ liked: true });
  }

  // Increment posts.likes_count
  await supabaseAdmin.from('posts').update({ likes_count: supabaseAdmin.rpc('coalesce' as any) }).eq('id', params.id).catch(() => {});

  return NextResponse.json({ liked: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabaseAdmin.from('likes').delete()
    .eq('post_id', params.id).eq('user_id', session.user.id);

  return NextResponse.json({ liked: false });
}
