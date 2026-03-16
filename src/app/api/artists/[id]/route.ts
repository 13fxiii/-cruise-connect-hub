// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { action } = await req.json();
    const trackId = params.id;

    if (action === 'play') {
      await supabaseAdmin.from('artist_track_plays' as any).insert({ track_id: trackId, user_id: user?.id || null });
      const { data } = await supabaseAdmin.from('artist_submissions' as any).select('play_count').eq('id', trackId).single();
      await supabaseAdmin.from('artist_submissions' as any).update({ play_count: (data?.play_count || 0) + 1 }).eq('id', trackId);
      return NextResponse.json({ success: true });
    }

    if (action === 'like' && user) {
      const { error } = await supabaseAdmin.from('artist_track_likes' as any)
        .insert({ track_id: trackId, user_id: user.id });
      if (!error) {
        const { data } = await supabaseAdmin.from('artist_submissions' as any).select('like_count').eq('id', trackId).single();
        await supabaseAdmin.from('artist_submissions' as any).update({ like_count: (data?.like_count || 0) + 1 }).eq('id', trackId);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'unlike' && user) {
      await supabaseAdmin.from('artist_track_likes' as any).delete().eq('track_id', trackId).eq('user_id', user.id);
      const { data } = await supabaseAdmin.from('artist_submissions' as any).select('like_count').eq('id', trackId).single();
      await supabaseAdmin.from('artist_submissions' as any).update({ like_count: Math.max((data?.like_count || 0) - 1, 0) }).eq('id', trackId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
