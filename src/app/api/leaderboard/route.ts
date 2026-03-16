// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, points, level")
    .eq("is_admin", false)
    .order("points", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ranked = (data || []).map((p, i) => ({ ...p, rank: i + 1 }));
  return NextResponse.json({ leaderboard: ranked });
}
