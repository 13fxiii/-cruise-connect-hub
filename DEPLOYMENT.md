# 🚀 Cruise & Connect Hub — Phase 1 Deployment Guide

## Stack
- **Frontend/Backend**: Next.js 14 (App Router + API Routes)
- **Auth**: NextAuth v5 (X/Twitter OAuth + Magic Link Email)
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Hosting**: Vercel
- **DNS**: Vercel / Cloudflare

---

## 🏗️ Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `cruise-connect-hub`
3. Copy your **Project URL** and **anon key** and **service_role key** from Settings > API
4. Open **SQL Editor** and paste + run the file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
5. Verify tables created: `profiles`, `posts`, `post_likes`, `comments`, `ad_submissions`

---

## 🔐 Step 2: Twitter/X OAuth

1. Go to [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
2. Create new App → **User Authentication Settings**
3. Set:
   - **App permissions**: Read
   - **Type**: Web App
   - **Callback URL**: `https://your-domain.com/api/auth/callback/twitter`
   - Also add: `http://localhost:3000/api/auth/callback/twitter` (for dev)
4. Copy **Client ID** and **Client Secret**

---

## 📧 Step 3: Resend (Email Magic Links)

1. Go to [resend.com](https://resend.com) → Get API key
2. Add your domain or use their sandbox for testing
3. Copy the API key

---

## ⚡ Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# From project root:
vercel

# Follow prompts, then add env vars:
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add TWITTER_CLIENT_ID
vercel env add TWITTER_CLIENT_SECRET
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_TERMS_OF_SERVICE_URL
vercel env add NEXT_PUBLIC_PRIVACY_POLICY_URL
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM

# Deploy to production
vercel --prod
```

> Generate NEXTAUTH_SECRET: `openssl rand -base64 32`

---

## 🔧 Step 5: Set Admin Role

After your first login, open Supabase SQL editor and run:

```sql
-- Replace with your user ID from auth.users table
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

Access admin dashboard at `/admin`

---

## 🧪 Local Development

```bash
# Clone and install
npm install

# Copy env vars
cp .env.example .env.local
# Fill in all values

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## 📈 Phase 1 Features Shipped

| Feature | Status |
|---------|--------|
| X (Twitter) OAuth Login | ✅ |
| Email Magic Link Login | ✅ |
| Community Feed | ✅ |
| Create Posts | ✅ |
| Like / React to Posts | ✅ |
| Pinned Posts | ✅ |
| PR/ADS Submission Form | ✅ |
| Ad Package Pricing (₦20K–₦1.5M) | ✅ |
| Admin Dashboard | ✅ |
| Ad Status Management | ✅ |
| RLS Security (Supabase) | ✅ |
| Points System (Triggers) | ✅ |
| Mobile Responsive | ✅ |

---

## 🚢 Phase 2 (Next Sprint)

- Spaces (Audio rooms via Agora)
- User profiles + leaderboard
- Wallet (Paystack integration)
- Comments thread
- Notifications system
- Share to X integration

---

## 💰 Revenue Flow

```
User visits /ads
  → Selects package (₦20K–₦1.5M)
  → Fills form
  → Submission saved to DB
  → You get notified
  → Review in /admin
  → Approve → confirm payment → go live
```
