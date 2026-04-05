import { C } from '../utils/ColorPalette';

const _ = C.TRANSPARENT;

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
};
