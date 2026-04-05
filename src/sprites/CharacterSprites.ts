import { C, SKIN_MASK, HAIR_MASK, SHIRT_MASK } from '../utils/ColorPalette';

// 16×16 player sprite frames
// SKIN_MASK  (0xFF00FF) = skin pixels — replaced at runtime
// HAIR_MASK  (0x00FFFF) = hair pixels — replaced at runtime
// SHIRT_MASK (0xFF8000) = shirt pixels — replaced at runtime

const _ = C.TRANSPARENT;
const K = C.ALMOST_BLACK;  // outline/shadow
const S = SKIN_MASK;       // skin
const H = HAIR_MASK;       // hair
const T = SHIRT_MASK;      // shirt (top)
const P = C.DARK_BROWN;    // pants
const E = C.BROWN;         // pants highlight
const W = C.WHITE;         // whites of eyes
const Y = C.ALMOST_BLACK;  // pupil

// ── Facing South (toward player) ─────────────────────────────────────────────

export const PLAYER_SOUTH_0: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,K,S,S,W,Y,W,Y,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,_,K,T,T,T,T,T,T,T,T,T,T,K,_,_],
  [_,_,K,T,T,T,T,T,T,T,T,T,T,K,_,_],
  [_,_,K,S,T,T,T,T,T,T,T,T,S,K,_,_],
  [_,_,K,S,K,P,P,K,K,P,P,K,S,K,_,_],
  [_,_,_,K,K,P,P,K,K,P,P,K,K,_,_,_],
  [_,_,_,_,K,E,E,K,K,E,E,K,_,_,_,_],
  [_,_,_,_,K,K,K,_,_,K,K,K,_,_,_,_],
];

export const PLAYER_SOUTH_1: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,K,S,S,W,Y,W,Y,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,K,T,T,T,T,T,T,T,T,T,T,T,T,K,_],
  [_,K,T,T,T,T,T,T,T,T,T,T,T,T,K,_],
  [_,K,S,T,T,T,T,T,T,T,T,T,T,S,K,_],
  [_,_,K,K,P,P,P,K,K,P,P,P,K,K,_,_],
  [_,_,_,K,P,P,K,K,K,K,P,P,K,_,_,_],
  [_,_,_,K,E,E,K,_,_,K,E,E,K,_,_,_],
  [_,_,_,K,K,K,_,_,_,_,K,K,_,_,_,_],
];

export const PLAYER_SOUTH_2: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,K,S,S,W,Y,W,Y,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,K,T,T,T,T,T,T,T,T,T,T,T,T,K,_],
  [_,K,T,T,T,T,T,T,T,T,T,T,T,T,K,_],
  [_,K,S,T,T,T,T,T,T,T,T,T,T,S,K,_],
  [_,_,K,K,P,P,P,K,K,P,P,P,K,K,_,_],
  [_,_,_,K,K,P,P,K,K,P,P,K,K,_,_,_],
  [_,_,_,K,E,E,K,_,_,K,E,E,K,_,_,_],
  [_,_,_,K,K,K,_,_,_,_,K,K,_,_,_,_],
];

// ── Facing North (away from player) ─────────────────────────────────────────

export const PLAYER_NORTH_0: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,S,S,S,S,H,K,_,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,_,K,T,T,T,T,T,T,T,T,T,T,K,_,_],
  [_,_,K,T,T,T,T,T,T,T,T,T,T,K,_,_],
  [_,_,K,S,T,T,T,T,T,T,T,T,S,K,_,_],
  [_,_,K,S,K,P,P,K,K,P,P,K,S,K,_,_],
  [_,_,_,K,K,P,P,K,K,P,P,K,K,_,_,_],
  [_,_,_,_,K,E,E,K,K,E,E,K,_,_,_,_],
  [_,_,_,_,K,K,K,_,_,K,K,K,_,_,_,_],
];

export const PLAYER_NORTH_1: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,K,H,S,S,S,S,H,K,_,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,S,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,K,T,T,T,T,T,T,T,T,T,T,T,T,K,_],
  [_,K,T,T,T,T,T,T,T,T,T,T,T,T,K,_],
  [_,K,S,T,T,T,T,T,T,T,T,T,T,S,K,_],
  [_,_,K,K,P,P,P,K,K,P,P,P,K,K,_,_],
  [_,_,_,K,P,P,K,K,K,K,P,P,K,_,_,_],
  [_,_,_,K,E,E,K,_,_,K,E,E,K,_,_,_],
  [_,_,_,K,K,K,_,_,_,_,K,K,_,_,_,_],
];

// ── Facing East (right) ──────────────────────────────────────────────────────

export const PLAYER_EAST_0: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,_,K,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,_,K,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,K,S,S,W,Y,S,S,S,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,K,T,T,T,T,T,T,K,_,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,T,K,_,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,K,_,_,_,_],
  [_,_,_,K,P,P,P,P,P,P,K,_,_,_,_,_],
  [_,_,_,K,P,P,P,P,P,P,K,_,_,_,_,_],
  [_,_,_,K,E,E,K,_,K,E,E,K,_,_,_,_],
  [_,_,_,K,K,K,_,_,_,K,K,K,_,_,_,_],
];

export const PLAYER_EAST_1: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,_,K,H,H,H,H,H,K,_,_,_,_],
  [_,_,_,_,_,K,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,K,S,S,W,Y,S,S,S,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,S,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,K,T,T,T,T,T,T,K,_,_,_,_],
  [_,_,K,T,T,T,T,T,T,T,T,T,T,K,_,_],
  [_,_,K,T,T,T,T,T,T,T,T,T,T,K,_,_],
  [_,_,_,K,T,T,T,T,T,T,T,K,_,_,_,_],
  [_,_,_,K,K,P,P,P,P,K,K,_,_,_,_,_],
  [_,_,_,_,K,P,P,K,P,P,K,_,_,_,_,_],
  [_,_,_,K,E,E,K,_,K,E,E,K,_,_,_,_],
  [_,_,_,K,K,K,_,_,_,K,K,K,_,_,_,_],
];

// ── Facing West (left) ───────────────────────────────────────────────────────
// Mirror of East frames

function mirrorFrame(frame: number[][]): number[][] {
  return frame.map(row => [...row].reverse());
}

export const PLAYER_WEST_0 = mirrorFrame(PLAYER_EAST_0);
export const PLAYER_WEST_1 = mirrorFrame(PLAYER_EAST_1);

// ── All animation frame sets ─────────────────────────────────────────────────

export const PLAYER_FRAMES = {
  south: [PLAYER_SOUTH_0, PLAYER_SOUTH_1, PLAYER_SOUTH_0, PLAYER_SOUTH_2],
  north: [PLAYER_NORTH_0, PLAYER_NORTH_1, PLAYER_NORTH_0, PLAYER_NORTH_1],
  east:  [PLAYER_EAST_0,  PLAYER_EAST_1,  PLAYER_EAST_0,  PLAYER_EAST_1 ],
  west:  [PLAYER_WEST_0,  PLAYER_WEST_1,  PLAYER_WEST_0,  PLAYER_WEST_1 ],
};
