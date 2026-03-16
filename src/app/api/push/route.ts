// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/push — subscribe to push notifications
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const subscription = await req.json();
    const { endpoint, keys: { p256dh, auth } } = subscription;

    await supabaseAdmin.from('push_subscriptions' as any).upsert({
      user_id: user.id,
      endpoint,
      p256dh,
      auth_key: auth,
      is_active: true,
    }, { onConflict: 'user_id,endpoint' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/push — unsubscribe
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { endpoint } = await req.json();
    await supabaseAdmin.from('push_subscriptions' as any)
      .update({ is_active: false })
      .eq('user_id', user.id).eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
