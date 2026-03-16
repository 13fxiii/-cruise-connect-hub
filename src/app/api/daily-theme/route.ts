import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    
    const { data: theme } = await supabaseAdmin
      .from('daily_themes')
      .select('*')
      .eq('day_of_week', today)
      .eq('is_active', true)
      .single();

    // Get today's vote counts
    const { data: votes } = await supabaseAdmin
      .from('daily_votes')
      .select('nominee_id, profiles!nominee_id(username, display_name, avatar_url)')
      .eq('vote_date', new Date().toISOString().split('T')[0])
      .eq('category', 'mcm');

    // Tally votes
    const tally: Record<string, any> = {};
    (votes || []).forEach((v: any) => {
      const uid = v.nominee_id;
      if (!tally[uid]) tally[uid] = { count: 0, profile: v.profiles };
      tally[uid].count++;
    });

    const topVotes = Object.entries(tally)
      .map(([id, d]) => ({ id, ...d }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Get space topic suggestions for today
    const { data: topics } = await supabaseAdmin
      .from('space_topic_suggestions')
      .select('*')
      .or(`day_theme.eq.${today},day_theme.is.null`)
      .eq('is_active', true)
      .order('used_count', { ascending: true })
      .limit(5);

    return NextResponse.json({ theme, topVotes, topics, dayOfWeek: today });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch daily theme' }, { status: 500 });
  }
}
