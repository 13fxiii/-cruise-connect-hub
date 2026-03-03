# 🚌 CRUISE & CONNECT HUB〽️ — COMPLETE APP DOCUMENTATION
## (For AI Collaboration / Feature Extension Brief)

---

## 🧭 OVERVIEW

**App Name:** Cruise & Connect Hub〽️  
**Tagline:** Where Community Meets Culture  
**Secondary CTA:** Cruise. Connect. Grow.  
**Founded by:** @13fxiii (Augustine Ajibola Fagbohun)  
**Community X Handle:** @CCHub_  
**Website (live):** https://cruise-connect-hub.netlify.app  
**GitHub Repo:** https://github.com/13fxiii/-cruise-connect-hub  
**Supabase Project:** xiyjgcoeljquryixmfut.supabase.co  

**Mission:** A unified community platform for Africans (Nigeria-first, global-ready) that replaces the need for multiple fragmented apps — combining live audio spaces, gaming, social media, e-commerce, music discovery, and real-money rewards into one hub.

**Target Audience:** Nigerian/African youth 18–35, creators, gamers, music lovers, entrepreneurs, community builders.

**Brand Colors:**  
- Primary: `#EAB308` (Yellow/Gold)  
- Background: `#0A0A0A` (Deep Black)  
- Secondary: `#18181B` (Zinc-900)  
- Text: `#FFFFFF` / `#A1A1AA` (Zinc-400)  

---

## 🏗️ TECH STACK

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase SSR Auth (email + planned X OAuth) |
| **Hosting** | Netlify (auto-deploy from GitHub main) |
| **Payments** | Paystack (Nigeria NGN payments) — planned |
| **File Storage** | Supabase Storage |
| **Icons** | Lucide React |

**Folder Structure:**
```
src/
├── app/
│   ├── page.tsx              ← Landing page
│   ├── layout.tsx            ← Root layout
│   ├── feed/page.tsx         ← Social feed
│   ├── spaces/page.tsx       ← Live audio spaces
│   ├── games/page.tsx        ← Games hub + leaderboard
│   ├── wallet/page.tsx       ← Wallet / earnings / withdraw
│   ├── ads/page.tsx          ← PR/ADS submission form
│   ├── profile/page.tsx      ← User profile
│   ├── music/page.tsx        ← Music hub (NEW)
│   ├── movies/page.tsx       ← Movie hub (NEW)
│   ├── shop/page.tsx         ← C&C Shop (NEW)
│   ├── jobs/page.tsx         ← Jobs board (NEW)
│   ├── admin/page.tsx        ← Admin dashboard
│   ├── auth/
│   │   ├── login/            ← Login page + form
│   │   └── signup/           ← Signup page + form
│   └── api/
│       ├── posts/route.ts    ← GET/POST posts
│       ├── posts/[id]/like/  ← Like/unlike endpoint
│       └── ads/route.ts      ← Ad submission endpoint
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        ← Top nav (sticky, responsive)
│   │   ├── MobileNav.tsx     ← Mobile bottom nav
│   │   └── SessionProvider.tsx
│   └── feed/
│       ├── PostCard.tsx      ← Post display component
│       └── CreatePost.tsx    ← Post creation form
├── lib/
│   ├── auth.ts               ← Supabase SSR auth helpers
│   ├── supabase.ts           ← Supabase admin client
│   └── supabase/
│       ├── client.ts         ← Browser client
│       ├── server.ts         ← Server client
│       └── middleware.ts     ← Auth middleware
└── types/
    └── database.ts           ← All TypeScript types
```

---

## 📊 DATABASE SCHEMA (Supabase PostgreSQL)

### Tables Currently Defined:

#### `profiles`
```sql
id           uuid (FK → auth.users)
username     text UNIQUE
display_name text
avatar_url   text
bio          text
twitter_handle text
role         enum: 'member' | 'mod' | 'admin'
points       int DEFAULT 0
created_at   timestamptz
updated_at   timestamptz
```

#### `posts`
```sql
id            uuid PRIMARY KEY
author_id     uuid FK → profiles
content       text
media_urls    text[]
tags          text[]
status        enum: 'published' | 'draft' | 'flagged'
likes_count   int DEFAULT 0
comments_count int DEFAULT 0
shares_count  int DEFAULT 0
is_pinned     bool DEFAULT false
created_at    timestamptz
updated_at    timestamptz
```

#### `post_likes`
```sql
id         uuid
post_id    uuid FK → posts
user_id    uuid FK → profiles
created_at timestamptz
```

#### `comments`
```sql
id         uuid
post_id    uuid FK → posts
author_id  uuid FK → profiles
content    text
likes_count int DEFAULT 0
created_at timestamptz
```

#### `ad_submissions`
```sql
id                uuid PRIMARY KEY
submitter_id      uuid FK → profiles (nullable)
brand_name        text
contact_name      text
contact_email     text
contact_phone     text
package           enum: 'day' | 'day_dual' | 'weekly' | 'monthly' | 'ambassador_3m' | 'ambassador_6m'
description       text
media_url         text
link_url          text
status            enum: 'pending' | 'approved' | 'rejected' | 'live' | 'expired'
starts_at         timestamptz
ends_at           timestamptz
amount_ngn        int
payment_reference text
payment_confirmed bool DEFAULT false
admin_notes       text
created_at        timestamptz
updated_at        timestamptz
```

### Tables Needed (New Features):

#### `spaces`
```sql
id               uuid PRIMARY KEY
host_id          uuid FK → profiles
title            text
description      text
status           enum: 'scheduled' | 'live' | 'ended'
listener_count   int DEFAULT 0
max_listeners    int DEFAULT 1000
tags             text[]
twitter_space_url text
scheduled_at     timestamptz
started_at       timestamptz
ended_at         timestamptz
created_at       timestamptz
```

#### `games`
```sql
id           uuid PRIMARY KEY
title        text
type         enum: 'trivia' | 'truth_dare' | 'polls' | 'tournament' | 'ludo'
status       enum: 'upcoming' | 'active' | 'ended'
entry_fee    int DEFAULT 0
prize_pool   int DEFAULT 0
max_players  int
player_count int DEFAULT 0
starts_at    timestamptz
ended_at     timestamptz
winner_id    uuid FK → profiles
created_at   timestamptz
```

#### `wallets`
```sql
id           uuid PRIMARY KEY
user_id      uuid FK → profiles UNIQUE
balance      int DEFAULT 0
total_earned int DEFAULT 0
total_spent  int DEFAULT 0
updated_at   timestamptz
```

#### `transactions`
```sql
id          uuid PRIMARY KEY
user_id     uuid FK → profiles
type        enum: 'gift_sent' | 'gift_received' | 'tournament_win' | 'referral' | 'withdrawal' | 'deposit' | 'ad_payment'
amount      int
description text
reference   text
status      enum: 'pending' | 'completed' | 'failed'
created_at  timestamptz
```

#### `tracks` (Music Hub)
```sql
id            uuid PRIMARY KEY
artist_id     uuid FK → profiles
title         text
artist_name   text
cover_url     text
audio_url     text  -- Supabase storage or external URL
spotify_url   text
apple_music_url text
youtube_url   text
soundcloud_url text
genre         text[]
play_count    int DEFAULT 0
like_count    int DEFAULT 0
is_featured   bool DEFAULT false
released_at   date
created_at    timestamptz
```

#### `movies` (Movie Hub)
```sql
id           uuid PRIMARY KEY
title        text
description  text
poster_url   text
trailer_url  text  -- YouTube embed
genre        text[]
year         int
rating       text  -- 'G' | 'PG' | '18+'
duration_min int
imdb_url     text
added_by     uuid FK → profiles
is_featured  bool DEFAULT false
watch_party_active bool DEFAULT false
current_space_id uuid FK → spaces (nullable)
created_at   timestamptz
```

#### `shop_items` (C&C Shop)
```sql
id           uuid PRIMARY KEY
seller_id    uuid FK → profiles
title        text
description  text
price_ngn    int
images       text[]
category     enum: 'merch' | 'digital' | 'service' | 'vendor' | 'food' | 'fashion'
stock        int DEFAULT -1  -- -1 = unlimited
sold_count   int DEFAULT 0
is_featured  bool DEFAULT false
is_active    bool DEFAULT true
whatsapp     text
instagram    text
created_at   timestamptz
```

#### `jobs`
```sql
id             uuid PRIMARY KEY
poster_id      uuid FK → profiles
title          text
company        text
description    text
type           enum: 'full_time' | 'part_time' | 'contract' | 'internship' | 'gig'
location       text  -- 'Remote' | 'Lagos' | etc.
salary_range   text
skills_required text[]
apply_url      text  -- external link OR in-app
apply_email    text
is_active      bool DEFAULT true
expires_at     timestamptz
created_at     timestamptz
```

#### `job_applications`
```sql
id          uuid PRIMARY KEY
job_id      uuid FK → jobs
applicant_id uuid FK → profiles
cover_note  text
portfolio_url text
status      enum: 'pending' | 'viewed' | 'shortlisted' | 'rejected'
created_at  timestamptz
```

---

## 📱 PAGES — CURRENT STATUS

### ✅ BUILT & LIVE

#### 1. `/` — Landing Page
- Hero section with animated headline "Cruise. Connect. Grow."
- Stats bar: 15K+ members, 200+ monthly spaces, ₦2M+ prizes, 5K+ games
- 4-feature grid (Spaces, Games, Wallet, PR/ADS)
- Community CTA section
- Footer with brand handles

#### 2. `/feed` — Social Feed
- Post creation form (text + media URLs)
- PostCard component with: like, comment count, share, pin (admin), flag (admin)
- Author avatar/name/twitter handle
- Admin moderation: pin posts, delete posts
- Sidebar: community stats, top members, recent ads
- Real-time Supabase fetch on load

#### 3. `/spaces` — Live Spaces
- 3 sections: Live Now, Scheduled, Recent/Ended
- SpaceCard component: host, tags, listener count, start time
- "Listen" CTA → links to X/Twitter Spaces URL
- Status badges: LIVE (animated pulse), UPCOMING, ENDED
- Direct integration: spaces link out to X Live Spaces

#### 4. `/games` — Games Hub
- Game cards with: type icon, status, entry fee, prize pool, player count bar
- Game types: Trivia, Truth or Dare, Ludo, Tournaments, Polls
- Leaderboard tab: ranked users with points + wins + podium icons (👑⭐🥉)
- "Join Now" CTA per game
- Prize pool display per game

#### 5. `/wallet` — Wallet
- Balance card: current balance, total earned, total spent
- 3 tabs: Overview, Transaction History, Withdraw
- Transaction history: type icons, amounts (green/red), descriptions
- Ways to Earn: Gifts, Wins, Referrals, Content
- Referral code display + copy button
- Withdraw form: bank name, account number, amount
- Minimum withdrawal: ₦2,000

#### 6. `/ads` — PR/ADS Submission
- Package selector (6 tiers): 1-Day ₦20K → 6-Month ₦1.5M
- Form: brand name, contact, description, link
- Paystack payment button (₦ amounts)
- Success state with payment instructions
- Card rate: 1-Day Dual ₦40K, Weekly ₦140K, Monthly ₦350K, 3M ₦750K, 6M ₦1.5M

#### 7. `/profile` — User Profile
- Banner + avatar + bio + stats
- Role badge (Admin/Mod/Member)
- Social stats: followers, points, wins, join date
- Badges collection: Founder, Tournament Winner, Space Host, etc.
- Recent posts list
- "Follow on X" button

#### 8. `/auth/login` + `/auth/signup`
- Email/password login via Supabase SSR
- Signup with display name + username + email + password
- Redirect to /feed on success
- Planned: X (Twitter) OAuth

#### 9. `/admin` — Admin Dashboard
- User management
- Post moderation
- Ad submissions review + approve/reject
- Role management

---

## 🆕 PAGES — NEWLY ADDED (Need Full Build)

### 6. `/music` — Music Hub
**Concept:** StationHead-style music discovery + artist showcase platform connected to live X Spaces. Artists upload/link their latest tracks. Community discovers new music while listening to live spaces.

**Features needed:**
- Featured track player (embedded audio player)
- Artist cards with: name, genre, track title, play button, links to Spotify/Apple Music/YouTube/SoundCloud
- "Now Playing in Space" — sync with active X Space so listeners can hear what's being played
- Genre filter tabs (Afrobeats, Amapiano, Hip-Hop, R&B, Gospel, Drill, Alte)
- Artist submission form: upload track or link + cover art + bio
- Charts: Top Tracks This Week (by plays/likes)
- "Submit Your Music" CTA — artists apply to be featured
- Integration: when a Space is live, show what track is queued/playing
- Saves/likes on tracks
- Share track to X button

**Data needs:** `tracks` table, `track_likes` table, `track_plays` table

---

### 7. `/movies` — Movie Hub
**Concept:** Community movie nights + watch party rooms. Members browse movies, vote on what to watch next, and watch trailers together while on a live X Space.

**Features needed:**
- Featured movie banner (poster + trailer embed)
- Movie grid: poster, title, year, genre, rating, duration
- Watch Party mode: when Space is live, host can "queue" a movie — members watch trailer simultaneously via YouTube embed while listening on Space
- Weekly "Movie Night" vote: community votes on next movie (linked to Games/Polls system)
- Genre filter: Action, Comedy, Nollywood, Thriller, Romance, Documentary
- Movie detail modal: full description, trailer, IMDb link, streaming links (Netflix/Prime/etc.)
- "Add a Movie" — community members can suggest films
- "Tonight's Pick" badge for scheduled watch party

**Data needs:** `movies` table, `movie_votes` table

---

### 8. `/shop` — C&C Shop
**Concept:** Community marketplace combining: (1) Official C&C merch store, (2) Vendor/business directory for SMEs to advertise, (3) Creator product store.

**Features needed:**

**MERCH TAB:**
- Official C&C Hub branded merch (Design A, Design B t-shirts — already designed)
- Product grid: image, title, price, "Order" → WhatsApp/link
- Limited edition drops with countdown timer

**VENDOR TAB:**
- Business listings: business name, description, logo, category, contact
- Categories: Food & Drinks, Fashion, Tech, Beauty, Services, Digital
- "Advertise Your Business" form (free listing for members, paid featured spots)
- Vendor card: name, category, short desc, contact links (WhatsApp, Instagram, X)

**ARTIST STORE TAB:**
- Merch from community artists/creators
- Link to their external store (Paystack store / Selar / Flutterwave)

**Data needs:** `shop_items` table, `vendors` table

---

### 9. `/jobs` — Jobs Board
**Concept:** Community-powered job board. Members can both post jobs AND apply for jobs. Covers full-time, gigs, internships, collabs.

**Features needed:**

**JOB LISTINGS:**
- Job cards: title, company, location, type badge, salary, skills, posted date
- Filter by: type (Full-time/Part-time/Gig/Remote), skill, location
- Job detail: full description, requirements, apply button
- Apply in-app: cover note + portfolio link → stored in DB
- Apply externally: link to company site/email

**POST A JOB:**
- Form: title, company, description, type, location, salary range, skills required, contact/link
- Free for community members, paid for featured placement
- 30-day listing by default

**MY APPLICATIONS:**
- Track status of applications (Pending / Viewed / Shortlisted / Rejected)

**Data needs:** `jobs` table, `job_applications` table

---

## 💰 MONETIZATION MODEL

| Stream | Description | Pricing |
|--------|-------------|---------|
| **PR/ADS** | Brand advertising in community | ₦20K–₦1.5M |
| **Featured Listings** | Featured shops/jobs/music | TBD per feature |
| **Tournament Entry** | Game entry fees | ₦200–₦2,000 |
| **Premium Membership** | Ad-free + exclusive features | TBD |
| **Transaction Fee** | % on withdrawals | 1–2% |
| **Ambassador Deals** | Brand partnerships | ₦750K–₦1.5M |
| **Shop Commission** | % on vendor sales | 5–10% |

---

## 🔗 KEY INTEGRATIONS

| Integration | Purpose | Status |
|------------|---------|--------|
| **X/Twitter Spaces** | Live audio rooms (linked, not embedded) | ✅ Active |
| **Supabase** | Database + Auth + Storage | ✅ Active |
| **Paystack** | Nigerian payments (NGN) | 🔄 Planned |
| **Spotify/Apple Music** | Music track embeds | 🔄 Planned |
| **YouTube** | Trailer/video embeds | 🔄 Planned |
| **WhatsApp** | Vendor/shop contact | 🔄 Via link |
| **X OAuth** | Social login | 🔄 Planned |

---

## 🎨 DESIGN SYSTEM

**Component Conventions:**
```tsx
// Primary button
<button className="bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors">

// Secondary button
<button className="bg-zinc-900 border border-zinc-700 text-white px-6 py-3 rounded-full hover:border-yellow-400/50">

// Card
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-yellow-400/30 transition-all">

// Status badge LIVE
<span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full">

// Gold highlight
<span className="text-yellow-400 font-bold">

// Page header
<h1 className="text-3xl font-black text-white flex items-center gap-3">

// Section background
"min-h-screen bg-[#0a0a0a]"
```

**Typography:**
- Headings: `font-black` (900 weight)
- Body: `text-zinc-300` / `text-zinc-400`
- Gold accents: `text-yellow-400`
- All text on dark: white/zinc on `#0a0a0a` background

---

## 🚀 DEPLOYMENT

- **Platform:** Netlify
- **Auto-deploy:** On push to `main` branch of GitHub
- **Build command:** `npm run build`
- **Publish dir:** `.next`
- **Node version:** 18.x

**Environment Variables needed in Netlify:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xiyjgcoeljquryixmfut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
NEXT_PUBLIC_APP_URL=https://cruise-connect-hub.netlify.app
PAYSTACK_SECRET_KEY=[when ready]
```

---

## 📋 FEATURE PRIORITY BACKLOG

### P0 — Critical (Core Loop)
- [ ] X OAuth login (one-click sign in with Twitter)
- [ ] Paystack payment integration (ads, games, shop)
- [ ] Real-time listener count on Spaces (Supabase Realtime)
- [ ] Music Hub full implementation
- [ ] Movie Hub full implementation
- [ ] C&C Shop full implementation
- [ ] Jobs Board full implementation

### P1 — High Value
- [ ] In-app audio player (track playback)
- [ ] Watch party sync (YouTube embed in Space)
- [ ] Tournament bracket system (Ludo/Trivia live play)
- [ ] Push notifications (new Space, game starting)
- [ ] Mobile PWA config (installable app)
- [ ] Dark/Light mode toggle

### P2 — Growth
- [ ] Referral tracking system
- [ ] Community challenges/quests
- [ ] NFT merch drops (optional, future)
- [ ] Creator analytics dashboard
- [ ] Weekly digest email

### P3 — Scale
- [ ] Mobile app (React Native / Expo)
- [ ] X API integration (pull tweets, post from hub)
- [ ] AI recommendations (music, jobs, content)
- [ ] Multi-currency support (GHS, ZAR, KES)

---

## 🧩 PROMPT FOR CHATGPT / OTHER AI

> **Context:** I'm building Cruise & Connect Hub〽️ — a Next.js 14 community platform (TypeScript, Tailwind CSS, Supabase backend, deployed on Netlify). The app is live at https://cruise-connect-hub.netlify.app.
>
> **Brand:** Black (#0a0a0a) + Gold (#EAB308) color scheme. All pages use dark backgrounds, yellow-400 accents, rounded cards, glassmorphism touches.
>
> **Task:** Help me build [FEATURE NAME] as a new Next.js page at `/[route]`. 
>
> The page must:
> - Match existing design system (black bg, yellow-400 accents, zinc-900 cards, rounded-2xl, font-black headings)
> - Use "use client" if it needs useState/hooks, or be a server component if it's static/fetched
> - Import Navbar from `@/components/layout/Navbar`
> - Use Lucide React icons
> - Be fully functional with mock data (we'll wire to Supabase later)
> - Be mobile-responsive with Tailwind
> - Follow this component pattern: [paste relevant existing page code]

---

*Last updated: March 2026 | Built by @13fxiii | Community: @CCHub_*
