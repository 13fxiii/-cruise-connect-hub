// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { track_id } = await req.json();
  if (!track_id) return NextResponse.json({ error: 'Missing track_id' }, { status: 400 });

  // Increment play count
  await supabaseAdmin.rpc('increment_track_plays', { p_track_id: track_id }).catch(() => {
    // Fallback: direct update
    return supabaseAdmin.from('music_tracks')
      .update({ play_count: supabaseAdmin.raw('play_count + 1') })
      .eq('id', track_id);
  });

  // Log play if user is logged in
  if (user) {
    await supabaseAdmin.from('music_plays').insert({ user_id: user.id, track_id }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
