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

---

## 2) Twitter/X OAuth (via Supabase)

### A) X Developer Portal
1. Create or open your X app in [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard).
2. Enable **OAuth 2.0** for a **Web App**.
3. Set callback URL to your Supabase callback:
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

---

## 3) Vercel Environment Variables

Set these in Vercel for **Production** (and Preview, if you use preview deploys):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required only for server-side admin actions)
- `NEXT_PUBLIC_APP_URL` (recommended for canonical URLs/metadata; set to your production domain)

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
