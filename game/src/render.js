import { ELEMENTS, FIELD, FONT, FONT_UI, MAX_BOARD, PALETTE, cardById } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const HAND_CARD = { w: 128, h: 168 };
const BOARD_CARD = { w: 118, h: 122 };
const HAND_Y = 516;
const BOARD_TOP_Y = 148;
const BOARD_BOT_Y = 360;

export function handLayout(count) {
  const gap = 10;
  const total = count * HAND_CARD.w + (count - 1) * gap;
  const x0 = 300 + Math.max(0, (950 - total) / 2);
  return { x0, gap };
}

export function boardLayout(count) {
  const gap = 14;
  const total = count * BOARD_CARD.w + (count - 1) * gap;
  const x0 = (FIELD.width - total) / 2;
  return { x0, gap };
}

export const END_TURN = { x: 1064, y: 296, w: 188, h: 46 };
export const START_BUTTON = { x: 510, y: 528, w: 260, h: 58 };
export const AGAIN_BUTTON = { x: 510, y: 520, w: 260, h: 58 };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFlame(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.bezierCurveTo(cx + s * 0.85, cy - s * 0.25, cx + s * 0.7, cy + s * 0.55, cx, cy + s * 0.75);
  ctx.bezierCurveTo(cx - s * 0.7, cy + s * 0.55, cx - s * 0.85, cy - s * 0.25, cx, cy - s);
  ctx.fill();
  ctx.fillStyle = '#f7d774';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx + s * 0.4, cy + s * 0.1, cx + s * 0.3, cy + s * 0.45, cx, cy + s * 0.5);
  ctx.bezierCurveTo(cx - s * 0.3, cy + s * 0.45, cx - s * 0.4, cy + s * 0.1, cx, cy - s * 0.3);
  ctx.fill();
}

function drawLeaf(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.bezierCurveTo(cx + s * 0.95, cy - s * 0.4, cx + s * 0.8, cy + s * 0.7, cx, cy + s * 0.85);
  ctx.bezierCurveTo(cx - s * 0.8, cy + s * 0.7, cx - s * 0.95, cy - s * 0.4, cx, cy - s);
  ctx.fill();
  ctx.strokeStyle = '#2c5a20';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.7);
  ctx.lineTo(cx, cy + s * 0.8);
  ctx.stroke();
}

function drawTide(ctx, cx, cy, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, s * 0.22);
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i += 1) {
    const y = cy + i * s * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.85, y);
    ctx.quadraticCurveTo(cx - s * 0.4, y - s * 0.45, cx, y);
    ctx.quadraticCurveTo(cx + s * 0.4, y + s * 0.45, cx + s * 0.85, y);
    ctx.stroke();
  }
}

function drawStone(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI / 6 + i * Math.PI / 3;
    const x = cx + Math.cos(a) * s;
    const y = cy + Math.sin(a) * s;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.45, cy - s * 0.1);
  ctx.lineTo(cx, cy - s * 0.55);
  ctx.lineTo(cx + s * 0.45, cy - s * 0.1);
  ctx.stroke();
}

export function drawGlyph(ctx, element, cx, cy, s) {
  const color = ELEMENTS[element].color;
  if (element === 'flame') drawFlame(ctx, cx, cy, s, color);
  else if (element === 'leaf') drawLeaf(ctx, cx, cy, s, color);
  else if (element === 'tide') drawTide(ctx, cx, cy, s, color);
  else drawStone(ctx, cx, cy, s, color);
}

function drawHeart(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.9);
  ctx.bezierCurveTo(cx - s * 1.2, cy, cx - s * 0.7, cy - s, cx, cy - s * 0.25);
  ctx.bezierCurveTo(cx + s * 0.7, cy - s, cx + s * 1.2, cy, cx, cy + s * 0.9);
  ctx.fill();
}

function drawMana(ctx, x, y, mana, maxMana) {
  for (let i = 0; i < maxMana; i += 1) {
    const cx = x + i * 26;
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = i < mana ? PALETTE.gold : '#1d4a43';
    ctx.strokeStyle = PALETTE.goldDark;
    ctx.lineWidth = 1.5;
    const s = 8;
    ctx.beginPath();
    ctx.rect(-s, -s, s * 2, s * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i += 1) {
    const trial = line === '' ? words[i] : line + ' ' + words[i];
    if (ctx.measureText(trial).width > maxWidth && line !== '') {
      lines.push(line);
      line = words[i];
    } else line = trial;
  }
  if (line !== '') lines.push(line);
  return lines;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function font(size, bold, serif) {
    const key = size + (bold ? 'b' : '') + (serif ? 's' : 'u');
    if (!fonts.has(key)) fonts.set(key, (bold ? '700 ' : '') + size + 'px ' + (serif ? FONT : FONT_UI));
    ctx.font = fonts.get(key);
  }

  function text(value, x, y, size, color, align, bold, serif) {
    font(size, bold, serif);
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.fillText(value, x, y);
  }

  function drawTable() {
    ctx.fillStyle = PALETTE.feltDark;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.felt;
    rr(ctx, 16, 56, FIELD.width - 32, 640, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.feltLight;
    ctx.beginPath();
    ctx.ellipse(FIELD.width / 2, 360, 560, 240, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.felt;
    ctx.beginPath();
    ctx.ellipse(FIELD.width / 2, 360, 540, 224, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a2b27';
    ctx.fillRect(0, 0, FIELD.width, 48);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(0, 48, FIELD.width, 3);
    text('EMBER COURT', 28, 33, 22, PALETTE.gold, 'left', true, true);
    ctx.textAlign = 'right';
    text('A duel of lanterns and elements', FIELD.width - 28, 32, 15, PALETTE.muted, 'right', false, false);
  }

  function drawPortrait(ctx2, x, y, r, element, name) {
    ctx2.fillStyle = '#123f39';
    ctx2.beginPath();
    ctx2.arc(x, y, r, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.strokeStyle = PALETTE.gold;
    ctx2.lineWidth = 3;
    ctx2.stroke();
    drawGlyph(ctx2, element, x, y, r * 0.5);
    void name;
  }

  function drawLife(ctx2, x, y, life, maxLife) {
    drawHeart(ctx2, x, y, 13, '#e4572e');
    font(30, true, false);
    ctx2.fillStyle = PALETTE.text;
    ctx2.textAlign = 'left';
    ctx2.fillText(String(life), x + 20, y + 10);
    font(15, false, false);
    ctx2.fillStyle = PALETTE.muted;
    ctx2.fillText('/ ' + maxLife, x + 20 + ctx2.measureText(String(life)).width + 34, y + 8);
  }

  function drawCardBack(ctx2, x, y, w, h) {
    ctx2.fillStyle = '#123f39';
    rr(ctx2, x, y, w, h, 7);
    ctx2.fill();
    ctx2.strokeStyle = PALETTE.gold;
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.fillStyle = PALETTE.gold;
    ctx2.save();
    ctx2.translate(x + w / 2, y + h / 2);
    ctx2.rotate(Math.PI / 4);
    ctx2.fillRect(-7, -7, 14, 14);
    ctx2.restore();
  }

  function drawHandCard(ctx2, card, x, y, playable, hovered) {
    const def = cardById(card.defId);
    const el = ELEMENTS[def.element];
    const lift = hovered ? 16 : 0;
    const top = y - lift;
    ctx2.fillStyle = PALETTE.shadow;
    rr(ctx2, x + 3, top + 5, HAND_CARD.w, HAND_CARD.h, 10);
    ctx2.fill();
    ctx2.fillStyle = PALETTE.cream;
    rr(ctx2, x, top, HAND_CARD.w, HAND_CARD.h, 10);
    ctx2.fill();
    ctx2.strokeStyle = playable ? PALETTE.gold : (hovered ? el.color : '#b8a888');
    ctx2.lineWidth = playable || hovered ? 3 : 1.5;
    rr(ctx2, x, top, HAND_CARD.w, HAND_CARD.h, 10);
    ctx2.stroke();
    ctx2.fillStyle = el.color;
    rr(ctx2, x, top, HAND_CARD.w, 34, 10);
    ctx2.fill();
    ctx2.fillRect(x, top + 24, HAND_CARD.w, 10);
    let nameSize = 16;
    font(nameSize, true, false);
    while (ctx2.measureText(def.name).width > 88 && nameSize > 11) {
      nameSize -= 1;
      font(nameSize, true, false);
    }
    ctx2.fillStyle = '#ffffff';
    ctx2.textAlign = 'center';
    ctx2.fillText(def.name, x + 83, top + 23);
    ctx2.fillStyle = el.color;
    ctx2.beginPath();
    ctx2.arc(x + 20, top + 20, 15, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.strokeStyle = PALETTE.cream;
    ctx2.lineWidth = 2;
    ctx2.stroke();
    font(20, true, false);
    ctx2.fillStyle = '#ffffff';
    ctx2.fillText(String(def.cost), x + 20, top + 27);
    drawGlyph(ctx2, def.element, x + HAND_CARD.w / 2, top + 82, 24);
    font(13, false, false);
    ctx2.fillStyle = PALETTE.inkSoft;
    ctx2.textAlign = 'center';
    const lines = wrapText(ctx2, def.text, HAND_CARD.w - 18);
    for (let i = 0; i < lines.length; i += 1) ctx2.fillText(lines[i], x + HAND_CARD.w / 2, top + 122 + i * 16);
    if (def.kind === 'creature') {
      ctx2.fillStyle = '#2c5a20';
      ctx2.beginPath();
      ctx2.arc(x + 20, top + HAND_CARD.h - 20, 15, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = '#a83218';
      ctx2.beginPath();
      ctx2.arc(x + HAND_CARD.w - 20, top + HAND_CARD.h - 20, 15, 0, Math.PI * 2);
      ctx2.fill();
      font(18, true, false);
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'center';
      ctx2.fillText(String(def.attack), x + 20, top + HAND_CARD.h - 13);
      ctx2.fillText(String(def.health), x + HAND_CARD.w - 20, top + HAND_CARD.h - 13);
      if (def.armor > 0) {
        ctx2.fillStyle = PALETTE.stone;
        ctx2.beginPath();
        ctx2.arc(x + HAND_CARD.w / 2, top + HAND_CARD.h - 20, 11, 0, Math.PI * 2);
        ctx2.fill();
        font(14, true, false);
        ctx2.fillStyle = '#ffffff';
        ctx2.fillText(String(def.armor), x + HAND_CARD.w / 2, top + HAND_CARD.h - 15);
      }
    } else {
      font(13, true, false);
      ctx2.fillStyle = el.dark;
      ctx2.textAlign = 'center';
      ctx2.fillText('SPELL', x + HAND_CARD.w / 2, top + HAND_CARD.h - 14);
    }
    if (!playable) {
      ctx2.fillStyle = 'rgba(20,20,20,0.35)';
      rr(ctx2, x, top, HAND_CARD.w, HAND_CARD.h, 10);
      ctx2.fill();
    }
  }

  function drawBoardCard(ctx2, creature, x, y, mine, ready, selected) {
    const def = cardById(creature.defId);
    const el = ELEMENTS[def.element];
    ctx2.fillStyle = PALETTE.shadow;
    rr(ctx2, x + 3, y + 4, BOARD_CARD.w, BOARD_CARD.h, 9);
    ctx2.fill();
    ctx2.fillStyle = PALETTE.cream;
    rr(ctx2, x, y, BOARD_CARD.w, BOARD_CARD.h, 9);
    ctx2.fill();
    ctx2.strokeStyle = selected ? PALETTE.gold : (mine && ready ? '#7ec850' : '#b8a888');
    ctx2.lineWidth = selected ? 4 : 2;
    rr(ctx2, x, y, BOARD_CARD.w, BOARD_CARD.h, 9);
    ctx2.stroke();
    ctx2.fillStyle = el.color;
    rr(ctx2, x, y, BOARD_CARD.w, 26, 9);
    ctx2.fill();
    ctx2.fillRect(x, y + 17, BOARD_CARD.w, 9);
    font(13, true, false);
    ctx2.fillStyle = '#ffffff';
    ctx2.textAlign = 'center';
    ctx2.fillText(def.name, x + BOARD_CARD.w / 2, y + 19);
    drawGlyph(ctx2, def.element, x + BOARD_CARD.w / 2, y + 62, 20);
    ctx2.fillStyle = '#2c5a20';
    ctx2.beginPath();
    ctx2.arc(x + 18, y + BOARD_CARD.h - 18, 14, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = '#a83218';
    ctx2.beginPath();
    ctx2.arc(x + BOARD_CARD.w - 18, y + BOARD_CARD.h - 18, 14, 0, Math.PI * 2);
    ctx2.fill();
    font(17, true, false);
    ctx2.fillStyle = '#ffffff';
    ctx2.textAlign = 'center';
    ctx2.fillText(String(creature.attack), x + 18, y + BOARD_CARD.h - 12);
    ctx2.fillText(String(creature.health), x + BOARD_CARD.w - 18, y + BOARD_CARD.h - 12);
    if (creature.armor > 0) {
      ctx2.fillStyle = PALETTE.stone;
      ctx2.beginPath();
      ctx2.arc(x + BOARD_CARD.w / 2, y + BOARD_CARD.h - 18, 10, 0, Math.PI * 2);
      ctx2.fill();
      font(13, true, false);
      ctx2.fillText(String(creature.armor), x + BOARD_CARD.w / 2, y + BOARD_CARD.h - 13);
    }
    if (!creature.canAttack) {
      ctx2.fillStyle = 'rgba(20,20,20,0.28)';
      rr(ctx2, x, y, BOARD_CARD.w, BOARD_CARD.h, 9);
      ctx2.fill();
    }
  }

  function drawButton(ctx2, box, label, enabled) {
    ctx2.fillStyle = enabled ? PALETTE.gold : '#5a5346';
    rr(ctx2, box.x, box.y, box.w, box.h, 10);
    ctx2.fill();
    ctx2.strokeStyle = PALETTE.goldDark;
    ctx2.lineWidth = 2;
    ctx2.stroke();
    font(20, true, false);
    ctx2.fillStyle = enabled ? PALETTE.ink : PALETTE.muted;
    ctx2.textAlign = 'center';
    ctx2.fillText(label, box.x + box.w / 2, box.y + box.h / 2 + 7);
  }

  function drawSidePanel(ctx2, side, x, y, isPlayer) {
    const p = side;
    drawPortrait(ctx2, x + 34, y + 34, 30, isPlayer ? 'leaf' : 'flame', p.name);
    font(19, true, true);
    ctx2.fillStyle = PALETTE.text;
    ctx2.textAlign = 'left';
    ctx2.fillText(p.name, x + 76, y + 28);
    font(13, false, false);
    ctx2.fillStyle = PALETTE.muted;
    ctx2.fillText(isPlayer ? 'Lantern Keeper' : 'The Warden', x + 76, y + 48);
    drawLife(ctx2, x + 76, y + 72, p.life, p.maxLife);
    drawMana(ctx2, x + 8, y + 108, p.mana, Math.max(p.maxMana, 1));
    font(14, false, false);
    ctx2.fillStyle = PALETTE.muted;
    ctx2.textAlign = 'left';
    ctx2.fillText('Deck ' + p.deck.length + ' cards', x + 8, y + 138);
  }

  function drawPlay(state, ui) {
    const me = state.players[0];
    const foe = state.players[1];
    drawSidePanel(ctx, foe, 36, 62, false);
    const backs = Math.min(foe.hand.length, 7);
    for (let i = 0; i < backs; i += 1) drawCardBack(ctx, 700 + i * 56, 66, 46, 64);
    font(14, false, false);
    ctx.fillStyle = PALETTE.muted;
    ctx.textAlign = 'left';
    ctx.fillText('Opponent hand: ' + foe.hand.length + ' cards', 1000, 102);
    if (foe.board.length === 0) {
      font(16, false, false);
      ctx.fillStyle = PALETTE.muted;
      ctx.textAlign = 'center';
      ctx.fillText('The Warden has no creatures on the board yet.', FIELD.width / 2, BOARD_TOP_Y + 66);
    }
    const foeLay = boardLayout(Math.max(foe.board.length, 1));
    for (let i = 0; i < foe.board.length; i += 1) {
      const x = foeLay.x0 + i * (BOARD_CARD.w + foeLay.gap);
      const targeted = ui.selectedAttacker >= 0;
      drawBoardCard(ctx, foe.board[i], x, BOARD_TOP_Y, false, false, targeted);
    }
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(40, 292, FIELD.width - 80, 2);
    font(15, false, false);
    ctx.fillStyle = PALETTE.cream;
    ctx.textAlign = 'left';
    ctx.fillText('Turn ' + state.turn + '  —  ' + state.log, 40, 322);
    const myTurn = state.phase === 'player';
    drawButton(ctx, END_TURN, myTurn ? 'End Turn' : 'Warden acts…', myTurn);
    if (me.board.length === 0) {
      font(16, false, false);
      ctx.fillStyle = PALETTE.muted;
      ctx.textAlign = 'center';
      ctx.fillText('Your board is empty. Play a creature card below.', FIELD.width / 2, BOARD_BOT_Y + 66);
    }
    const myLay = boardLayout(Math.max(me.board.length, 1));
    for (let i = 0; i < me.board.length; i += 1) {
      const x = myLay.x0 + i * (BOARD_CARD.w + myLay.gap);
      drawBoardCard(ctx, me.board[i], x, BOARD_BOT_Y, true, me.board[i].canAttack && myTurn, ui.selectedAttacker === i);
    }
    drawSidePanel(ctx, me, 36, 520, true);
    const lay = handLayout(Math.max(me.hand.length, 1));
    for (let i = 0; i < me.hand.length; i += 1) {
      const x = lay.x0 + i * (HAND_CARD.w + lay.gap);
      const hovered = ui.hover && ui.hover.x >= x && ui.hover.x <= x + HAND_CARD.w && ui.hover.y >= HAND_Y - 16 && ui.hover.y <= HAND_Y + HAND_CARD.h;
      drawHandCard(ctx, me.hand[i], x, HAND_Y, myTurn && me.hand[i] && cardById(me.hand[i].defId).cost <= me.mana, hovered || ui.selectedHand === i);
    }
    if (ui.selectedAttacker >= 0) {
      font(15, true, false);
      ctx.fillStyle = PALETTE.gold;
      ctx.textAlign = 'center';
      ctx.fillText('Choose a target: an enemy creature, or the Warden.', FIELD.width / 2, 348);
    }
    font(13, false, false);
    ctx.fillStyle = PALETTE.muted;
    ctx.textAlign = 'right';
    ctx.fillText('Click a card to play it  •  Click a creature, then a target, to attack  •  P pause  •  M mute', FIELD.width - 28, 706);
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(6,24,21,0.55)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#f7c95c';
    ctx.beginPath();
    ctx.arc(FIELD.width / 2, 168, 74, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7ead0';
    ctx.beginPath();
    ctx.arc(FIELD.width / 2, 168, 58, 0, Math.PI * 2);
    ctx.fill();
    drawFlame(ctx, FIELD.width / 2, 168, 34, '#e4572e');
    ctx.fillStyle = PALETTE.goldDark;
    ctx.fillRect(FIELD.width / 2 - 14, 82, 28, 10);
    ctx.fillRect(FIELD.width / 2 - 3, 74, 6, 8);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.moveTo(FIELD.width / 2 - 10, 246);
    ctx.lineTo(FIELD.width / 2 + 10, 246);
    ctx.lineTo(FIELD.width / 2, 260);
    ctx.closePath();
    ctx.fill();
    text('EMBER COURT', FIELD.width / 2, 330, 64, PALETTE.gold, 'center', true, true);
    text('A duel of lanterns, elements and nerve', FIELD.width / 2, 368, 22, PALETTE.cream, 'center', false, true);
    const lines = [
      'You and the Ashen Warden start at 24 life. Play creatures, cast spells,',
      'and strike the Warden down before your own lantern goes out.',
      'Flame burns  •  Leaf mends  •  Tide draws  •  Stone endures',
    ];
    for (let i = 0; i < lines.length; i += 1) text(lines[i], FIELD.width / 2, 412 + i * 28, 18, PALETTE.text, 'center', false, false);
    drawButton(ctx, START_BUTTON, 'Start the Duel', true);
    if (best > 0) text('Best score: ' + best, FIELD.width / 2, 622, 17, PALETTE.muted, 'center', false, false);
    text('Click or press Enter to start  •  P pause  •  M mute  •  R restart', FIELD.width / 2, 652, 14, PALETTE.muted, 'center', false, false);
    void state;
  }

  function drawPanel(title, lines, prompt, box) {
    ctx.fillStyle = 'rgba(6,24,21,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.panel;
    rr(ctx, box.x, box.y, box.w, box.h, 14);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    rr(ctx, box.x, box.y, box.w, box.h, 14);
    ctx.stroke();
    text(title, FIELD.width / 2, box.y + 84, 56, title === 'VICTORY' ? PALETTE.gold : '#e4572e', 'center', true, true);
    for (let i = 0; i < lines.length; i += 1) text(lines[i], FIELD.width / 2, box.y + 140 + i * 30, 19, PALETTE.text, 'center', false, false);
    text(prompt, FIELD.width / 2, box.y + box.h - 88, 17, PALETTE.muted, 'center', false, false);
  }

  function drawOver(state, best) {
    const won = state.winner === 'player';
    const title = won ? 'VICTORY' : 'DEFEAT';
    const lines = won
      ? ['The Ashen Warden bows out. The court is yours.', 'Score ' + state.score + '  •  Life left ' + state.players[0].life + '  •  Turns ' + state.turn, 'Best score ' + Math.max(best, state.score)]
      : ['The lanterns dim. The Warden keeps the court.', 'Score ' + state.score + '  •  Life left ' + state.players[0].life + '  •  Turns ' + state.turn, 'Best score ' + best];
    drawPanel(title, lines, 'Press Enter or click Play Again', { x: 340, y: 150, w: 600, h: 330 });
    drawButton(ctx, AGAIN_BUTTON, 'Play Again', true);
    void best;
  }

  function drawPaused() {
    drawPanel('PAUSED', ['The duel waits for you.'], 'Press P or click to resume', { x: 340, y: 190, w: 600, h: 260 });
  }

  function draw(state, screen, best, ui) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.feltDark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawTable();
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_OVER) { drawPlay(state, ui); drawOver(state, best); }
    else if (screen === SCREEN_PAUSED) { drawPlay(state, ui); drawPaused(); }
    else drawPlay(state, ui);
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, resize };
}
