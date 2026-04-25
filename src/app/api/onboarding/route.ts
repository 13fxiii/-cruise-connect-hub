// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { display_name, bio, twitter_handle, interests, location, website, avatar_url } = body;
    const meta = user.user_metadata || {};

    let username = (
      body.username ||
      meta.preferred_username ||
      meta.username ||
      (user.email || '').split('@')[0]
    )
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 30);

    if (!username) username = `user_${user.id.slice(0, 6)}`;

    // Username uniqueness check
    if (username) {
      const { data: existing } = await supabase
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
        const { data: alsoExists } = await supabase
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

    const fallbackDisplayName =
      (display_name && display_name.trim()) ||
      meta.full_name ||
      meta.name ||
      (meta.username ? `@${meta.username}` : null) ||
      username;

    // UPSERT — handles both new + existing profiles
    const profileData: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
      onboarding_done: true,
    };
    profileData.display_name = fallbackDisplayName;
    profileData.username = username.toLowerCase().trim();
    if (bio)                   profileData.bio            = bio.trim();
    if (twitter_handle)        profileData.twitter_handle = twitter_handle.trim();
    if (interests)             profileData.interests      = interests;
    if (location)              profileData.location       = location.trim();
    if (website)               profileData.website        = website.trim();
    if (avatar_url)            profileData.avatar_url     = avatar_url.trim();

    const { error } = await supabase
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

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).maybeSingle();

    return NextResponse.json({ profile: profile || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
