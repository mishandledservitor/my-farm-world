import { C } from '../utils/ColorPalette';

const _ = C.TRANSPARENT;
const W  = C.WHITE;
const LG = C.LIGHT_GREY;
const MG = C.MID_GREY;
const DG = C.DARK_GREY;
const B  = C.BROWN;
const LB = C.LIGHT_BROWN;  // vibrant orange-brown (also serves as "orange" for beaks/feet)
const DB = C.DARK_BROWN;
const T  = C.TAN;
const Y  = C.YELLOW;
const R  = C.RED;
const DR = C.DARK_RED;

// ── World sprites (16×16) ──────────────────────────────────────────────────────

export const SPRITE_CHICKEN: number[][] = [
  [_,_,_,R, R, _,_,_,_,_,_,_,_,_,_,_],  // comb
  [_,_,R, W, W, LB,_,_,_,_,_,_,_,_,_,_],  // head + beak
  [_,_,_,W, W, W, _,_,_,_,_,_,_,_,_,_],  // head
  [_,_,W, W, W, W, W, W, _,_,_,_,_,_,_,_],  // body start
  [_,W, W, W, W, W, W, W, W, LG,_,_,_,_,_,_],  // body
  [_,W, W, W, W, W, W, W, W, W, Y, _,_,_,_,_],  // body + tail
  [_,W, W, W, W, W, W, W, Y, Y, _,_,_,_,_,_],  // body + tail
  [_,_,W, W, W, W, W, _,_,_,_,_,_,_,_,_],  // lower body
  [_,_,_,LB,_,LB,_,_,_,_,_,_,_,_,_,_],  // legs
  [_,_,_,LB,_,LB,_,_,_,_,_,_,_,_,_,_],  // legs
  [_,_,LB,LB,LB,LB,LB,_,_,_,_,_,_,_,_,_],  // feet
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const SPRITE_COW: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,B, _,_,_,_,_,B, _,_,_,_,_,_],  // horns
  [_,_,B, T, T, T, T, T, T, T, B, _,_,_,_,_],  // head top
  [_,_,T, T, W, T, T, T, W, T, T, _,_,_,_,_],  // eyes
  [_,_,T, T, T, T, T, T, T, T, T, _,_,_,_,_],  // face
  [_,_,_,T, T, T, T, T, T, T, _,_,_,_,_,_],  // muzzle
  [_,_,T, T, T, T, T, T, T, T, T, T, _,_,_,_],  // neck/body
  [_,T, T, B, B, T, T, T, B, T, T, T, T, _,_,_],  // body + spots
  [_,T, T, T, B, T, T, T, T, T, T, T, T, _,_,_],  // body + spot
  [_,T, T, T, T, T, T, T, T, T, T, T, T, _,_,_],  // body
  [_,_,T, T, T, T, T, T, T, T, T, T, _,_,_,_],  // belly
  [_,_,T, _,_,T, T, _,_,T, _,_,_,_,_,_],  // upper legs
  [_,_,T, _,_,T, T, _,_,T, _,_,_,_,_,_],  // legs
  [_,_,B, _,_,B, B, _,_,B, _,_,_,_,_,_],  // hooves
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const SPRITE_BARN: number[][] = [
  [_,_,_,_,_,_,_,B, _,_,_,_,_,_,_,_],  // roof peak
  [_,_,_,_,_,_,B, DR,B, _,_,_,_,_,_,_],
  [_,_,_,_,_,B, DR,DR,DR,B, _,_,_,_,_,_],
  [_,_,_,_,B, DR,DR,DR,DR,DR,B, _,_,_,_,_],
  [_,_,_,DB,DR,DR,DR,DR,DR,DR,DR,DB,_,_,_,_],
  [_,_,DB,R, R, R, R, R, R, R, R, R, DB,_,_,_],  // wall
  [_,_,DB,R, W, W, R, R, R, W, W, R, DB,_,_,_],  // windows
  [_,_,DB,R, W, W, R, R, R, W, W, R, DB,_,_,_],
  [_,_,DB,R, R, R, R, R, R, R, R, R, DB,_,_,_],
  [_,_,DB,R, R, DB,DB,DB,DB,R, R, R, DB,_,_,_],  // door frame
  [_,_,DB,R, R, DG,DG,DG,DG,R, R, R, DB,_,_,_],  // door
  [_,_,DB,R, R, DG,DG,DG,DG,R, R, R, DB,_,_,_],
  [_,_,DB,R, R, DG,DG,DG,DG,R, R, R, DB,_,_,_],
  [DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,_,_],  // base
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const SPRITE_TROUGH: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,_,_,_,_],
  [_,_,DB,B, B, B, B, B, B, B, B, DB,_,_,_,_],
  [_,_,DB,B, Y, Y, Y, Y, Y, Y, B, DB,_,_,_,_],  // hay
  [_,_,DB,B, Y, LB,Y, LB,Y, Y, B, DB,_,_,_,_],  // straw detail
  [_,_,DB,B, Y, Y, Y, Y, Y, Y, B, DB,_,_,_,_],
  [_,_,DB,B, B, B, B, B, B, B, B, DB,_,_,_,_],
  [_,_,DB,DB,DB,DB,DB,DB,DB,DB,DB,DB,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const SPRITE_CHURN: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,W, W, W, W, _,_,_,_,_,_,_,_],  // lid
  [_,_,_,DB,MG,MG,MG,MG,DB,_,_,_,_,_,_,_],  // top band
  [_,_,_,B, LB,B, B, LB,B, _,_,_,_,_,_,_],  // stave
  [_,_,_,B, LB,B, B, LB,B, _,_,_,_,_,_,_],
  [_,_,_,DB,MG,MG,MG,MG,DB,_,_,_,_,_,_,_],  // band
  [_,_,_,B, LB,B, B, LB,B, _,_,_,_,_,_,_],
  [_,_,_,B, LB,B, B, LB,B, _,_,_,_,_,_,_],
  [_,_,_,DB,MG,MG,MG,MG,DB,_,_,_,_,_,_,_],  // band
  [_,_,_,B, LB,B, B, LB,B, _,_,_,_,_,_,_],
  [_,_,_,B, LB,B, B, LB,B, _,_,_,_,_,_,_],
  [_,_,_,DB,MG,MG,MG,MG,DB,_,_,_,_,_,_,_],  // bottom band
  [_,_,_,_,B, B, B, B, _,_,_,_,_,_,_,_],  // base
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const SPRITE_MILL: number[][] = [
  [_,_,_,_,MG,MG,MG,MG,MG,_,_,_,_,_,_,_],  // grindstone top
  [_,_,_,MG,LG,LG,LG,LG,LG,MG,_,_,_,_,_,_],
  [_,_,MG,LG,DG,DG,DG,DG,LG,MG,_,_,_,_,_,_],  // stone face
  [_,_,MG,LG,DG,LG,LG,DG,LG,MG,_,_,_,_,_,_],  // groove
  [_,_,MG,LG,LG,LG,LG,LG,LG,MG,_,_,_,_,_,_],
  [_,_,_,MG,MG,MG,MG,MG,MG,_,_,_,_,_,_,_],  // stone bottom
  [_,_,_,_,B, Y, Y, Y, B, _,_,_,_,_,_,_],  // grain hopper
  [_,_,B, B, B, B, B, B, B, B, _,_,_,_,_,_],  // base
  [_,_,B, LB,LB,LB,LB,LB,LB,B, _,_,_,_,_,_],
  [_,_,B, LB,LB,DB,LB,LB,DB,B, _,_,_,_,_,_],  // wood detail
  [_,_,B, LB,LB,LB,LB,LB,LB,B, _,_,_,_,_,_],
  [_,_,DB,DB,DB,DB,DB,DB,DB,DB,_,_,_,_,_,_],  // base bottom
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const SPRITE_OVEN: number[][] = [
  [_,_,DG,DG,DG,DG,DG,DG,DG,DG,DG,DG,_,_,_,_],  // top
  [_,DG,MG,MG,MG,MG,MG,MG,MG,MG,MG,MG,DG,_,_,_],
  [_,DG,MG,LG,LG,LG,LG,LG,LG,LG,LG,MG,DG,_,_,_],
  [_,DG,MG,LG,DG,DG,DG,DG,DG,DG,LG,MG,DG,_,_,_],  // recessed top
  [_,DG,MG,LG,DG,DG,DG,DG,DG,DG,LG,MG,DG,_,_,_],
  [_,DG,MG,LG,LG,LG,LG,LG,LG,LG,LG,MG,DG,_,_,_],
  [_,DG,MG,MG,DG,DG,DG,DG,DG,DG,MG,MG,DG,_,_,_],  // door frame
  [_,DG,MG,MG,DG,DR,LB,LB,LB,DG,MG,MG,DG,_,_,_],  // fire
  [_,DG,MG,MG,DG,Y, LB,Y, LB,DG,MG,MG,DG,_,_,_],  // fire center
  [_,DG,MG,MG,DG,DR,LB,LB,DR,DG,MG,MG,DG,_,_,_],
  [_,DG,MG,MG,DG,DG,DG,DG,DG,DG,MG,MG,DG,_,_,_],  // door bottom
  [_,DG,MG,MG,MG,MG,MG,MG,MG,MG,MG,MG,DG,_,_,_],
  [_,_,DG,DG,DG,DG,DG,DG,DG,DG,DG,DG,_,_,_,_],  // base
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];
