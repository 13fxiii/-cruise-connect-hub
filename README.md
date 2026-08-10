# 🚌 BIG CRUISE〽️ — BCH

The home of Naija culture online: community, Play, BIG CRUISE FM, entertainment, money features and X-connected community activities.

## Source of truth

- **Repository:** `13fxiii/BCH`
- **Default branch:** `main`
- **Production platform:** AppDeploy
- **Primary identity:** BIG CRUISE〽️ / BCH〽️
- **Community X handle:** `@BCHub_`
- **Community email:** `cruiseconnecthub@gmail.com`

GitHub is the source repository. AppDeploy is the application runtime, backend and production deployment. Do not reintroduce Vercel or Supabase as parallel application infrastructure.

## Architecture

### Frontend
- Next.js App Router
- React
- Tailwind CSS
- Lucide icons
- Mobile-first responsive UI

### Platform backend
AppDeploy is the canonical backend layer:

- AppDeploy Auth for user sessions and identity
- AppDeploy API/router for server endpoints
- AppDeploy Database for persistent application records
- AppDeploy Realtime for multiplayer rooms, live state and synchronized community events
- AppDeploy Storage for application assets/uploads where required
- AppDeploy Secrets for server-side credentials

### External integrations
External services are integrations, not application infrastructure. Current examples include X, Paystack/Flutterwave and approved media providers. Their credentials must live in AppDeploy Secrets or the appropriate provider connection — never in committed source.

## Development rules

1. Work from `main` or a clearly named feature branch.
2. Keep GitHub as the source repository and AppDeploy as the deployment target.
3. Do not add Vercel configuration, Vercel environment variables or Vercel deployment triggers.
4. Do not add new Supabase dependencies, clients, migrations or tables.
5. Existing Supabase code is legacy migration work. Remove it only after the corresponding AppDeploy API/database/auth replacement is verified.
6. Never commit `.env.local`, API tokens, OAuth secrets, payment secrets or service keys.
7. Frontend calls to BCH backend endpoints should use the AppDeploy client rather than direct `fetch`/axios calls where the AppDeploy SDK is available.
8. Protected backend routes must authenticate users and scope user-owned data by the authenticated AppDeploy user ID.
9. Realtime game state must be authoritative on the backend; never rely on local React state as the multiplayer source of truth.
10. Every production-facing change must pass build/QA checks before being treated as shipped.

## Environment

Use AppDeploy's environment/secrets system for production credentials. Keep only safe placeholders in `.env.example` for local development.

Core application settings:

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=/terms
NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy
COMMUNITY_X_HANDLE=BCHub_
COMMUNITY_X_URL=https://x.com/BCHub_
```

Server credentials such as X OAuth credentials, X API bearer tokens, Paystack/Flutterwave secrets, AI keys, cron secrets and admin secrets belong in AppDeploy Secrets.

## Product structure

### Phase 1 — Core
- X authentication
- BCH profile
- Cruise ID
- Persistent sessions
- Onboarding removed

### Phase 2 — Social
- Feed
- Posts
- Comments
- Likes
- Follows
- Notifications
- Messages
- X synchronization

### Phase 3 — Play
- Draw Am
- Who Dey Lie?
- Cruise Cards
- Ludo
- Trivia
- Word Guess
- Codenames
- Karaoke
- Spin Am
- Solo
- Cruise Bot
- Multiplayer lobbies
- Realtime rooms
- Tournaments
- BIG CRUISE Talent Hunt

### Phase 4 — Entertainment
- BIG CRUISE FM
- Artistes
- Music Room
- Spaces
- Movies

### Phase 5 — Money
- Wallet
- Gifts
- Merch
- Tournaments
- Sponsorships / Support Big Cruise
- Artiste applications

### Phase 6 — Community
- Daily themes
- MCM / WCW
- Throwback Thursday
- Polls
- Leaderboard
- Awards
- X publishing
- X Space detection
- Group-chat prompts

## UI direction

BCH should preserve the visual language of Cruise Connect Hub while evolving it into the BIG CRUISE〽️ identity:

- Matte black base
- Metallic/luxury gold community branding
- Supporting accent colours per feature
- Readable, compact typography — compact does not mean microscopic
- Four major bottom navigation destinations: **Home, Play, FM, Profile**
- Feature-specific screens stay isolated from unrelated feature content
- Home is the primary place for cross-feature suggestions and updates

## Legacy migration

Supabase and Vercel were part of the original Cruise Connect Hub architecture. They are being retired from BCH incrementally rather than deleted blindly. Any legacy module must first be replaced with its AppDeploy equivalent, verified, and then removed.

This repository should never return to a mixed Vercel/Supabase/AppDeploy production architecture.

## Security

- Never paste secrets into source files or commits.
- Never expose service-role credentials to the browser.
- Use AppDeploy Secrets for server-only credentials.
- Use authenticated backend routes for protected operations.
- Validate and authorize every admin/moderator action server-side.

## License

Private product code for BIG CRUISE〽️. All rights reserved.
