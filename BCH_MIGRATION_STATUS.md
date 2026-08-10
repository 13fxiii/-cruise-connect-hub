# BCH〽️ Migration Status

## Source of truth

- Repository: `13fxiii/-cruise-connect-hub`
- Working branch: `bch-migration`
- Target production app: `big-cruise-hub-m93cdn`
- Target deployment: AppDeploy
- Official X: `@BCHub_`
- Community: BIG CRUISE😂〽️
- Email: `cruiseconnecthub@gmail.com`

## Target architecture

`GitHub BCH source → AppDeploy runtime → live BCH〽️`

Supabase and Vercel are legacy CCH infrastructure. They must not remain required by the final BCH runtime. Legacy code should be removed only after equivalent AppDeploy functionality is implemented and verified.

## Existing CCH systems identified

The repository already contains social routes, messages, notifications, profiles, wallet, spaces, games, leaderboard, merch, music, movies, admin/moderator tools, community ID, and numerous API routes. See `FEATURES_INVENTORY.md` for the current route inventory.

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

## Completed on bch-migration so far

- Created `bch-migration` from `main`.
- Updated root metadata/layout identity to BIG CRUISE〽️ / BCH〽️.
- Removed the Vercel Speed Insights runtime import from the root layout.
- Changed the default app URL fallback to the AppDeploy BCH URL.
- Updated PWA manifest identity to BIG CRUISE〽️ / BCH〽️.
- Changed the PWA Games shortcut label to Play.
- Added AppDeploy client/SDK dependencies for the migration.
- Added `appdeploy.auth-login.json` configured for X-only authentication.
- Reworked bottom navigation into a compact icon-first mobile navigation while retaining accessible labels through `aria-label`/`title`.

## Important legacy dependencies still present

The current code still contains Supabase authentication and data access. In particular, the existing auth helper and X-token helper use Supabase. These must be migrated before Supabase can be removed safely.

Do not run or apply legacy Supabase migrations as part of the BCH production migration.

## Repository rename

The connected GitHub tool currently does not expose a repository-settings rename operation. The repository can therefore be renamed manually in GitHub Settings without changing the code migration branch. After the rename, all future GitHub operations should use the new `owner/name`.

## Safety rules

- Never commit `.env` or secret values.
- Never print secret values.
- Never expose service keys or OAuth secrets to the browser.
- Never execute destructive database migrations without an explicit migration plan and verification.
- Never claim X synchronization or AppDeploy deployment is working without testing it.
