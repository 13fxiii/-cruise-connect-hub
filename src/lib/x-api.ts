import { supabaseAdmin } from "@/lib/supabase";

function getXClientCreds() {
  const clientId = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
  return { clientId, clientSecret };
}

export async function getUserXAccessToken(userId: string): Promise<string> {
  const xTokensTable = (supabaseAdmin as any).from("x_oauth_tokens");
  const { data: row, error } = await xTokensTable
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !row?.access_token) {
    throw new Error("X account not connected");
  }

  const expiresAtMs = row.expires_at ? new Date(row.expires_at).getTime() : null;
  const isExpired = expiresAtMs ? Date.now() > expiresAtMs - 60_000 : false;
  if (!isExpired) return row.access_token;

  if (!row.refresh_token) {
    throw new Error("X session expired. Please reconnect your X account.");
  }

  const { clientId, clientSecret } = getXClientCreds();
  if (!clientId) {
    throw new Error("X OAuth client configuration missing");
  }

  const refreshHeaders: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    refreshHeaders.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const refreshBody = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: row.refresh_token,
    ...(clientSecret ? {} : { client_id: clientId }),
  });

  const refreshRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: refreshHeaders,
    body: refreshBody,
  });

  const refreshJson = await refreshRes.json();
  if (!refreshRes.ok || !refreshJson?.access_token) {
    throw new Error("Failed to refresh X token. Please reconnect your X account.");
  }

  const refreshedExpiresAt = refreshJson.expires_in
    ? new Date(Date.now() + Number(refreshJson.expires_in) * 1000).toISOString()
    : null;

  await (supabaseAdmin as any)
    .from("x_oauth_tokens")
    .update({
      access_token: refreshJson.access_token,
      refresh_token: refreshJson.refresh_token || row.refresh_token,
      token_type: refreshJson.token_type || "bearer",
      scope: refreshJson.scope || null,
      expires_at: refreshedExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return refreshJson.access_token;
}
