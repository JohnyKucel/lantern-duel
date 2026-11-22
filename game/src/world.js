import { CARDS, DECK_IDS, MAX_BOARD, MAX_MANA, START_LIFE, cardById } from './config.js';
import { shuffle } from './random.js';

export const PHASE_PLAYER = 'player';
export const PHASE_AI = 'ai';
export const PHASE_OVER = 'over';

let nextUid = 1;

function sv(name, first, third) {
  return name + ' ' + (name === 'You' ? first : third);
}

function obj(name) {
  return name === 'You' ? 'you' : name;
}

function makeCard(defId) {
  return { uid: nextUid, defId };
}

function makeCreature(defId) {
  const def = cardById(defId);
  return { uid: nextUid, defId, attack: def.attack, health: def.health, maxHealth: def.health, armor: def.armor, canAttack: false };
}

function makeSide(name) {
  return { name, life: START_LIFE, maxLife: START_LIFE, mana: 0, maxMana: 0, manaTurn: 0, fatigue: 0, deck: [], hand: [], board: [], damageDealt: 0, cardsPlayed: 0 };
}

function other(side) {
  return side === 0 ? 1 : 0;
}

export function createWorld(random) {
  const state = { turn: 1, phase: PHASE_PLAYER, winner: null, score: 0, log: '', players: [makeSide('You'), makeSide('Ashen Warden')] };

  function drawCard(side) {
    const p = state.players[side];
    if (p.deck.length === 0) {
      p.fatigue += 1;
      p.life -= p.fatigue;
      state.log = p.name === 'You' ? 'You run out of cards and take ' + p.fatigue + ' fatigue.' : p.name + ' runs out of cards and takes ' + p.fatigue + ' fatigue.';
      checkWin();
      return;
    }
    const card = p.deck.pop();
    if (p.hand.length >= 7) {
      state.log = sv(p.name, 'draw', 'draws') + ' ' + cardById(card.defId).name + ' but the hand is full.';
      return;
    }
    p.hand.push(card);
    state.log = sv(p.name, 'draw', 'draws') + ' a card.';
  }

  function heal(side, amount) {
    const p = state.players[side];
    p.life = Math.min(p.maxLife, p.life + amount);
  }

  function damageFace(target, amount, source) {
    const p = state.players[target];
    p.life -= amount;
    state.players[source].damageDealt += amount;
    state.log = sv(state.players[source].name, 'deal', 'deals') + ' ' + amount + ' to ' + obj(p.name) + '.';
    checkWin();
  }

  function checkWin() {
    if (state.phase === PHASE_OVER) return;
    for (let i = 0; i < 2; i += 1) {
      if (state.players[i].life <= 0) {
        state.players[i].life = 0;
        state.phase = PHASE_OVER;
        state.winner = i === 0 ? 'ai' : 'player';
        const w = state.players[other(i)];
        state.score = Math.max(50, 500 + w.life * 20 - state.turn * 5);
        state.log = sv(w.name, 'win', 'wins') + ' the duel.';
        return;
      }
    }
  }

  function startTurn(side) {
    const p = state.players[side];
    p.manaTurn += 1;
    p.maxMana = Math.min(MAX_MANA, p.manaTurn);
    p.mana = p.maxMana;
    for (let i = 0; i < p.board.length; i += 1) p.board[i].canAttack = true;
    drawCard(side);
  }

  function applyOnPlay(side, def) {
    const foe = other(side);
    if (def.onPlay === 'damageFace1') damageFace(foe, 1, side);
    else if (def.onPlay === 'damageFace2') damageFace(foe, 2, side);
    else if (def.onPlay === 'heal2') { heal(side, 2); state.log = sv(state.players[side].name, 'mend', 'mends') + ' 2 life.'; }
    else if (def.onPlay === 'heal3') { heal(side, 3); state.log = sv(state.players[side].name, 'mend', 'mends') + ' 3 life.'; }
    else if (def.onPlay === 'draw1') drawCard(side);
  }

  function applySpell(side, def) {
    const foe = other(side);
    if (def.effect === 'damageFace3') damageFace(foe, 3, side);
    else if (def.effect === 'heal6') { heal(side, 6); state.log = sv(state.players[side].name, 'mend', 'mends') + ' 6 life.'; }
    else if (def.effect === 'draw2Damage1') { drawCard(side); drawCard(side); if (state.phase !== PHASE_OVER) damageFace(foe, 1, side); }
    else if (def.effect === 'buffAll') {
      const p = state.players[side];
      for (let i = 0; i < p.board.length; i += 1) { p.board[i].attack += 1; p.board[i].health += 1; p.board[i].maxHealth += 1; }
      state.log = sv(state.players[side].name, 'rally', 'rallies') + ' the board.';
    }
  }

  function playCard(side, handIndex) {
    if (state.phase === PHASE_OVER) return null;
    if ((side === 0 && state.phase !== PHASE_PLAYER) || (side === 1 && state.phase !== PHASE_AI)) return null;
    const p = state.players[side];
    if (handIndex < 0 || handIndex >= p.hand.length) return null;
    const card = p.hand[handIndex];
    const def = cardById(card.defId);
    if (def.cost > p.mana) return null;
    if (def.kind === 'creature' && p.board.length >= MAX_BOARD) return null;
    p.mana -= def.cost;
    p.hand.splice(handIndex, 1);
    p.cardsPlayed += 1;
    if (def.kind === 'creature') {
      p.board.push(makeCreature(card.defId));
      state.log = sv(p.name, 'summon', 'summons') + ' ' + def.name + '.';
      applyOnPlay(side, def);
    } else {
      state.log = sv(p.name, 'cast', 'casts') + ' ' + def.name + '.';
      applySpell(side, def);
    }
    checkWin();
    return def.name;
  }

  function hurtCreature(creature, amount) {
    const taken = Math.max(0, amount - creature.armor);
    creature.health -= taken;
    return taken;
  }

  function attack(side, attackerIndex, target) {
    if (state.phase === PHASE_OVER) return null;
    if ((side === 0 && state.phase !== PHASE_PLAYER) || (side === 1 && state.phase !== PHASE_AI)) return null;
    const p = state.players[side];
    const foe = state.players[other(side)];
    if (attackerIndex < 0 || attackerIndex >= p.board.length) return null;
    const attacker = p.board[attackerIndex];
    if (!attacker.canAttack || attacker.attack <= 0) return null;
    attacker.canAttack = false;
    const def = cardById(attacker.defId);
    if (target.kind === 'face') {
      foe.life -= attacker.attack;
      p.damageDealt += attacker.attack;
      state.log = def.name + ' strikes ' + foe.name + ' for ' + attacker.attack + '.';
      checkWin();
      return def.name;
    }
    if (target.index < 0 || target.index >= foe.board.length) return null;
    const defender = foe.board[target.index];
    const defDef = cardById(defender.defId);
    const dealt = hurtCreature(defender, attacker.attack);
    const taken = hurtCreature(attacker, defender.attack);
    state.log = def.name + ' trades with ' + defDef.name + ' (' + dealt + ' dealt, ' + taken + ' taken).';
    if (defender.health <= 0) foe.board.splice(target.index, 1);
    if (attacker.health <= 0) {
      const at = p.board.indexOf(attacker);
      if (at >= 0) p.board.splice(at, 1);
    }
    return def.name;
  }

  function endTurn() {
    if (state.phase === PHASE_OVER) return;
    if (state.phase === PHASE_PLAYER) {
      state.phase = PHASE_AI;
      startTurn(1);
    } else if (state.phase === PHASE_AI) {
      state.phase = PHASE_PLAYER;
      state.turn += 1;
      startTurn(0);
    }
  }

  function oneAction(side) {
    const p = state.players[side];
    const foe = state.players[other(side)];
    const order = [];
    for (let i = 0; i < p.hand.length; i += 1) order.push(i);
    order.sort(function (a, b) { return cardById(p.hand[b].defId).cost - cardById(p.hand[a].defId).cost; });
    for (let k = 0; k < order.length; k += 1) {
      const idx = order[k];
      const def = cardById(p.hand[idx].defId);
      if (def.cost > p.mana) continue;
      if (def.kind === 'creature' && p.board.length >= MAX_BOARD) continue;
      if (playCard(side, idx) !== null) return true;
    }
    let attackerIndex = -1;
    for (let i = 0; i < p.board.length; i += 1) {
      if (p.board[i].canAttack && p.board[i].attack > 0) { attackerIndex = i; break; }
    }
    if (attackerIndex < 0) return false;
    const attacker = p.board[attackerIndex];
    if (attacker.attack >= foe.life) {
      attack(side, attackerIndex, { kind: 'face' });
      return true;
    }
    let targetIndex = -1;
    let targetHealth = 999;
    for (let i = 0; i < foe.board.length; i += 1) {
      const c = foe.board[i];
      if (c.health <= attacker.attack && c.health < targetHealth) { targetHealth = c.health; targetIndex = i; }
    }
    if (targetIndex >= 0) attack(side, attackerIndex, { kind: 'creature', index: targetIndex });
    else attack(side, attackerIndex, { kind: 'face' });
    return true;
  }

  function aiStep() {
    if (state.phase !== PHASE_AI || state.phase === PHASE_OVER) return { done: true, message: state.log };
    const acted = oneAction(1);
    return { done: !acted, message: state.log };
  }

  function autoPlayTurn(side) {
    let guard = 0;
    while (guard < 40) {
      guard += 1;
      if (state.phase === PHASE_OVER) return;
      if ((side === 0 && state.phase !== PHASE_PLAYER) || (side === 1 && state.phase !== PHASE_AI)) return;
      if (!oneAction(side)) return;
    }
  }

  function reset() {
    nextUid = 1;
    state.turn = 1;
    state.phase = PHASE_PLAYER;
    state.winner = null;
    state.score = 0;
    state.log = 'The lanterns are lit. Your move.';
    state.players = [makeSide('You'), makeSide('Ashen Warden')];
    for (let s = 0; s < 2; s += 1) {
      const ids = shuffle(DECK_IDS.slice(), random);
      for (let i = 0; i < ids.length; i += 1) state.players[s].deck.push(makeCard(ids[i]));
      for (let i = 0; i < (s === 0 ? 4 : 5); i += 1) state.players[s].hand.push(state.players[s].deck.pop());
    }
    startTurn(0);
  }

  reset();
  return { state, reset, playCard, attack, endTurn, aiStep, autoPlayTurn, drawCard, startTurn };
}
