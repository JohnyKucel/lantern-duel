import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(root, 'game');
const shotsDir = join(root, 'screenshots');
const outGame = join(outDir, 'game');
const outShots = join(outDir, 'screenshots');

mkdirSync(outGame, { recursive: true });
cpSync(gameDir, outGame, { recursive: true });
mkdirSync(outShots, { recursive: true });
if (existsSync(shotsDir)) {
  for (const name of readdirSync(shotsDir)) {
    if (name.startsWith('.')) continue;
    cpSync(join(shotsDir, name), join(outShots, name));
  }
}

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
