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

Supabase and Vercel are legacy CCH infrastructure and must not remain required by the final BCH runtime. Legacy code is removed only after equivalent AppDeploy functionality exists and has been verified.

## Product phases

### Phase 1 — Core
- X-only authentication
- BCH profile and X avatar identity
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
- X synchronization
- Direct messages intentionally removed

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
- Marketplace intentionally removed

### Phase 6 — Community
- daily themes
- MCM/WCW
- Throwback Thursday
- leaderboard
- awards
- polls
- protected official X publishing
- X Space detection
- X group-chat prompts

## Product-surface cleanup completed
- Removed Admin dashboard product surface.
- Removed Marketplace pages and API routes.
- Removed Jobs board pages and API route.
- Removed direct-message pages, message API routes and BCH X-DM route.
- Primary mobile navigation is now exactly four destinations: Home, Play, FM, Profile.

## Runtime security boundary
Official X publishing remains protected server-side. Removing the Admin UI does not remove the authorization boundary or official-account secret handling required to safely publish announcements.

## Migration state
AppDeploy is the runtime target for Auth, Database, Realtime, Notifications, Storage, Secrets and AI. Historical Supabase SQL remains reference material until the final dependency audit confirms it can be archived safely.

## Safety rules
- Never commit `.env` or secret values.
- Never print secret values.
- Never expose service keys or OAuth secrets to the browser.
- Never execute destructive database migrations without an explicit migration plan and verification.
- Never claim X synchronization or AppDeploy deployment is working without testing it.
- Never reintroduce Supabase or Vercel as a runtime dependency for a BCH feature.