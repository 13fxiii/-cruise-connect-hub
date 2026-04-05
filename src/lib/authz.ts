export type UserLike = { id: string; email?: string | null } | null | undefined;

function parseCsv(input: string | undefined) {
  return (input || "")
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAdminAllowlist() {
  const ids = parseCsv(process.env.ADMIN_USER_IDS || process.env.ADMIN_USER_ID);
  const emails = parseCsv(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL).map((e) => e.toLowerCase());
  return {
    ids: new Set(ids),
    emails: new Set(emails),
    configured: ids.length > 0 || emails.length > 0,
  };
}

// Checks *only* the environment allowlist (no DB lookup).
export function isAdminAllowlisted(user: UserLike) {
  if (!user) return false;
  const allow = getAdminAllowlist();
  if (!allow.configured) return false;
  if (allow.ids.has(user.id)) return true;
  if (user.email && allow.emails.has(user.email.toLowerCase())) return true;
  return false;
}

// Checks allowlist first (if configured), otherwise falls back to profile flags.
export function isAdminUser(
  user: UserLike,
  profile?: { is_admin?: boolean | null; role?: string | null } | null
) {
  const allow = getAdminAllowlist();
  if (allow.configured) return isAdminAllowlisted(user);
  if (!user) return false;
  return Boolean(profile?.is_admin) || profile?.role === "admin";
}

