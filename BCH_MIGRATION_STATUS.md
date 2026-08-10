# BCH〽️ Migration Status

## Source of truth

- Repository: `13fxiii/BCH`
- Working branch: `bch-live-reconciliation`
- Target production app: `big-cruise-hub-m93cdn`
- Target deployment: AppDeploy
- Official X: `@BCHub_`
- Community: BIG CRUISE😂〽️
- Email: `cruiseconnecthub@gmail.com`

## Target architecture

`GitHub BCH source → AppDeploy runtime → live BCH〽️`

Supabase and Vercel are legacy CCH infrastructure. They must not remain required by the final BCH runtime. Legacy code should be removed only after equivalent AppDeploy functionality is implemented and verified.

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

## Reconciliation completed on `bch-live-reconciliation`

- Reconciled AppDeploy-native profile creation and X identity sync.
- Added AppDeploy-native game room creation/joining.
- Added solo/bot/player room modes and configurable target player counts.
- Added Cruise Bot lobby filling and ready-state synchronization.
- Added realtime game-room subscriptions and game-room comments.
- Added Who Dey Lie? role/team lookup endpoints.
- Added AppDeploy social backend parity routes for feed, posts, likes, comments, follows, notifications and messages.
- Added realtime feed/comment/message notifications through the AppDeploy subscription bridge.
- Migrated the Play hub page away from the legacy Supabase profile lookup.
- Removed long game descriptions from the Play hub to keep the BCH compact UI dense and scannable.
- Preserved the CCH-derived game implementations already present in BCH, including drawing, Ludo, cards, trivia, karaoke, word guess, codenames, mafia, werewolf and tournaments.
- Legacy Supabase/Vercel code remains intentionally in place until the corresponding UI and backend paths are migrated and verified.

## Important legacy dependencies still present

The existing CCH UI may still contain legacy infrastructure files even when no active feature imports the Supabase client. These should be removed only after a full build/typecheck/deployment verification confirms they are unused.

Do not run or apply legacy Supabase migrations as part of the BCH production migration.

## Safety rules

- Never commit `.env` or secret values.
- Never print secret values.
- Never expose service keys or OAuth secrets to the browser.
- Never execute destructive database migrations without an explicit migration plan and verification.
- Never claim X synchronization or AppDeploy deployment is working without testing it.
