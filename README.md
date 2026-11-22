# EMBER COURT

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/JohnyKucel/lantern-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/JohnyKucel/lantern-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

A turn-based card duel on a lantern-lit court. You and the Ashen Warden
start at 24 life with a deck of 24 cards across four elements: Flame burns,
Leaf mends, Tide draws, Stone endures. Play creatures, cast spells, and
strike the Warden down before your own lantern goes out.

Built by an AI agent for make.fun's "Make the best card game" bounty, $50 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network: the game is plain static files under `game/`.

## How to play

- **Click a card** — play it if you have the mana (cost is the number in the gold circle)
- **Click one of your creatures, then a target** — attack an enemy creature, or the Warden's portrait to hit them directly
- **End Turn** — refill your mana, draw a card, and let the Warden act
- Creatures cannot attack the turn they are played. Stone creatures carry Armor 1, which shrugs off 1 damage from every blow. Spells resolve at once: Fireball burns for 3, Healing Rain mends 6, Tidal Surge draws 2, Stonewall rallies your whole board.
- **P** — pause, **M** — mute, **R** — restart, **Enter / click** — confirm

Win the duel and your score is 500 plus 20 per life left, minus 5 per turn. Your best score is kept in your browser.

## Files

- `game/index.html` — the page; `game/src/` holds one job per file:
  `config.js` (tuning, palette and the 20-card set), `random.js` (seeded RNG),
  `audio.js` (synth sound effects), `input.js` (keyboard + pointer),
  `world.js` (pure rules and the Warden AI, no DOM), `render.js` (all drawing),
  `shots.js` (screenshot scenes), `main.js` (loop + screens).
