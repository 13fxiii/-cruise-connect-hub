# BCH〽️ Migration Status

## Source of truth

- Repository: `13fxiii/BCH`
- Working branch: `bch-sane-development`
- Target production app: `big-cruise-hub-m93cdn`
- Target deployment: AppDeploy
- Official X: `@BCHub_`
- Community: BIG CRUISE😂〽️
- Email: `cruiseconnecthub@gmail.com`

## Target architecture

`GitHub BCH source → AppDeploy runtime → live BCH〽️`

Supabase and Vercel are legacy CCH infrastructure. They must not remain required by the final BCH runtime. Legacy code is removed only after equivalent AppDeploy functionality exists and has been verified.

## Migration phases

### Phase 1 — Core

- X-only authentication
- BCH profile
- X avatar/profile identity
- CRUISE ID
- onboarding removal
- persistent sessions

### Phase 2 — Social

- Feed
- posts
- comments
- likes
- follows
- notifications
- messages
- X synchronization

### Phase 3 — Play

- Draw Am
- Who Dey Lie? (Mafia/Werewolf modes)
- Cruise Cards
- Ludo
- Trivia
- Spin Am
- Karaoke
- Word Guess
- Codenames
- Tournaments
- Big Cruise Talent Hunt
- solo play
- Cruise Bot
- multiplayer
- configurable lobby size

### Phase 4 — Entertainment

- BIG CRUISE FM
- Music Room
- Spaces
- Artistes
- Movies with legal in-app playback

### Phase 5 — Money

- Wallet
- gifts
- merch
- tournaments
- sponsorships / Support Big Cruise
- artiste applications
- remove Marketplace

### Phase 6 — Community

- daily themes
- MCM/WCW
- Throwback Thursday
- leaderboard
- awards
- X publishing
- X Space detection
- X group-chat prompts
- community notifications

## Current migration state

### AppDeploy runtime

The AppDeploy BCH runtime already uses AppDeploy Auth, Database, Realtime, Notifications, Storage, Secrets and AI. Social feeds, profiles, messages, notifications, games, Music Room, tournaments, artiste applications, X sync and official-admin publishing are implemented against the AppDeploy backend.

### Security

- Official X publishing is admin-only and uses `X_OFFICIAL_ACCESS_TOKEN` from AppDeploy Secrets.
- Normal BCH posts use the normal authenticated social-post endpoint and cannot publish through the official X account.
- Sensitive admin responses are not cached.
- OAuth state/PKCE cookies are host-only, HttpOnly and short-lived.
- No secret values are committed to the repository.

### Legacy source cleanup completed on `bch-sane-development`

- Removed the legacy `src/lib/supabase.ts` client/admin layer.
- Removed `src/lib/supabase/client.ts`.
- Removed `src/lib/supabase/server.ts`.
- Removed `src/lib/supabase/config.ts`.
- Removed `src/lib/supabase/middleware.ts`.
- Removed `src/lib/supabase/utils.ts` and `src/lib/supabase/schema.ts`.
- Removed the legacy Supabase auth callback at `src/app/auth/callback/route.ts`.
- Removed the legacy Supabase X OAuth callback at `src/app/api/auth/x/callback/route.ts`.
- Removed unused Supabase/NextAuth dependency declarations from `package.json`.

### Lockfile follow-up

`package-lock.json` still contains historical dependency entries from the pre-migration install. It must be regenerated with the current `package.json` by the repository's normal package-manager workflow before treating the source migration as dependency-clean. Do not manually delete arbitrary lockfile transitive entries.

### Legacy SQL/archive material

Historical `supabase/` SQL files and `supabase-schema.sql` remain as migration reference material for now. They are not part of the AppDeploy runtime. They should be archived or removed only after confirming no operational workflow still depends on them.

## Safety rules

- Never commit `.env` or secret values.
- Never print secret values.
- Never expose service keys or OAuth secrets to the browser.
- Never execute destructive database migrations without an explicit migration plan and verification.
- Never claim X synchronization or AppDeploy deployment is working without testing it.
- Never reintroduce Supabase or Vercel as a runtime dependency for a BCH feature.
