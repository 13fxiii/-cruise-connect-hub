import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserXAccessToken } from "@/lib/x-api";

async function resolveRecipientId(accessToken: string, username: string): Promise<string> {
  const clean = username.replace(/^@/, "");
  const res = await fetch(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(clean)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok || !json?.data?.id) {
    throw new Error("Recipient not found on X");
  }
  return json.data.id;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const recipientUsername = String(body?.recipient_username || "").trim();
    const text = String(body?.text || "").trim();
    if (!recipientUsername || !text) {
      return NextResponse.json({ error: "recipient_username and text are required" }, { status: 400 });
    }

    const accessToken = await getUserXAccessToken(userId);
    const recipientId = await resolveRecipientId(accessToken, recipientUsername);

    const res = await fetch(`https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Failed to send DM on X", details: json }, { status: 502 });

    return NextResponse.json({ ok: true, message: json?.data || null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
