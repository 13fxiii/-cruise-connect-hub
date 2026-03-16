import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const unreadCount = searchParams.get('unread_count') === '1';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (unreadCount) {
      const { count } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      return NextResponse.json({ unread_count: count || 0 });
    }

    const { data } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return NextResponse.json({ notifications: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id       = searchParams.get('id');
    const markAll  = searchParams.get('mark_all') === '1';

    if (markAll) {
      await supabaseAdmin.from('notifications').update({ is_read: true }).eq('recipient_id', user.id);
    } else if (id) {
      await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id).eq('recipient_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
