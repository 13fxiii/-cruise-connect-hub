import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type XaiCommunityPost = {
  content: string;
  author_handle?: string;
  post_url?: string;
  posted_at?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveSeedAuthorId(rawValue: string): Promise<string | null> {
  const value = rawValue.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return null;
  if (UUID_RE.test(value)) return value;

  const normalizedHandle = value.startsWith("@") ? value : `@${value}`;
  const { data: byHandle } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("twitter_handle", normalizedHandle)
    .maybeSingle();
  if (byHandle?.id) return byHandle.id;

  const username = normalizedHandle.replace(/^@/, "");
  const { data: byUsername } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return byUsername?.id || null;
}

function extractJsonArray(raw: string): XaiCommunityPost[] {
  const trimmed = raw.trim();
  const normalized = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
    : trimmed;
  const parsed = JSON.parse(normalized);
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "cchub-cron-2026";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const xaiApiKey = process.env.XAI_API_KEY;
    const seedAuthorRaw = process.env.COMMUNITY_SEED_AUTHOR_ID || process.env.COMMUNITY_SEED_AUTHOR_HANDLE;
    const communityUrl =
      process.env.COMMUNITY_X_URL || "https://x.com/i/communities/1897164314764579242";
    const model = process.env.XAI_MODEL || "grok-3-mini";

    if (!xaiApiKey) {
      return NextResponse.json({ error: "XAI_API_KEY is missing" }, { status: 500 });
    }
    if (!seedAuthorRaw) {
      return NextResponse.json(
        { error: "COMMUNITY_SEED_AUTHOR_ID (UUID) or COMMUNITY_SEED_AUTHOR_HANDLE (@handle) is missing" },
        { status: 500 }
      );
    }

    const seedAuthorId = await resolveSeedAuthorId(seedAuthorRaw);
    if (!seedAuthorId) {
      return NextResponse.json(
        {
          error:
            "Could not resolve seed author. Set COMMUNITY_SEED_AUTHOR_ID to a profiles.id UUID or COMMUNITY_SEED_AUTHOR_HANDLE to a valid @handle (do not use an X profile URL).",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit || 10), 1), 25);
    const dryRun = Boolean(body?.dryRun);

    const prompt = [
      "You are collecting live community feed posts.",
      `Fetch up to ${limit} recent posts from this X community URL: ${communityUrl}.`,
      "Return ONLY a JSON array with this exact shape:",
      '[{"content":"string","author_handle":"@handle","post_url":"https://x.com/...","posted_at":"ISO-8601"}]',
      "Rules:",
      "- content must be plain text summary from the post, max 400 chars",
      "- keep author_handle empty string if unknown",
      "- keep post_url empty string if unknown",
      "- do not include markdown or commentary",
    ].join("\n");

    const xaiRes = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!xaiRes.ok) {
      const errorBody = await xaiRes.text();
      return NextResponse.json(
        { error: "xAI request failed", status: xaiRes.status, details: errorBody.slice(0, 800) },
        { status: 502 }
      );
    }

    const xaiJson = await xaiRes.json();
    const raw = xaiJson?.choices?.[0]?.message?.content || "[]";
    const items = extractJsonArray(raw)
      .filter((item) => typeof item?.content === "string" && item.content.trim().length > 0)
      .slice(0, limit);

    if (dryRun) {
      return NextResponse.json({ ok: true, dryRun: true, items });
    }

    let inserted = 0;
    const insertedRows: { id: string; content: string }[] = [];

    for (const item of items) {
      const cleanContent = item.content.trim().slice(0, 1800);
      const footerParts = [item.author_handle, item.post_url].filter(Boolean);
      const footer = footerParts.length ? `\n\nSource: ${footerParts.join(" • ")}` : "";
      const content = `${cleanContent}${footer}`.trim();

      // Prevent duplicate inserts for identical content.
      const { data: existing } = await supabaseAdmin
        .from("posts")
        .select("id")
        .eq("content", content)
        .limit(1)
        .maybeSingle();
      if (existing?.id) continue;

      const { data, error } = await supabaseAdmin
        .from("posts")
        .insert({
          author_id: seedAuthorId,
          content,
          tags: ["x-community", "xai-sync"],
        })
        .select("id, content")
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed inserting posts", details: error.message, inserted },
          { status: 500 }
        );
      }
      inserted++;
      insertedRows.push(data);
    }

    return NextResponse.json({
      ok: true,
      fetched: items.length,
      inserted,
      posts: insertedRows,
      communityUrl,
      model,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
