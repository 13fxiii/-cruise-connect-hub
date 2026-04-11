// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    // Already checked in today?
    const { data: existing } = await supabaseAdmin
      .from('daily_checkins' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle();

    if (existing) return NextResponse.json({ error: 'Already checked in today', already: true }, { status: 400 });

    // Get profile for streak calc
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('current_streak, longest_streak, last_checkin, points')
      .eq('id', user.id)
      .maybeSingle();

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastCheckin = profile?.last_checkin;
    const currentStreak = lastCheckin === yesterday ? (profile?.current_streak || 0) + 1 : 1;
    const longestStreak = Math.max(currentStreak, profile?.longest_streak || 0);

    // Streak bonus points
    const basePoints = 10;
    const bonusPoints = currentStreak >= 30 ? 50 : currentStreak >= 14 ? 30 : currentStreak >= 7 ? 20 : currentStreak >= 3 ? 15 : 0;
    const totalPoints = basePoints + bonusPoints;

    // Record check-in
    await supabaseAdmin.from('daily_checkins' as any).insert({
      user_id: user.id,
      checkin_date: today,
      streak_day: currentStreak,
      points_earned: totalPoints,
    });

    // Update profile
    await supabaseAdmin.from('profiles').update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_checkin: today,
      points: (profile?.points || 0) + totalPoints,
    }).eq('id', user.id);

    return NextResponse.json({
      success: true,
      streak: currentStreak,
      longest_streak: longestStreak,
      points_earned: totalPoints,
      bonus: bonusPoints,
      message: currentStreak >= 7
        ? `🔥 ${currentStreak}-day streak! +${totalPoints} pts`
        : `✅ Checked in! +${totalPoints} pts`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    const [{ data: profile }, { data: todayCheckin }, { data: history }] = await Promise.all([
      supabaseAdmin.from('profiles').select('current_streak, longest_streak, last_checkin, points').eq('id', user.id).maybeSingle(),
      supabaseAdmin.from('daily_checkins' as any).select('id').eq('user_id', user.id).eq('checkin_date', today).maybeSingle(),
      supabaseAdmin.from('daily_checkins' as any).select('checkin_date, streak_day, points_earned').eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(30),
    ]);

    return NextResponse.json({
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      checked_in_today: !!todayCheckin,
      history: history || [],
      points: profile?.points || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
