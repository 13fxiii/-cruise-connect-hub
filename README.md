# 🚌 Cruise & Connect Hub〽️ — Deploy Guide

## Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend/DB**: Supabase (Auth + Postgres + Storage + Realtime)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

---

## Phase 1 Checklist: Auth + Feed + PR/ADS

### Step 1: Supabase Setup

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** → Run `/supabase/schema.sql`
3. Go to **Authentication → Providers**:
   - Enable **Twitter/X** provider
   - Add Twitter API Key + Secret from https://developer.twitter.com
   - Set callback URL: `https://YOUR_DOMAIN.com/auth/callback`
4. Go to **Storage** → Create 3 buckets:
   - `avatars` (Public, 2MB max)
   - `post-media` (Public, 10MB max)
   - `pr-assets` (Public, 50MB max)
5. Copy your **Project URL** and **Anon Key** from Settings → API

### Step 2: Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
NEXT_PUBLIC_APP_URL=https://cruiseconnect.hub
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=https://cruiseconnect.hub/terms
NEXT_PUBLIC_PRIVACY_POLICY_URL=https://cruiseconnect.hub/privacy
```

### Step 3: Local Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_TERMS_OF_SERVICE_URL
vercel env add NEXT_PUBLIC_PRIVACY_POLICY_URL

# Deploy to production
vercel --prod
```

If you also build from GitHub Actions, mirror these in GitHub Actions secrets:
```bash
gh secret set NEXT_PUBLIC_TERMS_OF_SERVICE_URL --body "https://cruiseconnect.hub/terms"
gh secret set NEXT_PUBLIC_PRIVACY_POLICY_URL --body "https://cruiseconnect.hub/privacy"
```

### Step 5: Twitter/X OAuth Final Config
1. In Twitter Developer Console, add:
   - Website: `https://yourdomain.vercel.app`
   - Callback URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
2. In Supabase → Auth → Providers → Twitter:
   - Enable & paste API Key + Secret

---

## Folder Structure

```
cruise-connect/
├── src/
│   ├── app/
│   │   ├── (app)/          # App routes (with sidebar)
│   │   │   ├── feed/       # Community feed
│   │   │   ├── pr-ads/     # PR/ADS listing + submit
│   │   │   └── layout.tsx  # Sidebar layout
│   │   ├── auth/           # Auth pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── callback/   # OAuth callback
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── layout/         # Sidebar, MobileNav
│   │   └── ui/             # PostCard, ComposePost
│   ├── lib/
│   │   └── supabase/       # Client, Server, Middleware
│   ├── middleware.ts        # Route protection
│   └── types/
│       └── database.ts     # TypeScript types
├── supabase/
│   └── schema.sql          # Full DB schema with RLS
└── .env.example            # Environment template
```

---

## Revenue: PR/ADS Module

Campaigns submitted → stored in `pr_ads` table → you review in Supabase dashboard → approve/reject.

**Pricing auto-set by campaign type:**
| Type | Price (₦) |
|------|-----------|
| 1 Day | 20,000 |
| 1 Day Dual | 40,000 |
| Weekly | 140,000 |
| Monthly | 350,000 |
| 3-Month Ambassador | 750,000 |
| 6-Month Ambassador | 1,500,000 |

---

## Phase 2 (Next): Spaces + Wallet + Leaderboard
## Phase 3: Games + Mobile App (React Native)
