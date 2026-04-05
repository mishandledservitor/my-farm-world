import { C } from '../utils/ColorPalette';

const _ = C.TRANSPARENT;
const T  = C.TAN;
const B  = C.BROWN;
const DB = C.DARK_BROWN;
const LG = C.LIGHT_GREY;
const MG = C.MID_GREY;
const DG = C.DARK_GREY;
const G  = C.PALE_GREEN;  // cat eyes
const W  = C.WHITE;

// ── Dog (16×16 top-down) ──────────────────────────────────────────────────────

export const SPRITE_DOG: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,DB,_,_,_,_,_,DB,_,_,_,_,_,_],  // ears
  [_,_,DB,B, B, B, B, B, B, B, DB,_,_,_,_,_],  // back of head
  [_,_,B, B, T, B, B, B, T, B, B, _,_,_,_,_],  // eyes (tan highlights)
  [_,_,B, T, T, T, T, T, T, T, B, _,_,_,_,_],  // muzzle area
  [_,_,B, T, T, B, T, B, T, T, B, _,_,_,_,_],  // nose dots
  [_,_,_,B, T, T, T, T, T, B, _,_,_,_,_,_],   // chin
  [_,_,B, B, B, B, B, B, B, B, _,_,_,_,_,_],  // body
  [_,_,B, B, B, B, B, B, B, B, _,_,_,_,_,_],  // body
  [_,_,DB,B, B, B, B, B, B, DB,_,_,_,_,_,_],  // body base
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── Cat (16×16 top-down) ──────────────────────────────────────────────────────

export const SPRITE_CAT: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,MG,_,_,_,_,_,_,MG,_,_,_,_,_,_],   // pointed ears
  [_,MG,MG,LG,LG,LG,LG,LG,LG,MG,MG,_,_,_,_,_],  // head back
  [_,MG,LG,LG,G, LG,LG,G, LG,LG,MG,_,_,_,_,_],  // green eyes
  [_,MG,LG,LG,LG,LG,LG,LG,LG,LG,MG,_,_,_,_,_],  // face
  [_,MG,LG,W, LG,DG,LG,DG,LG,W, MG,_,_,_,_,_],  // whisker dots
  [_,_,MG,LG,LG,LG,LG,LG,LG,MG,_,_,_,_,_,_],   // lower face
  [_,_,MG,LG,LG,LG,LG,LG,LG,MG,_,_,_,_,_,_],   // body
  [_,_,MG,LG,LG,LG,LG,LG,LG,MG,_,_,_,_,_,_],   // body
  [_,_,DG,MG,MG,MG,MG,MG,MG,DG,_,_,_,_,_,_],   // body base
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];
