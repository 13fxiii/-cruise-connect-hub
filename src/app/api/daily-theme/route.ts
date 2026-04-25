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
        .eq('is_active', true);
      
      if (usedIds.length > 0) {
        candidates = (candidates || []).filter(c => !usedIds.includes(c.id));
      }

      // Fallback: any active theme if no day-specific ones or all used
      if (!candidates || candidates.length === 0) {
        const { data: anyDay } = await supabaseAdmin
          .from('daily_theme_pool')
          .select('*')
          .eq('is_active', true);
        
        candidates = anyDay || [];
        if (usedIds.length > 0) {
          candidates = candidates.filter(c => !usedIds.includes(c.id));
        }
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

    return NextResponse.json({ 
      theme, 
      dayOfWeek, 
      date: today,
      announcements: [
        { id: 1, text: "Welcome to the new Cruise Connect Hub〽️! 🚌", type: "system" },
        { id: 2, text: "Awards 2026 tracking is now LIVE! 🏆", type: "update" }
      ]
    });
  } catch (err: any) {
    console.error('Daily theme error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
