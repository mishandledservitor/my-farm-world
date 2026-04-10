import { C } from '../utils/ColorPalette';
import {
  ICON_WOOD, ICON_BERRY, ICON_STONE, ICON_IRON_ORE, ICON_GOLD_ORE,
} from './EnvironmentSprites';

export { ICON_WOOD, ICON_BERRY, ICON_STONE, ICON_IRON_ORE, ICON_GOLD_ORE };

const _ = C.TRANSPARENT;
const DG = C.DARK_GREY;
const MG = C.MID_GREY;
const LG = C.LIGHT_GREY;
const B  = C.BROWN;
const DB = C.DARK_BROWN;
const LB = C.LIGHT_BROWN;

// All item icons are 12×12 for use in inventory slots

export const ICON_HOE: number[][] = [
  [_,_,_,_,C.DARK_BROWN,C.BROWN,_,_,_,_,_,_],
  [_,_,_,C.DARK_BROWN,C.LIGHT_BROWN,C.BROWN,C.DARK_BROWN,_,_,_,_,_],
  [_,_,C.DARK_BROWN,C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,C.BROWN,C.DARK_BROWN,_,_,_,_],
  [_,_,C.DARK_BROWN,C.BROWN,C.LIGHT_BROWN,C.BROWN,C.DARK_BROWN,_,_,_,_,_],
  [_,_,_,C.DARK_BROWN,C.BROWN,C.DARK_BROWN,_,_,_,_,_,_],
  [_,_,_,_,C.DARK_BROWN,_,_,_,_,_,_,_],
  [_,_,_,C.DARK_BROWN,_,_,_,_,_,_,_,_],
  [_,_,C.LIGHT_BROWN,C.DARK_BROWN,_,_,_,_,_,_,_,_],
  [_,C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,_,_,_,_,_,_,_,_],
  [C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,C.BROWN,_,_,_,_,_,_,_,_],
  [C.BROWN,C.LIGHT_BROWN,C.BROWN,_,_,_,_,_,_,_,_,_],
  [_,C.DARK_BROWN,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_WATERING_CAN: number[][] = [
  [_,_,_,_,_,_,C.BLUE,C.BLUE,_,_,_,_],
  [_,_,_,_,_,C.BLUE,C.LIGHT_BLUE,C.BLUE,_,_,_,_],
  [_,_,_,_,C.DARK_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.DARK_BLUE,_,_,_],
  [_,_,C.DARK_BLUE,C.BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.BLUE,C.DARK_BLUE,_,_],
  [_,C.DARK_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_],
  [_,C.DARK_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_],
  [_,C.DARK_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_],
  [_,C.DARK_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_],
  [_,_,C.DARK_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_,_],
  [_,_,_,C.DARK_BLUE,C.BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_,_,_,_],
  [_,_,_,_,C.PALE_BLUE,_,C.PALE_BLUE,_,_,_,_,_],
  [_,_,_,_,C.LIGHT_BLUE,_,C.LIGHT_BLUE,_,_,_,_,_],
];

export const ICON_TURNIP: number[][] = [
  [_,_,_,_,_,C.PALE_GREEN,C.GREEN,_,_,_,_,_],
  [_,_,_,_,C.GREEN,C.PALE_GREEN,C.GREEN,C.PALE_GREEN,_,_,_,_],
  [_,_,_,C.PALE_GREEN,C.GREEN,C.PALE_GREEN,C.GREEN,C.PALE_GREEN,C.GREEN,_,_,_],
  [_,_,_,_,C.DARK_GREEN,C.GREEN,C.DARK_GREEN,C.GREEN,_,_,_,_],
  [_,_,_,C.DARK_PINK,C.PINK,C.DARK_PINK,C.PINK,C.DARK_PINK,C.PINK,_,_,_],
  [_,_,C.DARK_PINK,C.PINK,C.PINK,C.PINK,C.PINK,C.PINK,C.DARK_PINK,_,_,_],
  [_,_,C.DARK_PINK,C.PINK,C.PINK,C.PINK,C.PINK,C.PINK,C.DARK_PINK,_,_,_],
  [_,_,C.DARK_PINK,C.PINK,C.PINK,C.PINK,C.PINK,C.PINK,C.DARK_PINK,_,_,_],
  [_,_,_,C.DARK_PINK,C.PINK,C.PINK,C.PINK,C.DARK_PINK,_,_,_,_],
  [_,_,_,_,C.DARK_PINK,C.PINK,C.DARK_PINK,_,_,_,_,_],
  [_,_,_,_,_,C.DARK_BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_CARROT: number[][] = [
  [_,_,_,C.PALE_GREEN,C.GREEN,C.PALE_GREEN,C.GREEN,C.PALE_GREEN,_,_,_,_],
  [_,_,C.PALE_GREEN,C.GREEN,_,C.GREEN,_,C.GREEN,C.PALE_GREEN,_,_,_],
  [_,_,_,C.GREEN,_,_,_,C.GREEN,_,_,_,_],
  [_,_,_,_,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,_,_,_,_,_],
  [_,_,_,C.ORANGE,C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,C.ORANGE,_,_,_,_],
  [_,_,_,C.ORANGE,C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,C.ORANGE,_,_,_,_],
  [_,_,_,C.ORANGE,C.LIGHT_BROWN,C.LIGHT_BROWN,C.ORANGE,_,_,_,_,_],
  [_,_,_,_,C.ORANGE,C.ORANGE,C.ORANGE,_,_,_,_,_],
  [_,_,_,_,_,C.ORANGE,_,_,_,_,_,_],
  [_,_,_,_,_,C.LIGHT_BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_SEED: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,C.DARK_GREEN,_,_,_,_,_,_,_],
  [_,_,_,C.GREEN,C.PALE_GREEN,C.DARK_GREEN,_,_,_,_,_,_],
  [_,_,C.DARK_BROWN,C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,C.DARK_BROWN,_,_,_,_,_],
  [_,_,C.DARK_BROWN,C.TAN,C.LIGHT_BROWN,C.TAN,C.DARK_BROWN,_,_,_,_,_],
  [_,_,C.DARK_BROWN,C.LIGHT_BROWN,C.TAN,C.LIGHT_BROWN,C.DARK_BROWN,_,_,_,_,_],
  [_,_,_,C.DARK_BROWN,C.BROWN,C.DARK_BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_EGG: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,C.WHITE,C.WHITE,C.WHITE,_,_,_,_,_],
  [_,_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_,_],
  [_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_,_],
  [_,_,_,_,C.LIGHT_GREY,C.LIGHT_GREY,C.LIGHT_GREY,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_MILK: number[][] = [
  [_,_,_,C.LIGHT_GREY,C.LIGHT_GREY,C.LIGHT_GREY,C.LIGHT_GREY,_,_,_,_,_],
  [_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_,_],
  [_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.PALE_CYAN,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,C.LIGHT_GREY,C.WHITE,C.PALE_CYAN,C.WHITE,C.WHITE,C.PALE_CYAN,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.PALE_CYAN,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_],
  [_,_,C.LIGHT_GREY,C.WHITE,C.WHITE,C.WHITE,C.WHITE,C.LIGHT_GREY,_,_,_,_],
  [_,_,_,C.LIGHT_GREY,C.LIGHT_GREY,C.LIGHT_GREY,C.LIGHT_GREY,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_BUTTER: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.YELLOW,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.YELLOW,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.YELLOW,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.YELLOW,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.YELLOW,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.YELLOW,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.YELLOW,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.YELLOW,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.DARK_BROWN,_,_,_],
  [_,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_BREAD: number[][] = [
  [_,_,_,C.ORANGE,C.ORANGE,C.ORANGE,C.ORANGE,C.ORANGE,C.ORANGE,_,_,_],
  [_,_,C.LIGHT_BROWN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.LIGHT_BROWN,_,_],
  [_,C.LIGHT_BROWN,C.TAN,C.ORANGE,C.TAN,C.TAN,C.TAN,C.ORANGE,C.TAN,C.LIGHT_BROWN,_,_],
  [_,C.LIGHT_BROWN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.LIGHT_BROWN,_,_],
  [_,C.LIGHT_BROWN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.LIGHT_BROWN,_,_],
  [_,C.LIGHT_BROWN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.LIGHT_BROWN,_,_],
  [_,C.BROWN,C.LIGHT_BROWN,C.TAN,C.TAN,C.TAN,C.TAN,C.TAN,C.LIGHT_BROWN,C.BROWN,_,_],
  [_,C.BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.BROWN,_,_,_],
  [_,_,C.BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_FLOUR: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,C.MID_GREY, C.MID_GREY, C.MID_GREY,_,_,_,_,_],
  [_,_,_,C.MID_GREY, C.LIGHT_GREY, C.LIGHT_GREY, C.LIGHT_GREY, C.MID_GREY,_,_,_,_],
  [_,_,C.MID_GREY, C.LIGHT_GREY, C.WHITE, C.WHITE, C.WHITE, C.LIGHT_GREY, C.MID_GREY,_,_,_],
  [_,_,C.MID_GREY, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.MID_GREY,_,_,_],
  [_,_,C.MID_GREY, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.MID_GREY,_,_,_],
  [_,_,C.MID_GREY, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.MID_GREY,_,_,_],
  [_,_,C.MID_GREY, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.WHITE, C.MID_GREY,_,_,_],
  [_,_,_,C.MID_GREY, C.WHITE, C.WHITE, C.WHITE, C.MID_GREY,_,_,_,_],
  [_,_,_,_,C.MID_GREY, C.MID_GREY, C.MID_GREY,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_COW: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,C.BROWN,_,_,_,_,_,C.BROWN,_,_,_],
  [_,C.BROWN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.BROWN,_,_],
  [_,C.TAN, C.TAN, C.WHITE, C.TAN, C.TAN, C.TAN, C.WHITE, C.TAN, C.TAN,_,_],
  [_,C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN,_,_],
  [_,_,C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN, C.TAN,_,_,_],
  [_,_,C.TAN, C.TAN, C.BROWN, C.TAN, C.TAN, C.BROWN, C.TAN,_,_,_],
  [_,_,_,C.TAN, C.TAN, C.TAN, C.TAN, C.TAN,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_AXE: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,DG,LG,_,_,_],
  [_,_,_,_,_,_,DG,MG,LG,DG,_,_],
  [_,_,_,_,_,DG,MG,LG,MG,DG,_,_],
  [_,_,_,_,DG,MG,DG,_,_,_,_,_],
  [_,_,_,DG,B, LB,_,_,_,_,_,_],
  [_,_,_,DB,LB,DB,_,_,_,_,_,_],
  [_,_,DB,LB,_,_,_,_,_,_,_,_],
  [_,DB,LB,_,_,_,_,_,_,_,_,_],
  [_,DB,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

export const ICON_PICKAXE: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,DG,LG,LG,LG,LG,LG,LG,LG,DG,_,_],
  [_,DG,MG,MG,MG,MG,MG,MG,MG,DG,_,_],
  [_,_,DG,MG,DG,MG,MG,DG,_,_,_,_],
  [_,_,_,_,DB,B, LB,_,_,_,_,_],
  [_,_,_,_,DB,LB,DB,_,_,_,_,_],
  [_,_,_,_,DB,LB,DB,_,_,_,_,_],
  [_,_,_,_,DB,LB,DB,_,_,_,_,_],
  [_,_,_,_,DB,LB,DB,_,_,_,_,_],
  [_,_,_,_,DB,LB,DB,_,_,_,_,_],
  [_,_,_,_,_,DB,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Wheat icon (12x12)
export const ICON_WHEAT: number[][] = [
  [_,_,_,_,_,C.GOLD,_,_,_,_,_,_],
  [_,_,_,_,C.GOLD,C.YELLOW,C.GOLD,_,_,_,_,_],
  [_,_,_,C.GOLD,C.YELLOW,C.GOLD,C.YELLOW,C.GOLD,_,_,_,_],
  [_,_,_,C.GOLD,C.YELLOW,C.GOLD,C.YELLOW,C.GOLD,_,_,_,_],
  [_,_,_,_,C.GOLD,C.YELLOW,C.GOLD,_,_,_,_,_],
  [_,_,_,_,_,C.GOLD,_,_,_,_,_,_],
  [_,_,_,_,_,C.LIGHT_BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,C.LIGHT_BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,C.LIGHT_BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,C.BROWN,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Pumpkin icon (12x12)
export const ICON_PUMPKIN: number[][] = [
  [_,_,_,_,_,C.DARK_GREEN,_,_,_,_,_,_],
  [_,_,_,_,C.DARK_GREEN,C.PALE_GREEN,C.DARK_GREEN,_,_,_,_,_],
  [_,_,_,C.ORANGE,C.ORANGE,C.ORANGE,C.ORANGE,C.ORANGE,_,_,_,_],
  [_,_,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,_,_,_],
  [_,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,_,_],
  [_,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,_,_],
  [_,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,_,_],
  [_,_,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,C.LIGHT_BROWN,C.ORANGE,_,_,_],
  [_,_,_,C.BROWN,C.ORANGE,C.BROWN,C.ORANGE,C.BROWN,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Strawberry icon (12x12)
export const ICON_STRAWBERRY: number[][] = [
  [_,_,_,_,_,C.DARK_GREEN,C.PALE_GREEN,_,_,_,_,_],
  [_,_,_,_,C.PALE_GREEN,C.GREEN,C.PALE_GREEN,C.DARK_GREEN,_,_,_,_],
  [_,_,_,C.RED,C.RED,C.RED,C.RED,C.RED,C.RED,_,_,_],
  [_,_,C.RED,C.DARK_RED,C.RED,C.YELLOW,C.RED,C.DARK_RED,C.RED,_,_,_],
  [_,_,C.RED,C.RED,C.YELLOW,C.RED,C.RED,C.RED,C.YELLOW,_,_,_],
  [_,_,C.RED,C.YELLOW,C.RED,C.RED,C.YELLOW,C.RED,C.RED,_,_,_],
  [_,_,_,C.RED,C.RED,C.YELLOW,C.RED,C.RED,_,_,_,_],
  [_,_,_,_,C.DARK_RED,C.RED,C.DARK_RED,_,_,_,_,_],
  [_,_,_,_,_,C.DARK_RED,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Jam jar icon (12x12)
export const ICON_JAM: number[][] = [
  [_,_,_,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,C.DARK_BROWN,_,_,_,_],
  [_,_,C.DARK_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.LIGHT_BROWN,C.DARK_BROWN,_,_,_],
  [_,_,C.DARK_RED,C.RED,C.RED,C.RED,C.RED,C.RED,C.DARK_RED,_,_,_],
  [_,_,C.DARK_RED,C.RED,C.PINK,C.RED,C.RED,C.RED,C.DARK_RED,_,_,_],
  [_,_,C.DARK_RED,C.RED,C.RED,C.RED,C.PINK,C.RED,C.DARK_RED,_,_,_],
  [_,_,C.DARK_RED,C.RED,C.RED,C.RED,C.RED,C.RED,C.DARK_RED,_,_,_],
  [_,_,C.DARK_RED,C.RED,C.PINK,C.RED,C.RED,C.RED,C.DARK_RED,_,_,_],
  [_,_,C.DARK_RED,C.RED,C.RED,C.RED,C.RED,C.RED,C.DARK_RED,_,_,_],
  [_,_,_,C.DARK_RED,C.DARK_RED,C.DARK_RED,C.DARK_RED,C.DARK_RED,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Cheese icon (12x12)
export const ICON_CHEESE: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.GOLD,C.GOLD,_,_,_],
  [_,C.GOLD,C.YELLOW,C.YELLOW,C.GOLD,C.YELLOW,C.YELLOW,C.YELLOW,C.GOLD,C.GOLD,_,_],
  [_,C.GOLD,C.YELLOW,C.GOLD,C.YELLOW,C.YELLOW,C.GOLD,C.YELLOW,C.YELLOW,C.GOLD,_,_],
  [_,C.GOLD,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.YELLOW,C.GOLD,_,_,_],
  [_,C.GOLD,C.YELLOW,C.GOLD,C.YELLOW,C.YELLOW,C.GOLD,C.YELLOW,C.GOLD,_,_,_],
  [_,_,C.GOLD,C.YELLOW,C.YELLOW,C.GOLD,C.YELLOW,C.GOLD,_,_,_,_],
  [_,_,_,C.GOLD,C.GOLD,C.GOLD,C.GOLD,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Fishing rod icon (12x12)
export const ICON_FISHING_ROD: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,C.BROWN,_],
  [_,_,_,_,_,_,_,_,_,C.BROWN,C.LIGHT_BROWN,_],
  [_,_,_,_,_,_,_,_,C.BROWN,C.LIGHT_BROWN,_,_],
  [_,_,_,_,_,_,_,C.BROWN,C.LIGHT_BROWN,_,_,_],
  [_,_,_,_,_,_,C.BROWN,C.LIGHT_BROWN,_,_,_,_],
  [_,_,_,_,_,C.LIGHT_BROWN,C.PALE_BLUE,_,_,_,_],
  [_,_,_,_,C.LIGHT_BROWN,_,C.PALE_BLUE,_,_,_,_],
  [_,_,_,C.DARK_BROWN,_,_,_,C.PALE_BLUE,_,_,_,_],
  [_,_,C.DARK_BROWN,_,_,_,_,_,C.PALE_BLUE,_,_,_],
  [_,_,_,_,_,_,_,_,C.LIGHT_GREY,_,_,_],
  [_,_,_,_,_,_,_,_,_,C.LIGHT_GREY,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Fish icon (12x12)
export const ICON_FISH: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,C.PALE_BLUE,C.PALE_BLUE,_,_,_,_,_],
  [_,_,_,C.DARK_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.DARK_BLUE,_,_,_],
  [_,C.DARK_BLUE,C.BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.DARK_BLUE,_,_],
  [C.DARK_BLUE,C.BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.ALMOST_BLACK,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.BLUE,C.DARK_BLUE,_],
  [_,C.DARK_BLUE,C.BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.DARK_BLUE,_,_],
  [_,_,_,C.DARK_BLUE,C.PALE_BLUE,C.LIGHT_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,C.DARK_BLUE,_,_,_],
  [_,_,_,_,_,C.PALE_BLUE,C.PALE_BLUE,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Sprinkler icon (12x12)
export const ICON_SPRINKLER: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,C.PALE_BLUE,_,C.PALE_BLUE,_,_,_,_,_],
  [_,_,_,C.PALE_BLUE,_,C.PALE_BLUE,_,C.PALE_BLUE,_,_,_,_],
  [_,_,_,_,C.PALE_BLUE,C.LIGHT_BLUE,C.PALE_BLUE,_,_,_,_,_],
  [_,_,_,_,_,C.LIGHT_BLUE,_,_,_,_,_,_],
  [_,_,_,_,DG,C.LIGHT_BLUE,DG,_,_,_,_,_],
  [_,_,_,DG,MG,C.BLUE,MG,DG,_,_,_,_],
  [_,_,_,DG,MG,C.BLUE,MG,DG,_,_,_,_],
  [_,_,DG,MG,C.BLUE,C.LIGHT_BLUE,C.BLUE,MG,DG,_,_,_],
  [_,_,_,DG,DG,DG,DG,DG,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Fertilizer icon (12x12) — a small bag with green sprout
export const ICON_FERTILIZER: number[][] = [
  [_,_,_,_,_,C.PALE_GREEN,_,_,_,_,_,_],
  [_,_,_,_,C.GREEN,C.PALE_GREEN,C.GREEN,_,_,_,_,_],
  [_,_,_,_,_,C.DARK_GREEN,_,_,_,_,_,_],
  [_,_,_,DB,DB,DB,DB,DB,DB,_,_,_],
  [_,_,DB,B,B,B,B,B,B,DB,_,_],
  [_,_,DB,B,C.DARK_GREEN,B,B,C.DARK_GREEN,B,DB,_,_],
  [_,_,DB,B,B,B,B,B,B,DB,_,_],
  [_,_,DB,B,B,C.DARK_GREEN,B,B,B,DB,_,_],
  [_,_,DB,B,B,B,B,B,B,DB,_,_],
  [_,_,_,DB,DB,DB,DB,DB,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

// Generic item icons mapped by itemId
export const ITEM_ICONS: Record<string, number[][]> = {
  hoe:          ICON_HOE,
  watering_can: ICON_WATERING_CAN,
  turnip:       ICON_TURNIP,
  turnip_seed:  ICON_SEED,
  carrot:       ICON_CARROT,
  carrot_seed:  ICON_SEED,
  wheat_seed:   ICON_SEED,
  pumpkin_seed: ICON_SEED,
  strawberry_seed: ICON_SEED,
  egg:          ICON_EGG,
  milk:         ICON_MILK,
  butter:       ICON_BUTTER,
  bread:        ICON_BREAD,
  flour:        ICON_FLOUR,
  cow:          ICON_COW,
  chicken:      ICON_EGG,   // fallback: egg icon for chicken type
  axe:          ICON_AXE,
  pickaxe:      ICON_PICKAXE,
  scythe:       ICON_HOE,   // fallback: hoe icon shape
  wheat:        ICON_WHEAT,
  pumpkin:      ICON_PUMPKIN,
  strawberry:   ICON_STRAWBERRY,
  jam:          ICON_JAM,
  cheese:       ICON_CHEESE,
  fishing_rod:  ICON_FISHING_ROD,
  fish:         ICON_FISH,
  wood:         ICON_WOOD,
  berry:        ICON_BERRY,
  stone:        ICON_STONE,
  iron_ore:     ICON_IRON_ORE,
  gold_ore:     ICON_GOLD_ORE,
  sprinkler:    ICON_SPRINKLER,
  fertilizer:   ICON_FERTILIZER,
};
