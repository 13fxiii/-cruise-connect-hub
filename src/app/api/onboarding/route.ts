// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { display_name, bio, twitter_handle, interests, location, website,
            avatar_url, x_username, x_display_name, x_avatar_url } = body;
    let username = body.username;

    // Username uniqueness check
    if (username) {
      const { data: existing } = await supabase
        .from('profiles').select('id')
        .eq('username', username.toLowerCase()).neq('id', user.id).maybeSingle();

      if (existing) {
        const suffix = user.id.slice(0, 4);
        const candidate = `${username.toLowerCase()}_${suffix}`.slice(0, 30);
        const { data: alsoExists } = await supabase
          .from('profiles').select('id').eq('username', candidate).neq('id', user.id).maybeSingle();
        if (!alsoExists) {
          username = candidate;
        } else {
          return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }
      }
    }

    const meta = user.user_metadata || {};
    const fallbackUsername = (
      meta.preferred_username || meta.username || (user.email || '').split('@')[0]
    ).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30) || `user_${user.id.slice(0, 6)}`;

    const profileData: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
      onboarding_done: true,
    };

    if (display_name)    profileData.display_name    = display_name.trim();
    if (username)        profileData.username        = username.toLowerCase().trim();
    else                 profileData.username        = fallbackUsername;
    if (bio)             profileData.bio             = bio.trim();
    if (twitter_handle)  profileData.twitter_handle  = twitter_handle.trim();
    if (interests)       profileData.interests       = interests;
    if (location)        profileData.location        = location.trim();
    if (website)         profileData.website         = website.trim();
    if (avatar_url)      profileData.avatar_url      = avatar_url.trim();
    // X OAuth data
    if (x_username)      profileData.x_username      = x_username;
    if (x_display_name)  profileData.x_display_name  = x_display_name;
    if (x_avatar_url)    profileData.x_avatar_url    = x_avatar_url;
    if (avatar_url)      profileData.avatar          = avatar_url.trim();

    const { error } = await supabase
      .from('profiles').upsert(profileData, { onConflict: 'id' });

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
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return NextResponse.json({ profile: profile || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
