// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { target_id, action } = await req.json();
    if (!target_id) return NextResponse.json({ error: 'target_id required' }, { status: 400 });
    if (target_id === user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

    if (action === 'follow') {
      await supabaseAdmin.from('follows').insert({ follower_id: user.id, following_id: target_id }).then(() => {});
      // Notify
      const { data: me } = await supabaseAdmin.from('profiles').select('display_name, username').eq('id', user.id).single();
      await supabaseAdmin.from('notifications').insert({
        recipient_id: target_id,
        type: 'follow',
        message: `${me?.display_name || me?.username} started following you`,
      } as any);
    } else {
      await supabaseAdmin.from('follows').delete().eq('follower_id', user.id).eq('following_id', target_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
