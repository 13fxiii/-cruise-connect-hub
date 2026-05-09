# Cruise Connect Hub〽️ — Live Session Engine Architecture (Phase 1)

## Constraints honored
- Keep existing Supabase Auth + X/Twitter OAuth login flow untouched.
- Keep existing branding/logo and black-gold visual direction.
- Keep Next.js App Router as primary frontend runtime.

## Phase 1 delivered in this commit
1. **Centralized session state model** in `src/features/live-session`.
2. **Deterministic reducer engine** to process all live session events from UI/realtime transport.
3. **Persistent mobile live dock UI** with optional X Space controls (join/mute/minimize/disconnect) that can live over any experience.
4. **Zero auth flow disruption** (no auth file/path modified).

## Why reducer-first
Reducer-first architecture gives us:
- deterministic updates from Socket.IO events,
- replay/debug capability,
- transport-agnostic synchronization (socket, redis stream, or HTTP fallback).

## Target next phases
- Wire `reduceSessionState` to Socket.IO event bus (`session:*`, `space:*`, `lobby:*`, `vote:*`).
- Add Express + Redis adapter for horizontal realtime fanout.
- Persist canonical session snapshots in Supabase (`live_sessions`, `session_presence`, `session_votes`).
- Add session-scoped game adapters (UNO/Ludo/Chess/etc.) behind shared engine contracts.
- Replace demo space source with real X Spaces discovery/attach flow.

## Non-goals in this phase
- No rewrite of existing auth.
- No placeholder replacement of existing branding assets.
- No breaking route or deployment changes.
