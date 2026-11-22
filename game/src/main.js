import { BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createAudio } from './audio.js';
import { AGAIN_BUTTON, END_TURN, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, boardLayout, createRenderer, handLayout } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch (e) {
    void e;
  }
}

function inBox(p, box) {
  return p && p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, { selectedHand: -1, selectedAttacker: -1, hover: { x: -1, y: -1 } });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let selectedAttacker = -1;
  let aiClock = 0;
  let overSound = false;
  let lastLog = world.state.log;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    selectedAttacker = -1;
    overSound = false;
    lastLog = world.state.log;
    screen = SCREEN_PLAY;
    announce('Playing. Your turn. ' + world.state.players[0].life + ' life.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.winner === 'player') {
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
      if (!overSound) audio.win();
      announce('Victory. Score ' + world.state.score + '. Best ' + best + '.');
    } else {
      if (!overSound) audio.lose();
      announce('Defeat. Score ' + world.state.score + '.');
    }
    overSound = true;
  }

  function handleClick(p) {
    if (!p) return;
    if (screen === SCREEN_TITLE) {
      if (inBox(p, { x: 510, y: 528, w: 260, h: 58 })) {
        audio.click();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_OVER) {
      if (inBox(p, AGAIN_BUTTON)) {
        audio.click();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    if (world.state.phase !== 'player') return;
    const me = world.state.players[0];
    const foe = world.state.players[1];
    if (inBox(p, END_TURN)) {
      selectedAttacker = -1;
      audio.click();
      world.endTurn();
      announce('The Warden acts.');
      return;
    }
    if (selectedAttacker >= 0) {
      if (p.x >= 36 && p.x <= 316 && p.y >= 62 && p.y <= 202) {
        const name = world.attack(0, selectedAttacker, { kind: 'face' });
        if (name) audio.hit();
        selectedAttacker = -1;
        if (world.state.phase === 'over') endGame();
        return;
      }
      const foeLay = boardLayout(Math.max(foe.board.length, 1));
      for (let i = 0; i < foe.board.length; i += 1) {
        const x = foeLay.x0 + i * (118 + foeLay.gap);
        if (p.x >= x && p.x <= x + 118 && p.y >= 148 && p.y <= 270) {
          const name = world.attack(0, selectedAttacker, { kind: 'creature', index: i });
          if (name) audio.hit();
          selectedAttacker = -1;
          if (world.state.phase === 'over') endGame();
          return;
        }
      }
      selectedAttacker = -1;
    }
    const myLay = boardLayout(Math.max(me.board.length, 1));
    for (let i = 0; i < me.board.length; i += 1) {
      const x = myLay.x0 + i * (118 + myLay.gap);
      if (p.x >= x && p.x <= x + 118 && p.y >= 360 && p.y <= 482) {
        if (me.board[i].canAttack && me.board[i].attack > 0) {
          selectedAttacker = i;
          audio.click();
          announce('Attacker chosen. Pick a target.');
        }
        return;
      }
    }
    const lay = handLayout(Math.max(me.hand.length, 1));
    for (let i = 0; i < me.hand.length; i += 1) {
      const x = lay.x0 + i * (128 + lay.gap);
      if (p.x >= x && p.x <= x + 128 && p.y >= 500 && p.y <= 684) {
        const name = world.playCard(0, i);
        if (name) {
          if (world.state.log.indexOf('mends') >= 0) audio.heal();
          else audio.play();
          announce(world.state.log);
        }
        if (world.state.phase === 'over') endGame();
        return;
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Muted.' : 'Sound on.');
    }
    if (actions & ACTION_RESTART) {
      world.reset();
      selectedAttacker = -1;
      screen = SCREEN_TITLE;
      announce('Ember Court. Press Space or click to start.');
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = 1 / 60;
    const screenBefore = screen;
    handleActions();
    const click = input.takeClick();
    if (click && screen === screenBefore) handleClick(click);
    if (screen === SCREEN_PLAY && world.state.phase === 'ai') {
      aiClock += dt;
      if (aiClock >= 0.65) {
        aiClock = 0;
        const step = world.aiStep();
        if (step.message !== lastLog) {
          lastLog = step.message;
          announce(step.message);
          if (step.message.indexOf('strikes') >= 0 || step.message.indexOf('trades') >= 0) audio.hit();
          else if (step.message.indexOf('mends') >= 0) audio.heal();
          else if (step.message.indexOf('summons') >= 0 || step.message.indexOf('casts') >= 0) audio.play();
        }
        if (step.done) {
          world.endTurn();
          announce('Your turn. ' + world.state.players[0].mana + ' mana.');
        }
      }
    } else aiClock = 0;
    if (screen === SCREEN_PLAY && world.state.phase === 'over') endGame();
    const ui = { selectedHand: -1, selectedAttacker, hover: input.hover() };
    renderer.draw(world.state, screen, best, ui);
    void now;
  }

  announce('Ember Court. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
