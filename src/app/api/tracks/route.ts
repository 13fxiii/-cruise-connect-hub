import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const genre = url.searchParams.get("genre");
  const featured = url.searchParams.get("featured") === "1";
  const search = url.searchParams.get("q");

  let query = supabase
    .from("tracks")
    .select("*")
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("plays", { ascending: false });

  if (genre && genre !== "all") query = query.eq("genre", genre);
  if (featured) query = query.eq("is_featured", true);
  if (search) query = query.or(`artist.ilike.%${search}%,title.ilike.%${search}%`);

  const { data, error } = await query.limit(30);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tracks: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { artist, title, twitter_handle, genre, spotify_url, apple_url, youtube_url, audiomack_url, linktree_url } = body;

  const { data, error } = await supabase.from("tracks").insert({
    submitter_id: user.id, artist, title, twitter_handle, genre,
    spotify_url: spotify_url || "", apple_url: apple_url || "",
    youtube_url: youtube_url || "", audiomack_url: audiomack_url || "",
    linktree_url: linktree_url || "", status: "pending"
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ track: data });
}
