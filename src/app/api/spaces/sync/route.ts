// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Called by a cron job or webhook from X
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'cchub-cron-2026';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN;
    const COMMUNITY_HANDLE = process.env.COMMUNITY_X_HANDLE || 'TheCruiseCH';
    
    if (!TWITTER_BEARER) {
      return NextResponse.json({ error: 'Twitter Bearer token not configured' }, { status: 500 });
    }

    // Fetch spaces from X API v2 for the community account and moderators
    const { data: mods } = await supabaseAdmin
      .from('moderators')
      .select('profiles!user_id(twitter_handle)')
      .in('role', ['admin','moderator']);

    const handles = [
      COMMUNITY_HANDLE,
      ...(mods || []).map((m: any) => m.profiles?.twitter_handle?.replace('@','')).filter(Boolean)
    ];

    let syncedCount = 0;

    for (const handle of handles) {
      try {
        // Get user ID from handle
        const userRes = await fetch(
          `https://api.twitter.com/2/users/by/username/${handle}?user.fields=id,name,username`,
          { headers: { Authorization: `Bearer ${TWITTER_BEARER}` } }
        );
        const userData = await userRes.json();
        if (!userData.data?.id) continue;

        // Get live spaces for this user
        const spacesRes = await fetch(
          `https://api.twitter.com/2/spaces/search?query=from:${handle}&space.fields=id,title,state,host_ids,created_at,scheduled_start,participant_count&expansions=host_ids&user.fields=name,username,profile_image_url`,
          { headers: { Authorization: `Bearer ${TWITTER_BEARER}` } }
        );
        const spacesData = await spacesRes.json();

        for (const space of spacesData.data || []) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('twitter_handle', `@${handle}`)
            .single();

          await supabaseAdmin.from('live_spaces').upsert({
            x_space_id: space.id,
            x_space_url: `https://twitter.com/i/spaces/${space.id}`,
            title: space.title || `${handle}'s Space`,
            status: space.state === 'live' ? 'live' : space.state === 'scheduled' ? 'scheduled' : 'ended',
            host_id: profile?.id || null,
            listener_count: space.participant_count || 0,
            scheduled_at: space.scheduled_start || null,
            started_at: space.state === 'live' ? new Date().toISOString() : null,
            source: 'x_sync',
            synced_at: new Date().toISOString(),
          }, { onConflict: 'x_space_id' });

          syncedCount++;
        }
      } catch (e) {
        console.error(`Failed to sync spaces for @${handle}:`, e);
      }
    }

    return NextResponse.json({ success: true, synced: syncedCount, handles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
