import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserXAccessToken } from "@/lib/x-api";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const text = String(body?.text || "").trim();
    if (!text) return NextResponse.json({ error: "Tweet text is required" }, { status: 400 });
    if (text.length > 280) return NextResponse.json({ error: "Tweet max length is 280 characters" }, { status: 400 });

    const accessToken = await getUserXAccessToken(userId);
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Failed to post on X", details: json }, { status: 502 });

    return NextResponse.json({ ok: true, tweet: json?.data || null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
