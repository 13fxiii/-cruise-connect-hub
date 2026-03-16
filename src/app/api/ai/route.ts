import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

const TOOL_PROMPTS: Record<string, (context: string) => string> = {
  caption: (c) => `You are a social media expert for Cruise Connect Hub, a Nigerian community platform. Write 3 engaging X (Twitter) captions for: "${c}". Each should be punchy, use Nigerian slang where natural, include 2-3 relevant emojis, and end with relevant hashtags. Format: numbered list.`,
  post_idea: (c) => `Generate 5 creative post ideas for a Cruise Connect Hub member about: "${c}". Make them engaging, culturally relevant to Nigeria, and designed to spark community interaction. Format: numbered list with brief description.`,
  bio: (c) => `Write 3 compelling social media bio options for someone who is: "${c}". Make each bio punchy (max 160 chars), personality-driven, and community-focused. Format: numbered list.`,
  hashtags: (c) => `Generate 20 relevant, trending hashtags for content about: "${c}". Mix Nigerian community tags, topic tags, and CC Hub tags. Return as a space-separated list starting with #.`,
  thread: (c) => `Write a compelling 5-tweet thread about: "${c}". Make it informative, engaging, with a strong hook in tweet 1. Format: Tweet 1: ... Tweet 2: ... etc.`,
  space_intro: (c) => `Write a dynamic live space intro script for: "${c}". Should be energetic, 30-60 seconds when spoken, hype the topic and welcome listeners. Include [PAUSE] markers.`,
  promo_copy: (c) => `Write 3 promotional copy variations for: "${c}". Optimised for Nigerian market, action-oriented, culturally resonant. Include a CTA in each.`,
  merch_description: (c) => `Write an exciting product description for CC Hub merchandise: "${c}". Should be vibrant, community-focused, make people want to buy. 2-3 sentences.`,
  dm_template: (c) => `Write 3 professional yet friendly DM templates for: "${c}". Appropriate for Nigerian business culture, not spammy, personalizable. Format: numbered.`,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tool_type, prompt } = await req.json();
    if (!tool_type || !prompt) return NextResponse.json({ error: 'tool_type and prompt required' }, { status: 400 });

    const systemPrompt = TOOL_PROMPTS[tool_type];
    if (!systemPrompt) return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 });

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI service not configured. Add ANTHROPIC_API_KEY to Vercel env vars.' }, { status: 503 });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: systemPrompt(prompt) }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI generation failed');
    }

    const data = await response.json();
    const result = data.content?.[0]?.text || '';
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;

    // Save to history
    await supabaseAdmin.from('ai_generations').insert({
      user_id: user.id,
      tool_type,
      prompt,
      result,
      tokens_used: tokensUsed,
    });

    return NextResponse.json({ result, tokens_used: tokensUsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const saved = searchParams.get('saved') === '1';

    const query = supabaseAdmin
      .from('ai_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (saved) query.eq('is_saved', true);

    const { data } = await query;
    return NextResponse.json({ generations: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
