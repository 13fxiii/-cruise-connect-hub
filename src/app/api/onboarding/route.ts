import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function sanitizeUsername(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
}

function safeInternalPath(path?: string | null) {
  if (!path) return '/feed';
  return path.startsWith('/') && !path.startsWith('//') ? path : '/feed';
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { data: card } = await supabase
      .from('community_id_cards')
      .select('card_number, qr_data, issued_at, is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({ profile, card: card || null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to load onboarding data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const meta = user.user_metadata || {};

    const rawUsername =
      String(body?.username || meta.preferred_username || meta.user_name || meta.username || (user.email || '').split('@')[0] || 'member');
    let username = sanitizeUsername(rawUsername);
    if (!username) username = `user_${user.id.slice(0, 6)}`;

    const { data: clash } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle();

    if (clash) {
      username = `${username.slice(0, 24)}_${user.id.slice(0, 4)}`;
    }

    const displayName =
      String(body?.display_name || '').trim() ||
      String(meta.full_name || meta.name || meta.preferred_username || '').trim() ||
      `Member ${user.id.slice(0, 6)}`;

    const xUsername = sanitizeUsername(String(meta.preferred_username || meta.user_name || meta.username || body?.x_username || ''));
    const avatar =
      String(body?.avatar_url || '').trim() ||
      String(meta.avatar_url || meta.picture || body?.x_avatar_url || '').trim() ||
      '';

    const referralCode = `CCH-${user.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    const profilePayload: Record<string, any> = {
      id: user.id,
      username,
      display_name: displayName,
      avatar_url: avatar || null,
      avatar: avatar || null,
      x_username: xUsername || null,
      x_display_name: displayName,
      x_avatar_url: avatar || null,
      twitter_handle: xUsername ? `@${xUsername}` : null,
      onboarding_done: true,
      bio: body?.bio?.trim() || null,
      interests: Array.isArray(body?.interests) ? body.interests.slice(0, 12) : null,
      location: body?.location?.trim() || null,
      website: body?.website?.trim() || null,
      referral_code: referralCode,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from('profiles').upsert(profilePayload as any, { onConflict: 'id' });
    const { error: upsertError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    const cardNumber = `CCH-${new Date().getFullYear()}-${user.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const qrPayload = JSON.stringify({ user_id: user.id, username, card_number: cardNumber });

    const { error: cardError } = await supabase.from('community_id_cards').upsert(
      {
        user_id: user.id,
        card_number: cardNumber,
        qr_data: qrPayload,
        is_active: true,
      },
      { onConflict: 'user_id' }
    );

    if (cardError) {
      return NextResponse.json({ error: cardError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      username,
      display_name: displayName,
      card_number: cardNumber,
      redirect_to: safeInternalPath(body?.redirect_to),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Onboarding failed' }, { status: 500 });
  }
}
