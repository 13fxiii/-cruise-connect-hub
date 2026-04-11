// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/messages/[id] — get messages in conversation
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabaseAdmin
      .from('dm_messages' as any)
      .select('*, profiles!sender_id(id, username, display_name, avatar_url)')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })
      .limit(100);

    // Mark as read
    await supabaseAdmin.from('dm_conversations' as any)
      .select('participant1, participant2')
      .eq('id', params.id).maybeSingle().then(({ data: conv }) => {
        if (!conv) return;
        const isP1 = conv.participant1 === user.id;
        supabaseAdmin.from('dm_conversations' as any)
          .update(isP1 ? { unread_p1: 0 } : { unread_p2: 0 })
          .eq('id', params.id);
      });

    return NextResponse.json({ messages: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/messages/[id] — send message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 });

    const { data: msg, error } = await supabaseAdmin
      .from('dm_messages' as any)
      .insert({ conversation_id: params.id, sender_id: user.id, content: content.trim() })
      .select('*, profiles!sender_id(id, username, display_name, avatar_url)')
      .maybeSingle();

    if (error) throw error;

    // Update conversation last message + increment unread for recipient
    const { data: conv } = await supabaseAdmin
      .from('dm_conversations' as any)
      .select('participant1, participant2, unread_p1, unread_p2')
      .eq('id', params.id).maybeSingle();

    if (conv) {
      const isP1 = conv.participant1 === user.id;
      const recipientId = isP1 ? conv.participant2 : conv.participant1;
      await supabaseAdmin.from('dm_conversations' as any).update({
        last_message: content.trim().substring(0, 100),
        last_message_at: new Date().toISOString(),
        ...(isP1 ? { unread_p2: (conv.unread_p2 || 0) + 1 } : { unread_p1: (conv.unread_p1 || 0) + 1 }),
      }).eq('id', params.id);

      // Notify recipient
      const { data: sender } = await supabaseAdmin.from('profiles').select('display_name, username').eq('id', user.id).maybeSingle();
      await supabaseAdmin.from('notifications').insert({
        user_id: recipientId, type: 'dm',
        title: `💬 New message from ${sender?.display_name || sender?.username || 'someone'}`,
        body: content.trim().substring(0, 80),
        link: `/messages/${params.id}`,
      });
    }

    return NextResponse.json({ message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
