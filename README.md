# 🚌 BIG CRUISE〽️ / BCH

> The community app for BIG CRUISE😂〽️ — social, games, entertainment, community activities and monetization in one place.

**Repository:** `13fxiii/BCH`  
**Official X:** `@BCHub_`  
**Community:** BIG CRUISE😂〽️  
**Community email:** `cruiseconnecthub@gmail.com`  
**Production target:** AppDeploy  
**Local development:** `http://localhost:3000`

---

## What BCH is

BCH〽️ is the digital home of the BIG CRUISE😂〽️ community. The product is designed around the community's internet-culture identity: jokes, banter, entertainment, games, music, community activities and creator opportunities.

The visual foundation comes from Cruise Connect Hub〽️, while the product architecture is being migrated to an AppDeploy-first backend.

> **Important:** "Cruise" in BIG CRUISE😂〽️ refers to Nigerian internet culture, banter and entertainment — not boats or nautical travel.

---

## Architecture

```text
GitHub BCH source
       ↓
AppDeploy runtime / backend
       ↓
Live BCH〽️ app
```

### Current migration direction

- **GitHub:** canonical source repository.
- **AppDeploy:** target production runtime and backend.
- **X:** authentication, identity, community synchronization and publishing integrations.
- **Paystack:** payments where required for monetized BCH features.
- **Supabase:** legacy Cruise Connect Hub infrastructure being retired progressively; it must not remain a required dependency of the final BCH runtime.
- **Vercel:** legacy hosting infrastructure being retired from the BCH production architecture.

Legacy infrastructure must only be removed after an equivalent replacement has been implemented and verified.

---

## Core product

### 🔐 Core

- X-only authentication
- Persistent sessions
- BCH profiles
- X profile identity and avatar support
- CRUISE ID
- Onboarding removal / simplified entry

### 📰 Social

- Community feed
- Posts
- Comments
- Likes
- Follows
- Notifications
- Messages / DMs
- X synchronization
- X publishing and community announcements

### 🎮 Play

BCH Play is designed for solo players, Cruise Bots and multiplayer rooms with configurable lobby sizes.

Current game/product areas include:

- Draw Am
- Who Dey Lie? — Mafia / Werewolf-style modes
- Cruise Cards
- BCH Ludo
- BCH Trivia
- Spin Am
- Karaoke
- BCH Word Guess
- BCH Codenames
- Tournaments
- Big Cruise Talent Hunt
- Cruise Bots
- Solo play
- Multiplayer
- Configurable player-count lobbies
- In-game comments / interaction
- Leaderboards and competitive scoring

The existing Cruise Connect Hub game implementations are used as the primary UI/gameplay references during migration.

**Tournaments remain named Tournaments.** Other game names are being branded independently to avoid unnecessary third-party naming conflicts.

### 🎵 BIG CRUISE FM

Entertainment hub planned around:

- Music Room
- Music / listening experiences
- BIG CRUISE Spaces
- Big Cruise Artistes
- Artiste applications
- Sponsored music opportunities
- Movies with legally permitted in-app playback

### 💰 Money

- Wallet
- Gifts
- Merch
- Paid tournaments
- Tournament sponsorships
- Support Big Cruise
- Artiste applications

The old Marketplace concept is removed from the BCH product direction.

### 🏆 Community

- Daily themes
- Men Crush Monday (MCM)
- Women Crush Wednesday (WCW)
- Throwback Thursday
- Community polls
- Leaderboards
- Awards
- X publishing
- X Space detection
- Community Space notifications
- X group-chat prompts
- Community announcements

---

## Games architecture

Every multiplayer-capable game should support the common BCH room model where appropriate:

```text
Lobby
 ├─ target player count
 ├─ human players
 ├─ Cruise Bots when needed
 ├─ ready state
 └─ game start

Game
 ├─ synchronized state
 ├─ player turns / roles
 ├─ comments or interaction where supported
 ├─ scoring
 └─ round / match completion
```

Games should remain stable on mobile devices. Drawing interactions in Draw Am must not cause unwanted page scrolling or viewport movement.

---

## X integration

BCH is designed to synchronize selected community activity with X.

The official community identity is:

- **X account:** `@BCHub_`
- **Community:** BIG CRUISE😂〽️

Planned/implemented integration areas include:

- X authentication
- X profile/avatar identity
- Community feed synchronization
- X publishing
- X polls
- X Space detection
- Space status notifications
- Throwback Thursday retrieval from community content
- Community group-chat prompts

X credentials and service keys must remain server-side and must never be committed to this repository.

---

## Payments & monetization

BCH can support monetized community products such as:

- Merch
- Paid tournaments
- Tournament sponsorships
- Talent Hunt sponsorships
- Big Cruise Artiste applications
- Music/entertainment opportunities
- Support Big Cruise

Payment integrations must use server-side secrets and verified payment callbacks. Never expose secret payment keys in client-side code.

---

## Merch

BIG CRUISE〽️ merch is treated as a branded collection rather than a generic marketplace.

The merch experience should:

- preserve the BIG CRUISE〽️ visual identity
- show individual designs cleanly
- avoid repeatedly displaying all-in-one collection sheets as individual products
- support merch updates / waitlist messaging
- connect monetization flows where enabled

---

## Security & environment variables

Never commit:

- `.env`
- OAuth client secrets
- X access/refresh tokens
- AppDeploy service keys
- Paystack secret keys
- database service keys
- private API credentials

Use `.env.example` for variable names and documentation only.

Local development should default to localhost when `NEXT_PUBLIC_APP_URL` is not explicitly configured. Production configuration should provide the actual BCH deployment URL.

---

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Type-check:

```bash
npx tsc --noEmit
```

---

## Migration roadmap

### Phase 1 — Core

- X authentication
- BCH profile
- CRUISE ID
- onboarding removal
- persistent sessions

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
- Spin Am
- Karaoke
- Word Guess
- Codenames
- Tournaments
- Big Cruise Talent Hunt
- Bots
- Solo
- Multiplayer
- Configurable lobbies

### Phase 4 — Entertainment

- BIG CRUISE FM
- Music Room
- Spaces
- Artistes
- Movies with legal in-app playback

### Phase 5 — Money

- Wallet
- Gifts
- Merch
- Tournaments
- Sponsorships / Support Big Cruise
- Artiste applications
- Remove Marketplace

### Phase 6 — Community

- Daily themes
- MCM/WCW
- Throwback Thursday
- Leaderboard
- Awards
- X publishing
- X Space detection
- X group-chat prompts
- Community notifications

---

## Migration principles

1. Preserve working Cruise Connect Hub gameplay and UI patterns where they are the intended reference.
2. Prefer the AppDeploy backend for new BCH functionality.
3. Do not introduce a second competing backend for the same feature.
4. Do not delete legacy infrastructure until its replacement has been verified.
5. Do not execute legacy Supabase production migrations for BCH.
6. Keep secrets out of source control and browser bundles.
7. Test backend routes and critical user flows before declaring a phase complete.
8. Treat the live AppDeploy BCH implementation and GitHub source as systems that must remain in sync.
9. Keep mobile UI compact, stable and touch-friendly.
10. Keep feature-specific content inside its own feature page; cross-feature suggestions belong primarily on Home.

---

## Repository status

The repository is undergoing an active migration from the original Cruise Connect Hub architecture to the BCH/AppDeploy architecture.

See `BCH_MIGRATION_STATUS.md` for the current reconciliation state and migration notes.

---

## License / ownership

BIG CRUISE〽️ / BCH is a community product. Third-party names, APIs, games, media and integrations remain subject to their respective owners' terms and licenses. BCH should only use content and integrations it has permission to use.
