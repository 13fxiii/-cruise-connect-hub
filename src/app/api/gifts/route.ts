import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/gifts — get gift types + recent gifts for a space
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('space_id');

  const { data: giftTypes } = await supabaseAdmin
    .from('gift_types')
    .select('*')
    .eq('is_active', true)
    .order('value');

  const { data: recentGifts } = spaceId
    ? await supabaseAdmin
        .from('gifts')
        .select('*, gift_types(*), profiles!sender_id(username, display_name, avatar_url), profiles!receiver_id(username, display_name)')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] };

  return NextResponse.json({ giftTypes: giftTypes || [], recentGifts: recentGifts || [] });
}

// POST /api/gifts — send a gift
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gift_type_id, receiver_id, space_id, message } = await req.json();

    // Get gift type
    const { data: giftType } = await supabaseAdmin
      .from('gift_types')
      .select('*')
      .eq('id', gift_type_id)
      .single();

    if (!giftType) return NextResponse.json({ error: 'Invalid gift type' }, { status: 400 });

    // Check sender balance
    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (!senderProfile || senderProfile.wallet_balance < giftType.value) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const PLATFORM_FEE_RATE = 0.1; // 10%
    const platformFee = Math.floor(giftType.value * PLATFORM_FEE_RATE);
    const netAmount = giftType.value - platformFee;

    // Deduct from sender
    await supabaseAdmin
      .from('profiles')
      .update({ wallet_balance: senderProfile.wallet_balance - giftType.value })
      .eq('id', user.id);

    // Credit receiver
    const { data: receiverProfile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance')
      .eq('id', receiver_id)
      .single();

    if (receiverProfile) {
      await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: receiverProfile.wallet_balance + netAmount })
        .eq('id', receiver_id);
    }

    // Record gift
    const { data: gift } = await supabaseAdmin
      .from('gifts')
      .insert({
        gift_type_id,
        sender_id: user.id,
        receiver_id,
        space_id: space_id || null,
        amount: giftType.value,
        platform_fee: platformFee,
        net_amount: netAmount,
        message: message || '',
      })
      .select()
      .single();

    // Record wallet transactions
    await supabaseAdmin.from('wallet_transactions').insert([
      { user_id: user.id, type: 'gift_sent', amount: -giftType.value, description: `Sent ${giftType.emoji} ${giftType.name} gift`, status: 'completed' },
      { user_id: receiver_id, type: 'gift_received', amount: netAmount, description: `Received ${giftType.emoji} ${giftType.name} gift`, status: 'completed' },
    ]);

    // Notify receiver
    await supabaseAdmin.from('notifications').insert({
      user_id: receiver_id,
      type: 'gift_received',
      title: `${giftType.emoji} You received a gift!`,
      body: `Someone sent you a ${giftType.name} — ₦${(netAmount/100).toLocaleString()} added to your wallet`,
      link: '/wallet',
    });

    return NextResponse.json({ success: true, gift, netAmount, platformFee });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
