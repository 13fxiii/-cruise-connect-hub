// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { display_name, username, bio, twitter_handle, interests, location, website, avatar_url } = body;

    // Username uniqueness check
    if (username) {
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .neq('id', user.id)
        .single();
      if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (display_name)   updates.display_name   = display_name.trim();
    if (username)       updates.username       = username.toLowerCase().trim();
    if (bio)            updates.bio            = bio.trim();
    if (twitter_handle) updates.twitter_handle = twitter_handle.trim();
    if (interests)      updates.interests      = interests;
    if (location)       updates.location       = location.trim();
    if (website)        updates.website        = website.trim();
    if (avatar_url)     updates.avatar_url     = avatar_url.trim();

    const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('*').eq('id', user.id).single();

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
