import { FIELD } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_MUTE = 4;
export const ACTION_RESTART = 8;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const MUTE = new Set(['KeyM']);
const RESTART = new Set(['KeyR']);

export function createInput(canvas) {
  let actions = 0;
  let click = null;
  let hover = { x: -1, y: -1 };
  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    const ox = (rect.width - FIELD.width * scale) / 2;
    const oy = (rect.height - FIELD.height * scale) / 2;
    return { x: (event.clientX - rect.left - ox) / scale, y: (event.clientY - rect.top - oy) / scale };
  }
  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('blur', () => { hover = { x: -1, y: -1 }; });
  canvas.addEventListener('pointerdown', (event) => {
    click = toLogical(event);
    actions |= ACTION_CONFIRM;
  });
  canvas.addEventListener('pointermove', (event) => { hover = toLogical(event); });
  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
    hover() {
      return hover;
    },
  };
}
