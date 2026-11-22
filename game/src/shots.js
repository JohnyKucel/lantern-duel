import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function runTurns(world, rounds) {
  for (let r = 0; r < rounds; r += 1) {
    if (world.state.phase === 'over') return;
    world.autoPlayTurn(0);
    if (world.state.phase === 'over') return;
    world.endTurn();
    if (world.state.phase === 'over') return;
    world.autoPlayTurn(1);
    if (world.state.phase === 'over') return;
    world.endTurn();
  }
}

function forceFinish(world, forPlayer) {
  if (world.state.phase === 'over') return;
  const winnerSide = forPlayer ? 0 : 1;
  const loserSide = forPlayer ? 1 : 0;
  const winner = world.state.players[winnerSide];
  const loser = world.state.players[loserSide];
  let attackerIndex = -1;
  for (let i = 0; i < winner.board.length; i += 1) {
    if (winner.board[i].attack > 0) { attackerIndex = i; break; }
  }
  if (attackerIndex < 0) {
    if (winner.board.length >= 5) return;
    winner.board.push({ uid: 9000 + winnerSide, defId: 'pyre-drake', attack: 5, health: 4, maxHealth: 4, armor: 0, canAttack: true });
    attackerIndex = winner.board.length - 1;
  }
  const attacker = winner.board[attackerIndex];
  attacker.canAttack = true;
  loser.life = attacker.attack;
  world.state.phase = forPlayer ? 'player' : 'ai';
  world.attack(winnerSide, attackerIndex, { kind: 'face' });
}

function stageEnd(world, forPlayer) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    world.reset();
    let rounds = 0;
    while (rounds < 14 && world.state.turn < 9 && world.state.phase !== 'over') {
      runTurns(world, 1);
      rounds += 1;
    }
    if (world.state.phase === 'over') {
      if ((forPlayer && world.state.winner === 'player') || (!forPlayer && world.state.winner === 'ai')) {
        return { screen: SCREEN_OVER, best: world.state.score };
      }
      continue;
    }
    forceFinish(world, forPlayer);
    if (world.state.phase === 'over') return { screen: SCREEN_OVER, best: world.state.score };
  }
  world.reset();
  runTurns(world, 9);
  if (world.state.phase !== 'over') forceFinish(world, forPlayer);
  return { screen: SCREEN_OVER, best: world.state.score };
}

export function stageShot(name, world) {
  if (name === 'win') return stageEnd(world, true);
  if (name === 'loss') return stageEnd(world, false);
  if (name === 'play') {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      world.reset();
      let rounds = 0;
      let good = false;
      while (rounds < 14) {
        runTurns(world, 1);
        rounds += 1;
        if (world.state.phase === 'over') break;
        const me = world.state.players[0];
        const foe = world.state.players[1];
        if (world.state.turn >= 5 && me.board.length >= 2 && foe.board.length >= 2 && me.hand.length >= 3) {
          good = true;
          break;
        }
      }
      if (good) return { screen: SCREEN_PLAY, best: 0 };
    }
    return { screen: SCREEN_PLAY, best: 0 };
  }
  world.reset();
  runTurns(world, 3);
  if (world.state.phase === 'over') world.reset();
  return { screen: SCREEN_TITLE, best: 0 };
}
