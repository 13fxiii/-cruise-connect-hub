// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { listing_id } = await req.json();
    const { data: listing } = await supabaseAdmin.from('marketplace_listings' as any).select('*').eq('id', listing_id).single();
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.seller_id === user.id) return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 });

    const { data: buyer } = await supabaseAdmin.from('profiles').select('wallet_balance').eq('id', user.id).single();
    if (!buyer || buyer.wallet_balance < listing.price) return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });

    const platformFee = Math.floor(listing.price * 0.05); // 5% fee
    const netAmount = listing.price - platformFee;

    // Deduct buyer
    await supabaseAdmin.from('profiles').update({ wallet_balance: buyer.wallet_balance - listing.price }).eq('id', user.id);

    // Credit seller
    const { data: seller } = await supabaseAdmin.from('profiles').select('wallet_balance').eq('id', listing.seller_id).single();
    if (seller) await supabaseAdmin.from('profiles').update({ wallet_balance: seller.wallet_balance + netAmount }).eq('id', listing.seller_id);

    // Record order
    const { data: order } = await supabaseAdmin.from('marketplace_orders' as any).insert({
      listing_id, buyer_id: user.id, seller_id: listing.seller_id,
      amount: listing.price, platform_fee: platformFee, net_amount: netAmount, status: 'completed',
    }).select().single();

    // Increment purchase count
    await supabaseAdmin.from('marketplace_listings' as any).update({ purchase_count: listing.purchase_count + 1 }).eq('id', listing_id);

    // Notify seller
    await supabaseAdmin.from('notifications').insert({
      user_id: listing.seller_id, type: 'marketplace_sale',
      title: `💰 You sold "${listing.title}"!`,
      body: `₦${(netAmount/100).toLocaleString()} added to your wallet`,
      link: '/wallet',
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
