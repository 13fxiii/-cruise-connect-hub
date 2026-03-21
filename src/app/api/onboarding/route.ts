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
    const body_parsed = body;
    const { display_name, bio, twitter_handle, interests, location, website, avatar_url } = body;
    let username = body.username;

    // Username uniqueness check
    if (username) {
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .neq('id', user.id)
        .maybeSingle();
      if (existing) {
        // Auto-append suffix instead of returning error (handles auto-creation flow)
        const suffix = user.id.slice(0, 4);
        const candidate = `${username.toLowerCase()}_${suffix}`.slice(0, 30);
        // Check the new candidate too
        const { data: alsoExists } = await supabaseAdmin
          .from('profiles').select('id')
          .eq('username', candidate).neq('id', user.id).maybeSingle();
        if (!alsoExists) {
          // Use the suffixed version silently
          username = candidate;
        } else {
          return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
      }
    }

    const meta = user.user_metadata || {};
    const fallbackUsername = (
      meta.preferred_username ||
      meta.username ||
      (user.email || '').split('@')[0]
    ).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30) || `user_${user.id.slice(0, 6)}`;

    // UPSERT — handles both new + existing profiles
    const profileData: any = {
      id: user.id,
      email: user.email,
      updated_at: new Date().toISOString(),
    };
    if (display_name)          profileData.display_name   = display_name.trim();
    if (username)              profileData.username       = username.toLowerCase().trim();
    else if (!profileData.username) profileData.username  = fallbackUsername;
    if (bio)                   profileData.bio            = bio.trim();
    if (twitter_handle)        profileData.twitter_handle = twitter_handle.trim();
    if (interests)             profileData.interests      = interests;
    if (location)              profileData.location       = location.trim();
    if (website)               profileData.website        = website.trim();
    if (avatar_url)            profileData.avatar_url     = avatar_url.trim();

    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Onboarding API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('*').eq('id', user.id).maybeSingle();

    return NextResponse.json({ profile: profile || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
