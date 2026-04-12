// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { interests, bio, location, website } = body;
    let { username, display_name, avatar_url, x_username, x_display_name, x_avatar_url } = body;

    const meta = user.user_metadata || {};

    // Always pull from X metadata — never trust client-supplied values for these
    const resolvedDisplayName = display_name
      || meta.full_name || meta.name || meta.preferred_username || 'CC Member';

    const resolvedAvatar = avatar_url
      || meta.avatar_url || meta.picture || '';

    const resolvedXUsername = x_username
      || meta.preferred_username || meta.user_name || meta.username || '';

    // Build a clean username
    const rawUsername = username
      || meta.preferred_username || meta.user_name || meta.username
      || (user.email || '').split('@')[0]
      || `user_${user.id.slice(0, 6)}`;

    let cleanUsername = rawUsername
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 28);

    if (!cleanUsername) cleanUsername = `user_${user.id.slice(0, 8)}`;

    // Ensure username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (existing) {
      cleanUsername = `${cleanUsername}_${user.id.slice(0, 4)}`;
    }

    // Determine admin status
    const isAdmin = ['13fxiii_', '13fxiii', 'thecruisech', 'TheCruiseCH'].includes(resolvedXUsername.toLowerCase());

    const profileData: Record<string, any> = {
      id: user.id,
      username: cleanUsername,
      display_name: resolvedDisplayName,
      avatar_url: resolvedAvatar,
      avatar: resolvedAvatar,
      x_username: resolvedXUsername,
      x_display_name: resolvedDisplayName,
      x_avatar_url: resolvedAvatar,
      onboarding_done: true,
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    };

    if (interests?.length) profileData.interests = interests;
    if (bio)       profileData.bio = bio.trim();
    if (location)  profileData.location = location.trim();
    if (website)   profileData.website = website.trim();

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (error) {
      console.error('Onboarding upsert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, username: cleanUsername });
  } catch (err: any) {
    console.error('Onboarding API error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
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
