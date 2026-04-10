import { C } from '../utils/ColorPalette';

const _ = C.TRANSPARENT;
const W  = C.WHITE;
const LG = C.LIGHT_GREY;
const MG = C.MID_GREY;
const DG = C.DARK_GREY;
const BK = C.ALMOST_BLACK;
const G  = C.PALE_GREEN;
const FG = C.FOREST_GREEN;
const DGR = C.DARK_GREEN;
const R  = C.RED;
const B  = C.BROWN;
const DB = C.DARK_BROWN;

// ── World sprites (16×16) ──────────────────────────────────────────────────────

export const SPRITE_BERRY_BUSH: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  DGR,G,  DGR,DGR,G,  DGR,_,  _,  _,  _,  _,  _],  // top leaves
  [_,  _,  _,  DGR,G,  G,  G,  G,  G,  G,  DGR,_,  _,  _,  _,  _],
  [_,  _,  DGR,G,  G,  R,  G,  G,  R,  G,  G,  DGR,_,  _,  _,  _],  // berries
  [_,  _,  DGR,G,  G,  G,  G,  G,  G,  G,  G,  DGR,_,  _,  _,  _],
  [_,  _,  DGR,G,  R,  G,  G,  G,  R,  G,  G,  DGR,_,  _,  _,  _],  // berries
  [_,  _,  DGR,G,  G,  G,  G,  G,  G,  G,  G,  DGR,_,  _,  _,  _],
  [_,  _,  _,  DGR,G,  G,  G,  G,  G,  G,  DGR,_,  _,  _,  _,  _],
  [_,  _,  _,  _,  DGR,DGR,DGR,DGR,DGR,_,  _,  _,  _,  _,  _,  _],  // base
  [_,  _,  _,  _,  _,  B,  _,  _,  B,  _,  _,  _,  _,  _,  _,  _],  // stems
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

export const SPRITE_CAVE_ENTRANCE: number[][] = [
  [_,  _,  _,  DG, DG, DG, DG, DG, DG, DG, DG, DG, _,  _,  _,  _],  // arch top
  [_,  _,  DG, MG, MG, MG, MG, MG, MG, MG, MG, MG, DG, _,  _,  _],
  [_,  DG, MG, LG, BK, BK, BK, BK, BK, BK, LG, MG, DG, _,  _,  _],  // cave opening
  [_,  DG, MG, LG, BK, BK, BK, BK, BK, BK, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, LG, BK, BK, BK, BK, BK, BK, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, LG, BK, BK, BK, BK, BK, BK, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, LG, BK, BK, BK, BK, BK, BK, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, LG, BK, BK, BK, BK, BK, BK, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, MG, MG, MG, MG, MG, MG, MG, MG, MG, DG, _,  _,  _],  // arch base
  [_,  _,  DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// Mine rock uses darker tones to stand out from the stone floor
const MR_D = C.ALMOST_BLACK;  // darkest outline
const MR_M = C.DARKER_GREY;   // mid rock body
const MR_L = C.DARK_GREY;     // lighter rock face
const MR_H = C.BROWN;         // highlight / ore specks

export const SPRITE_MINE_ROCK: number[][] = [
  [MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D],
  [MR_D, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_L, MR_L, MR_M, MR_L, MR_L, MR_L, MR_L, MR_L, MR_M, MR_L, MR_L, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_L, MR_H, MR_D, MR_M, MR_L, MR_L, MR_M, MR_D, MR_L, MR_L, MR_L, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_L, MR_M, MR_D, MR_D, MR_M, MR_M, MR_D, MR_D, MR_M, MR_L, MR_H, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_M, MR_L, MR_L, MR_M, MR_M, MR_M, MR_M, MR_L, MR_L, MR_M, MR_M, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_L, MR_L, MR_L, MR_M, MR_D, MR_D, MR_M, MR_L, MR_L, MR_L, MR_L, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_M, MR_L, MR_H, MR_L, MR_L, MR_L, MR_L, MR_L, MR_L, MR_M, MR_M, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_L, MR_M, MR_L, MR_L, MR_M, MR_M, MR_L, MR_L, MR_M, MR_L, MR_M, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_L, MR_L, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_L, MR_H, MR_L, MR_M, MR_M, MR_D],
  [MR_D, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_M, MR_D],
  [MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D, MR_D],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// Simple log stump — shown after a tree has been chopped
export const SPRITE_STUMP: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  DB, DB, DB, DB, DB, DB, _,  _,  _,  _,  _,  _],  // stump top
  [_,  _,  _,  _,  B,  DB, B,  B,  DB, B,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  B,  B,  B,  B,  B,  B,  B,  B,  _,  _,  _,  _,  _],  // wider base
  [_,  _,  _,  B,  DB, B,  B,  B,  B,  DB, B,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  B,  B,  B,  B,  B,  B,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// Sprinkler — small blue metal device with water nozzle (16×16)
const BL = C.BLUE;
const LB2 = C.LIGHT_BLUE;
const PB = C.PALE_BLUE;

export const SPRITE_SPRINKLER: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  PB, _,  PB, _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  PB, _,  PB, _,  PB, _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  PB, LB2,PB, _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  LB2,_,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  DG, LB2,DG, _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  DG, MG, LB2,MG, DG, _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  DG, MG, BL, MG, DG, _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  DG, MG, BL, LB2,BL, MG, DG, _,  _,  _,  _,  _],
  [_,  _,  _,  _,  DG, MG, BL, BL, BL, MG, DG, _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// Compost bin — wooden barrel with green compost peeking out (16×16)
const OL = C.OLIVE;

export const SPRITE_COMPOST: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  DGR,DGR,FG, G,  FG, DGR,DGR,_,  _,  _,  _,  _],
  [_,  _,  _,  DB, B,  B,  DGR,FG, DGR,B,  B,  DB, _,  _,  _,  _],
  [_,  _,  _,  DB, B,  OL, B,  B,  B,  OL, B,  DB, _,  _,  _,  _],
  [_,  _,  _,  DB, B,  B,  B,  B,  B,  B,  B,  DB, _,  _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  _,  DB, B,  B,  B,  B,  B,  B,  B,  DB, _,  _,  _,  _],
  [_,  _,  _,  DB, B,  OL, B,  B,  B,  OL, B,  DB, _,  _,  _,  _],
  [_,  _,  _,  DB, B,  B,  B,  B,  B,  B,  B,  DB, _,  _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

// ── Item icons (12×12) ─────────────────────────────────────────────────────────

export const ICON_WOOD: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  DB, DB, DB, DB, DB, DB, DB, DB, _,  _],  // log ends
  [_,  _,  DB, B,  B,  B,  B,  B,  B,  DB, _,  _],
  [_,  DB, B,  B,  DB, B,  B,  DB, B,  B,  DB, _],  // grain
  [_,  DB, B,  DB, B,  B,  B,  B,  DB, B,  DB, _],
  [_,  DB, B,  B,  B,  B,  B,  B,  B,  B,  DB, _],
  [_,  DB, B,  B,  DB, B,  B,  DB, B,  B,  DB, _],
  [_,  DB, B,  DB, B,  B,  B,  B,  DB, B,  DB, _],
  [_,  _,  DB, B,  B,  B,  B,  B,  B,  DB, _,  _],
  [_,  _,  DB, DB, DB, DB, DB, DB, DB, DB, _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

export const ICON_BERRY: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  C.DARK_GREEN, C.PALE_GREEN, _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  C.PALE_GREEN, C.PALE_GREEN, C.DARK_GREEN, _,  _,  _,  _,  _],
  [_,  _,  _,  R,  R,  _,  _,  R,  R,  _,  _,  _],  // berries
  [_,  _,  R,  C.DARK_RED, R,  _,  R,  C.DARK_RED, R,  _,  _,  _],
  [_,  _,  R,  R,  R,  _,  R,  R,  R,  _,  _,  _],
  [_,  _,  _,  R,  _,  _,  _,  R,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

export const ICON_STONE: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  DG, MG, MG, LG, MG, MG, DG, _,  _,  _],
  [_,  _,  DG, MG, LG, LG, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, LG, LG, MG, LG, LG, MG, DG, _,  _],
  [_,  DG, MG, LG, MG, LG, MG, LG, MG, DG, _,  _],
  [_,  DG, MG, LG, LG, LG, LG, LG, MG, DG, _,  _],
  [_,  _,  DG, MG, MG, MG, MG, MG, DG, _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

export const ICON_IRON_ORE: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  DG, MG, C.LIGHT_BROWN, LG, C.LIGHT_BROWN, MG, DG, _,  _,  _],
  [_,  _,  DG, MG, LG, C.LIGHT_BROWN, LG, MG, DG, _,  _,  _],
  [_,  DG, MG, C.LIGHT_BROWN, LG, LG, C.LIGHT_BROWN, LG, MG, DG, _,  _],
  [_,  DG, MG, LG, C.LIGHT_BROWN, C.LIGHT_BROWN, LG, C.LIGHT_BROWN, MG, DG, _,  _],
  [_,  DG, MG, LG, LG, C.LIGHT_BROWN, LG, LG, MG, DG, _,  _],
  [_,  _,  DG, MG, MG, MG, MG, MG, DG, _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];

export const ICON_GOLD_ORE: number[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  DG, MG, C.GOLD, C.YELLOW, C.GOLD, MG, DG, _,  _,  _],
  [_,  _,  DG, MG, C.YELLOW, C.GOLD, C.YELLOW, MG, DG, _,  _,  _],
  [_,  DG, MG, C.GOLD, C.YELLOW, C.YELLOW, C.GOLD, C.YELLOW, MG, DG, _,  _],
  [_,  DG, MG, C.YELLOW, C.GOLD, C.GOLD, C.YELLOW, C.GOLD, MG, DG, _,  _],
  [_,  DG, MG, LG, C.YELLOW, C.GOLD, C.YELLOW, LG, MG, DG, _,  _],
  [_,  _,  DG, MG, MG, MG, MG, MG, DG, _,  _,  _],
  [_,  _,  _,  DG, DG, DG, DG, DG, _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],
];
