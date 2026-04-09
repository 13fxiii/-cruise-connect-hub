# Cruise Connect Hub Deployment Guide (Vercel + Supabase Auth)

## Stack
- **Web App**: Next.js 14 (App Router + Route Handlers)
- **Auth**: Supabase Auth (Twitter/X OAuth)
- **Database**: Supabase Postgres
- **Hosting**: Vercel

---

## 1) Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. In **Settings → API**, copy:
   - Project URL
   - `anon` key
   - `service_role` key (keep private)
3. In **SQL Editor**, run the migration(s) in order:
   - `supabase/migrations/001_initial_schema.sql`
   - Any newer migrations in `supabase/migrations/` as needed
4. For common manual profile fixes (for example updating `display_name` / `twitter_handle`), run snippets from:
   - `supabase/sql/profile_updates.sql`
5. For a controlled fresh-data reset (content wipe + onboarding reset), use:
   - `supabase/sql/reset_app_data.sql`

---

## 2) Twitter/X OAuth (via Supabase)

### A) X Developer Portal
1. Create or open your X app in [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard).
2. Enable **OAuth 2.0** for a **Web App**.
3. Set callback URL based on your flow:
   - **App-managed PKCE (`/api/auth/x`, default in this repo):**
     - `https://YOUR_APP_DOMAIN/api/auth/x/callback`
   - **Supabase-managed callback flow:**
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
4. Set website + policy URLs (required by X for many apps):
   - Website: `https://cruise-connect-hub.vercel.app`
   - Terms of Service: `https://cruise-connect-hub.vercel.app/terms`
   - Privacy Policy: `https://cruise-connect-hub.vercel.app/privacy`
5. Copy your **Client ID** + **Client Secret**.

### B) Supabase Dashboard
1. Go to **Authentication → Providers → Twitter**.
2. Enable it and paste the X **Client ID** + **Client Secret**.
3. Go to **Authentication → URL Configuration**:
   - Site URL: `https://cruise-connect-hub.vercel.app`
   - Additional Redirect URLs (add both):
     - `https://cruise-connect-hub.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
   - Remove stale preview/branch URLs you no longer use to avoid redirect confusion.

---

## 3) Vercel Environment Variables

Set these in Vercel for **Production** (and Preview, if you use preview deploys):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (supports both legacy JWT `eyJ...` and new `sb_publishable_...`)
- `SUPABASE_SERVICE_ROLE_KEY` (required only for server-side admin actions)
- `NEXT_PUBLIC_APP_URL` (recommended for canonical URLs/metadata; set to your production domain)

Recommended auth + sync vars (if you use X integrations):
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `X_CLIENT_ID` / `X_CLIENT_SECRET` (accepted aliases)
- `TWITTER_BEARER_TOKEN` (required for `/api/spaces/sync`)
- `COMMUNITY_X_HANDLE` (defaults to `TheCruiseCH`)
- `CRON_SECRET` (protects cron/sync routes)

Optional AI community ingest route (`/api/community/seed-xai`):
- `XAI_API_KEY`
- `XAI_MODEL` (default: `grok-3-mini`)
- `COMMUNITY_X_URL` (default: `https://x.com/i/communities/1897164314764579242`)
- `COMMUNITY_SEED_AUTHOR_ID` (Supabase `profiles.id` UUID used as importer account)
- `COMMUNITY_SEED_AUTHOR_HANDLE` (alternative to UUID; resolve by `twitter_handle`/`username`)
  - Do **not** set this to a full `https://x.com/...` profile URL.

### Fast launch profile (CRUISE CONNECT HUB defaults)
Use these exact values to get a first production launch working quickly:
- `NEXT_PUBLIC_APP_URL=https://cruise-connect-hub.vercel.app`
- `COMMUNITY_X_HANDLE=TheCruiseCH`
- `COMMUNITY_SEED_AUTHOR_HANDLE=@TheCruiseCH` (or set `COMMUNITY_SEED_AUTHOR_ID` to a real profiles UUID)
- `NEXT_PUBLIC_CRUISE_CINEMA_URL=/cinema` (if using in-app cinema page route)

And ensure these are set with your real secrets/keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET` (or public-client flow config)
- `CRON_SECRET`
- `XAI_API_KEY` (only if using `/api/community/seed-xai`)

Private CCHP group controls:
- `CCHP_MEMBER_IDS` (comma-separated Supabase user UUIDs)
- `CCHP_MEMBER_HANDLES` (optional comma-separated X handles, with or without `@`)

Variables that are typically **not needed** in this app unless added by custom code:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`

### X actions now available in-app
After X OAuth connect, authenticated users can call:
- `POST /api/x/post` (post directly to X)
- `POST /api/x/poll` (create X polls)
- `POST /api/x/dm` (send DMs on X)

These routes use stored user OAuth tokens from `x_oauth_tokens` and auto-refresh expired access tokens using refresh tokens.

---

## 4) Deploy to Vercel

```bash
npm i -g vercel
vercel login

# link + first deploy
vercel

# production deploy
vercel --prod
```

---

## 5) Quick Verification Checklist

1. Open `/auth/login` and sign in with X.
2. Confirm you land on `/feed` and a hard refresh keeps you logged in.
3. If onboarding appears, complete it once and confirm it does not loop back after refresh.
4. Confirm `/privacy` and `/terms` load successfully.
