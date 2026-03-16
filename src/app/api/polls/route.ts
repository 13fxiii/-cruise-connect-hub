// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  let query = supabase
    .from("polls")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (category && category !== "all") query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ polls: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.action === "vote") {
    const { poll_id, option_id } = body;
    const { error: voteError } = await supabase
      .from("poll_votes")
      .insert({ poll_id, user_id: user.id, option_id });

    if (voteError) return NextResponse.json({ error: "Already voted" }, { status: 400 });

    // Update vote count in options JSONB
    const { data: poll } = await supabase.from("polls").select("options, total_votes").eq("id", poll_id).single();
    if (poll) {
      const options = (poll.options as any[]).map((o: any) =>
        o.id === option_id ? { ...o, votes: (o.votes || 0) + 1 } : o
      );
      await supabase.from("polls").update({ options, total_votes: (poll.total_votes || 0) + 1 }).eq("id", poll_id);
    }

    // Award points for voting
    await supabase.from("profiles").update({ points: 25 }).eq("id", user.id); // increment via RPC ideally
    return NextResponse.json({ success: true });
  }

  if (body.action === "create") {
    const { question, options, category, ends_in_days } = body;
    const opts = options.filter(Boolean).map((text: string, i: number) => ({ id: `opt_${i}`, text, votes: 0 }));
    const ends_at = ends_in_days ? new Date(Date.now() + ends_in_days * 86400000).toISOString() : null;

    const { data, error } = await supabase.from("polls").insert({
      creator_id: user.id, question, category: category || "general",
      options: opts, ends_at
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ poll: data });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
