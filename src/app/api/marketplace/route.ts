// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const sellerId = searchParams.get('seller_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;

  let query = supabaseAdmin
    .from('marketplace_listings' as any)
    .select(`*, profiles!seller_id(username, display_name, avatar_url, twitter_handle)`)
    .eq('status', 'active')
    .order('purchase_count', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (category && category !== 'all') query = query.eq('category', category);
  if (sellerId) query = query.eq('seller_id', sellerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, category, price, cover_url, tags } = body;

    if (!title || !description || !category || !price)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const priceInt = parseInt(price) * 100; // convert to kobo
    const { data, error } = await supabaseAdmin
      .from('marketplace_listings' as any)
      .insert({
        seller_id: user.id,
        title,
        description,
        category,
        price: priceInt,
        price_display: `₦${parseInt(price).toLocaleString()}`,
        cover_url: cover_url || '',
        tags: tags || [],
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ listing: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
