// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, avatar_url, cover_url, bio, location, website, twitter_handle, level, points, current_streak, longest_streak, followers_count, following_count, created_at')
    .eq('id', params.id)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let is_following = false;
  if (user && user.id !== params.id) {
    const { data: follow } = await supabaseAdmin
      .from('follows' as any)
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', params.id)
      .maybeSingle();
    is_following = !!follow;
  }

  return NextResponse.json({ profile, is_following });
}
