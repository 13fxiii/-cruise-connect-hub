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
    const options = Array.isArray(body?.options) ? body.options.map((o: any) => String(o || "").trim()).filter(Boolean) : [];
    const durationMinutes = Number(body?.duration_minutes || 1440);

    if (!text) return NextResponse.json({ error: "Poll text is required" }, { status: 400 });
    if (options.length < 2 || options.length > 4) {
      return NextResponse.json({ error: "Poll options must be between 2 and 4" }, { status: 400 });
    }

    const accessToken = await getUserXAccessToken(userId);
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        poll: {
          options,
          duration_minutes: Math.min(Math.max(durationMinutes, 5), 10080),
        },
      }),
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Failed to create poll on X", details: json }, { status: 502 });

    return NextResponse.json({ ok: true, poll: json?.data || null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
