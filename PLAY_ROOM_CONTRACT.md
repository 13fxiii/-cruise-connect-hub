# BCH Play — Shared Room Contract

All multiplayer-capable BCH games should use the same room lifecycle unless a game's rules genuinely require a different flow.

## Player modes

- `solo` — one human player; game rules may run locally or use non-human opponents where appropriate.
- `bot` — human player(s) plus Cruise Bots used to fill the requested lobby size.
- `multiplayer` — human players join the same room.

## Lobby

Every supported multiplayer game should expose:

1. Game name
2. Mode selection: Solo / Cruise Bot / Multiplayer
3. Desired player count
4. Current player count
5. Human/Bot roster
6. Ready state
7. Host indicator
8. Start state

Default target size is 4 players. Supported room sizes are 2–12 unless a game's rules require a narrower range.

## Start rules

A room cannot start until its minimum player requirement is met and the required players are ready.

Bot rooms may fill missing slots automatically until the requested target player count is reached.

## Game state

A room should maintain a synchronized state containing:

- room status
- round number
- current turn/player where applicable
- player roster
- scores
- game-specific state
- comments/chat where the game supports interaction
- timestamps for room creation and updates

## Results

When a match ends, the room should expose:

- final standings
- scores
- winner/top players
- round/match result
- replay/rematch action where supported
- leaderboard contribution where applicable

## Mobile stability

Play screens must prevent accidental page movement during touch-heavy interactions. Drawing, dragging, cards, boards and other gesture-driven controls should own their touch gestures rather than allowing the document to scroll.

## Architecture rule

The shared contract lives in `src/lib/game-room.ts`. Game-specific rules should build on this contract rather than creating unrelated lobby/player models for every game.

This contract is the foundation for:

- Draw Am
- Who Dey Lie? / Mafia / Werewolf modes
- Cruise Cards
- BCH Ludo
- BCH Trivia
- Spin Am
- Karaoke
- BCH Word Guess
- BCH Codenames
- Tournaments
- Big Cruise Talent Hunt
