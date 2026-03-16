import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/messages — list conversations
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabaseAdmin
      .from('dm_conversations')
      .select(`
        id, last_message, last_message_at, unread_p1, unread_p2,
        p1:profiles!participant1(id, username, display_name, avatar_url),
        p2:profiles!participant2(id, username, display_name, avatar_url)
      `)
      .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(30);

    const conversations = (data || []).map((c: any) => ({
      ...c,
      other: c.p1?.id === user.id ? c.p2 : c.p1,
      unread: c.p1?.id === user.id ? c.unread_p1 : c.unread_p2,
    }));

    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/messages — start or get conversation with a user
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { recipient_id } = await req.json();
    if (!recipient_id) return NextResponse.json({ error: 'recipient_id required' }, { status: 400 });
    if (recipient_id === user.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

    // Ensure consistent ordering
    const [p1, p2] = [user.id, recipient_id].sort();

    const { data: existing } = await supabaseAdmin
      .from('dm_conversations')
      .select('id')
      .eq('participant1', p1).eq('participant2', p2).single();

    if (existing) return NextResponse.json({ conversation_id: existing.id });

    const { data, error } = await supabaseAdmin
      .from('dm_conversations')
      .insert({ participant1: p1, participant2: p2 })
      .select('id').single();

    if (error) throw error;
    return NextResponse.json({ conversation_id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
