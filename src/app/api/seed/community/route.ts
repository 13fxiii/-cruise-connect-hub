// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_ID = '81341f73-3a9b-4f89-abcc-cf49c4f7ce20';
const XAI_API_KEY = process.env.XAI_API_KEY;
const COMMUNITY_ID = '1897164314764579242';

const NAIJA_SEED_POSTS = [
  { content: "We dey Cruise, we dey Connect & Grow 🚀🤝 Welcome to Cruise Connect Hub — your Naija community for music, culture, and real connections. Drop your handle below and let's vibe! 🇳🇬🔥", post_type: 'text' },
  { content: "Afrobeats is not just music — it's a movement 🌍🎵 From Lagos to London to LA, we're taking over. Name an Afrobeats song that changed your life 👇", post_type: 'text' },
  { content: "The CCH Karaoke room is LIVE 🎤🔥 Come show us your voice. No judgement, just vibes → /games/karaoke", post_type: 'text' },
  { content: "Real talk: Naija hustle hits different. Whether you're a creator, entrepreneur, or chasing your dream — you belong here. Drop your craft below 🙌", post_type: 'text' },
  { content: "🎯 Community challenge: Tag 3 people who need to join CCH. The more we grow, the more we win. #CruiseConnectHub #NaijaTwitter", post_type: 'text' },
  { content: "Music discovery thread 🎧 Drop an artist you think is underrated but absolutely fire. We're building the next big playlist 👇🔥", post_type: 'text' },
  { content: "Shoutout to every creative grinding in Nigeria rn 💪 The algorithm isn't always on your side but the community always is. What are you working on?", post_type: 'text' },
  { content: "Live Spaces tonight 🎙️ Topic: How do you balance creativity and income as a Naija artist in 2026? Come with your real talk → /spaces", post_type: 'text' },
  { content: "Weekend vibes check ✅ Where are you cruising this weekend? Drop your plans — let's see who's in the same city 🌆", post_type: 'text' },
  { content: "CCH Trivia TONIGHT 🧠⚡ Topic: Nigerian Music History. Do you know your classics? 9PM WAT → /games/trivia #CCHTrivia", post_type: 'text' },
  { content: "If you love discovering music before it blows, this is for you 👀🔥 @ThrillSeekaEnt is curating some CRAZY sounds right now. Don't sleep: linktr.ee/ThrillSeekerEnt 🎧", post_type: 'text' },
  { content: "CCH Mafia game tonight 🎭🔪 Who's joining? We need detectives, doctors, and villagers. 8PM WAT → /games/mafia", post_type: 'text' },
  { content: "Naija music is running the world rn and we're not talking about it enough. Burna, Wizkid, Davido, Rema, Asake... list goes on. Who's your GOAT? 🐐🇳🇬", post_type: 'text' },
  { content: "Community milestone unlocked: we're growing fast 📈 Every member brings energy, ideas, and culture. Thank you for being part of this. Let's keep building 🚀", post_type: 'text' },
  { content: "Drop your X handle below and let's follow each other 👇 Naija creators need to support Naija creators. Simple math 🤝", post_type: 'text' },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret');
  if (secret !== process.env.SEED_SECRET && secret !== 'cch-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'static';

  let postsToInsert: any[] = [];

  if (source === 'xai' && XAI_API_KEY) {
    try {
      const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [
            { role: 'system', content: 'Return ONLY valid JSON arrays. No markdown, no explanation.' },
            {
              role: 'user',
              content: `Search for recent posts from the X community "Cruise Connect Hub" (community ID ${COMMUNITY_ID}).
Return JSON array max 20 items: [{"content":"post text","post_type":"text","x_post_id":"id"}]
Focus on Naija culture, music, entertainment. Real posts only.`,
            },
          ],
          temperature: 0.1,
        }),
      });

      if (xaiRes.ok) {
        const xaiData = await xaiRes.json();
        const raw = xaiData.choices?.[0]?.message?.content || '[]';
        const xPosts = JSON.parse(raw.replace(/```json|```/g, '').trim());
        postsToInsert = xPosts.map((p: any) => ({
          author_id: ADMIN_ID,
          content: p.content,
          post_type: p.post_type || 'text',
          is_deleted: false,
          media_urls: [],
        }));
      }
    } catch (e) {
      console.error('[seed/community] xAI failed, using static:', e);
    }
  }

  if (postsToInsert.length === 0) {
    postsToInsert = NAIJA_SEED_POSTS.map(p => ({
      author_id: ADMIN_ID,
      content: p.content,
      post_type: p.post_type,
      is_deleted: false,
      media_urls: [],
    }));
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('posts')
    .insert(postsToInsert)
    .select('id, content');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ seeded: inserted?.length || 0, source: source === 'xai' && XAI_API_KEY ? 'xai' : 'static' });
}

export async function GET() {
  const { count } = await supabaseAdmin
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false);
  return NextResponse.json({ post_count: count || 0 });
}
