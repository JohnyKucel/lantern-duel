export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const START_LIFE = 24;
export const MAX_MANA = 8;
export const MAX_BOARD = 5;
export const HAND_LIMIT = 7;
export const DECK_SIZE = 24;
export const BEST_KEY = 'ember-court.best';
export const PALETTE = {
  felt: '#0e3a34',
  feltDark: '#0a2b27',
  feltLight: '#145049',
  gold: '#e8b64c',
  goldDark: '#b98a2e',
  cream: '#f7ead0',
  creamDark: '#e8d5ae',
  ink: '#221a12',
  inkSoft: '#4a3d2c',
  muted: '#9db8ae',
  text: '#f4efe4',
  panel: '#123f39',
  panelEdge: '#2a6a5e',
  flame: '#e4572e',
  leaf: '#5aa843',
  tide: '#3d9bd6',
  stone: '#8a8f98',
  enemy: '#c0392b',
  shadow: 'rgba(0,0,0,0.35)',
};
export const FONT = 'Georgia, "Times New Roman", serif';
export const FONT_UI = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const ELEMENTS = {
  flame: { name: 'Flame', color: '#e4572e', dark: '#a83218' },
  leaf: { name: 'Leaf', color: '#5aa843', dark: '#356b28' },
  tide: { name: 'Tide', color: '#3d9bd6', dark: '#236a99' },
  stone: { name: 'Stone', color: '#8a8f98', dark: '#5b6068' },
};
export const CARDS = [
  { id: 'ember-imp', name: 'Ember Imp', element: 'flame', kind: 'creature', cost: 1, attack: 2, health: 1, armor: 0, text: 'A spark with teeth.' },
  { id: 'cinder-wolf', name: 'Cinder Wolf', element: 'flame', kind: 'creature', cost: 2, attack: 3, health: 2, armor: 0, text: 'It hunts in the smoke.' },
  { id: 'flame-herald', name: 'Flame Herald', element: 'flame', kind: 'creature', cost: 3, attack: 4, health: 3, armor: 0, text: 'On play: burn the foe for 1.', onPlay: 'damageFace1' },
  { id: 'pyre-drake', name: 'Pyre Drake', element: 'flame', kind: 'creature', cost: 4, attack: 5, health: 4, armor: 0, text: 'The court bows to fire.' },
  { id: 'sproutling', name: 'Sproutling', element: 'leaf', kind: 'creature', cost: 1, attack: 1, health: 3, armor: 0, text: 'On play: mend 2 life.', onPlay: 'heal2' },
  { id: 'thornbriar', name: 'Thornbriar', element: 'leaf', kind: 'creature', cost: 2, attack: 2, health: 4, armor: 0, text: 'Every rose has a price.' },
  { id: 'grove-guardian', name: 'Grove Guard', element: 'leaf', kind: 'creature', cost: 3, attack: 3, health: 5, armor: 0, text: 'On play: mend 3 life.', onPlay: 'heal3' },
  { id: 'elder-treant', name: 'Elder Treant', element: 'leaf', kind: 'creature', cost: 4, attack: 4, health: 6, armor: 0, text: 'Older than the court.' },
  { id: 'tide-sprite', name: 'Tide Sprite', element: 'tide', kind: 'creature', cost: 1, attack: 2, health: 2, armor: 0, text: 'On play: draw a card.', onPlay: 'draw1' },
  { id: 'river-serpent', name: 'Tide Serpent', element: 'tide', kind: 'creature', cost: 2, attack: 3, health: 3, armor: 0, text: 'It knows the deep roads.' },
  { id: 'stormcaller', name: 'Stormcaller', element: 'tide', kind: 'creature', cost: 3, attack: 4, health: 3, armor: 0, text: 'On play: strike the foe for 2.', onPlay: 'damageFace2' },
  { id: 'deep-leviathan', name: 'Leviathan', element: 'tide', kind: 'creature', cost: 4, attack: 6, health: 5, armor: 0, text: 'The tide itself, awake.' },
  { id: 'pebble-golem', name: 'Pebble Golem', element: 'stone', kind: 'creature', cost: 1, attack: 1, health: 4, armor: 1, text: 'Armor 1: shrugs off a blow.' },
  { id: 'granite-sentinel', name: 'Stone Guard', element: 'stone', kind: 'creature', cost: 2, attack: 2, health: 5, armor: 1, text: 'Armor 1: shrugs off a blow.' },
  { id: 'bastion-knight', name: 'Stone Knight', element: 'stone', kind: 'creature', cost: 3, attack: 3, health: 6, armor: 1, text: 'Armor 1: shrugs off a blow.' },
  { id: 'mountain-king', name: 'Mountain King', element: 'stone', kind: 'creature', cost: 4, attack: 5, health: 7, armor: 1, text: 'Armor 1: shrugs off a blow.' },
  { id: 'fireball', name: 'Fireball', element: 'flame', kind: 'spell', cost: 2, attack: 0, health: 0, armor: 0, text: 'Deal 3 damage to the foe.', effect: 'damageFace3' },
  { id: 'healing-rain', name: 'Healing Rain', element: 'leaf', kind: 'spell', cost: 2, attack: 0, health: 0, armor: 0, text: 'Mend 6 life.', effect: 'heal6' },
  { id: 'tidal-surge', name: 'Tidal Surge', element: 'tide', kind: 'spell', cost: 3, attack: 0, health: 0, armor: 0, text: 'Draw 2. Burn the foe for 1.', effect: 'draw2Damage1' },
  { id: 'stonewall', name: 'Stonewall', element: 'stone', kind: 'spell', cost: 2, attack: 0, health: 0, armor: 0, text: 'Your creatures gain +1/+1.', effect: 'buffAll' },
];
export const DECK_IDS = [
  'ember-imp', 'cinder-wolf', 'flame-herald', 'pyre-drake',
  'sproutling', 'thornbriar', 'grove-guardian', 'elder-treant',
  'tide-sprite', 'river-serpent', 'stormcaller', 'deep-leviathan',
  'pebble-golem', 'granite-sentinel', 'bastion-knight', 'mountain-king',
  'fireball', 'healing-rain', 'tidal-surge', 'stonewall',
  'ember-imp', 'sproutling', 'tide-sprite', 'pebble-golem',
];
export function cardById(id) {
  for (let i = 0; i < CARDS.length; i += 1) if (CARDS[i].id === id) return CARDS[i];
  return CARDS[0];
}
