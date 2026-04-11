// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay(); // 0-6

    // Check if today already has a theme assigned
    const { data: existing } = await supabaseAdmin
      .from('daily_theme_log')
      .select('*, daily_theme_pool(*)')
      .eq('used_date', today)
      .maybeSingle();

    let theme: any;

    if (existing && (existing as any).daily_theme_pool) {
      theme = (existing as any).daily_theme_pool;
    } else {
      // Pick a random theme — prefer day_hint matching today, fallback to any
      // Get recently used themes (last 14 days) to avoid repeats
      const { data: recentLogs } = await supabaseAdmin
        .from('daily_theme_log')
        .select('theme_id')
        .gte('used_date', new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]);

      const usedIds = (recentLogs || []).map((l: any) => l.theme_id);

      // Try to get a day-matching theme first
      let { data: candidates } = await supabaseAdmin
        .from('daily_theme_pool')
        .select('*')
        .eq('day_hint', dayOfWeek)
        .eq('is_active', true)
        .not('id', 'in', usedIds.length > 0 ? `(${usedIds.map((id: string) => `'${id}'`).join(',')})` : "('')");

      // Fallback: any day theme if no day-specific ones
      if (!candidates || candidates.length === 0) {
        const { data: anyDay } = await supabaseAdmin
          .from('daily_theme_pool')
          .select('*')
          .is('day_hint', null)
          .eq('is_active', true)
          .not('id', 'in', usedIds.length > 0 ? `(${usedIds.map((id: string) => `'${id}'`).join(',')})` : "('')");
        candidates = anyDay || [];
      }

      // Last resort: use any theme even if recently used
      if (!candidates || candidates.length === 0) {
        const { data: anyTheme } = await supabaseAdmin
          .from('daily_theme_pool')
          .select('*')
          .eq('is_active', true)
          .limit(10);
        candidates = anyTheme || [];
      }

      // Weighted random selection
      if (candidates && candidates.length > 0) {
        const totalWeight = candidates.reduce((sum: number, t: any) => sum + (t.weight || 1), 0);
        let rand = Math.random() * totalWeight;
        theme = candidates[0];
        for (const candidate of candidates) {
          rand -= (candidate.weight || 1);
          if (rand <= 0) { theme = candidate; break; }
        }

        // Log today's theme
        if (theme) {
          await supabaseAdmin.from('daily_theme_log').upsert({
            theme_id: theme.id,
            used_date: today,
          }, { onConflict: 'used_date' });
        }
      }
    }

    // Get today's vote counts for MCM/WCW
    const { data: votes } = await supabaseAdmin
      .from('daily_votes')
      .select('nominee_id, profiles!nominee_id(username, display_name, avatar_url)')
      .eq('vote_date', today);

    const tally: Record<string, any> = {};
    (votes || []).forEach((v: any) => {
      const uid = v.nominee_id;
      if (!tally[uid]) tally[uid] = { count: 0, profile: (v as any).profiles };
      tally[uid].count++;
    });
    const topVotes = Object.entries(tally)
      .map(([id, d]) => ({ id, ...(d as any) }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Space topic suggestions for today
    const { data: topics } = await supabaseAdmin
      .from('space_topic_suggestions')
      .select('*')
      .or(`day_theme.eq.${dayOfWeek},day_theme.is.null`)
      .eq('is_active', true)
      .order('used_count', { ascending: true })
      .limit(5);

    return NextResponse.json({ theme, topVotes, topics: topics || [], dayOfWeek, date: today });
  } catch (err: any) {
    console.error('Daily theme error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
