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

function forceWin(world, forPlayer) {
  world.reset();
  const me = world.state.players[0];
  const foe = world.state.players[1];
  if (forPlayer) {
    foe.life = 3;
    me.board.push({ uid: 9001, defId: 'pyre-drake', attack: 5, health: 4, maxHealth: 4, armor: 0, canAttack: true });
    me.board.push({ uid: 9002, defId: 'cinder-wolf', attack: 3, health: 2, maxHealth: 2, armor: 0, canAttack: true });
    world.state.phase = 'player';
    world.attack(0, 0, { kind: 'face' });
  } else {
    me.life = 2;
    foe.board.push({ uid: 9003, defId: 'pyre-drake', attack: 5, health: 4, maxHealth: 4, armor: 0, canAttack: true });
    foe.board.push({ uid: 9004, defId: 'cinder-wolf', attack: 3, health: 2, maxHealth: 2, armor: 0, canAttack: true });
    world.state.phase = 'ai';
    world.attack(1, 0, { kind: 'face' });
  }
}

export function stageShot(name, world) {
  if (name === 'win') {
    forceWin(world, true);
    return { screen: SCREEN_OVER, best: world.state.score };
  }
  if (name === 'loss') {
    forceWin(world, false);
    return { screen: SCREEN_OVER, best: 0 };
  }
  if (name === 'play') {
    world.reset();
    let rounds = 0;
    while (rounds < 14) {
      runTurns(world, 1);
      rounds += 1;
      if (world.state.phase === 'over') break;
      const me = world.state.players[0];
      const foe = world.state.players[1];
      if (world.state.turn >= 5 && me.board.length >= 2 && foe.board.length >= 1 && me.hand.length >= 3) break;
    }
    if (world.state.phase === 'over') {
      world.reset();
      runTurns(world, 2);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  }
  world.reset();
  runTurns(world, 3);
  if (world.state.phase === 'over') world.reset();
  return { screen: SCREEN_TITLE, best: 0 };
}
