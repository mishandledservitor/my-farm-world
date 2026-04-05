import { C } from '../utils/ColorPalette';

const _ = C.TRANSPARENT;

function g(fn: (r: number, c: number) => number): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < 16; r++) {
    const row: number[] = [];
    for (let c = 0; c < 16; c++) row.push(fn(r, c));
    out.push(row);
  }
  return out;
}

// ── Turnip (3 stages) ────────────────────────────────────────────────────────

export const TURNIP_STAGE: number[][][] = [
  g((r, c) => {
    if (r === 13 && c === 8) return C.PALE_GREEN;
    if (r === 12 && c === 8) return C.GREEN;
    if (r === 14 && (c === 7 || c === 9)) return C.DARK_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 10 && r <= 13 && c === 7) return C.GREEN;
    if (r >= 9 && r <= 12 && c === 9) return C.PALE_GREEN;
    if (r === 13 && c >= 6 && c <= 10) return C.GREEN;
    if (r === 14 && c >= 5 && c <= 7) return C.DARK_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 7 && r <= 11 && c >= 6 && c <= 10) {
      return (r + c) % 2 === 0 ? C.GREEN : C.PALE_GREEN;
    }
    if (r >= 12 && r <= 14 && c >= 6 && c <= 10) return C.DARK_PINK;
    if (r === 13 && c >= 7 && c <= 9) return C.PINK;
    if (r === 15 && c >= 6 && c <= 10) return C.DARK_BROWN;
    return _;
  }),
];

// ── Carrot (4 stages) ────────────────────────────────────────────────────────

export const CARROT_STAGE: number[][][] = [
  g((r, c) => {
    if (r === 13 && c >= 7 && c <= 9) return C.PALE_GREEN;
    if (r === 12 && c === 8) return C.GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 10 && r <= 13 && c === 8) return C.GREEN;
    if (r === 10 && (c === 6 || c === 10)) return C.PALE_GREEN;
    if (r === 11 && (c === 7 || c === 9)) return C.PALE_GREEN;
    if (r === 13 && c >= 6 && c <= 10) return C.GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 6 && r <= 11 && c >= 6 && c <= 10 && (r + c) % 2 === 0) return C.PALE_GREEN;
    if (r >= 6 && r <= 11 && c >= 7 && c <= 9 && (r + c) % 2 !== 0) return C.GREEN;
    if (r >= 11 && r <= 14 && c >= 7 && c <= 9) return C.ORANGE;
    if (r === 12 && c === 8) return C.LIGHT_BROWN;
    return _;
  }),
  g((r, c) => {
    if (r >= 4 && r <= 9 && c >= 5 && c <= 11) {
      if ((r + c) % 2 === 0) return C.PALE_GREEN;
      if ((r + c) % 3 === 0) return C.GREEN;
      return _;
    }
    if (r >= 9 && r <= 13 && c >= 7 && c <= 9) return C.ORANGE;
    if (r >= 10 && r <= 12 && c === 8) return C.LIGHT_BROWN;
    if (r === 14 && c === 8) return C.LIGHT_BROWN;
    return _;
  }),
];

// ── Wheat (4 stages) ─────────────────────────────────────────────────────────

export const WHEAT_STAGE: number[][][] = [
  g((r, c) => {
    if (r >= 12 && r <= 14 && (c === 7 || c === 9)) return C.GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 8 && r <= 14 && (c === 6 || c === 8 || c === 10)) return C.GREEN;
    if (r >= 10 && r <= 14 && (c === 7 || c === 9)) return C.PALE_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 5 && r <= 13 && (c === 6 || c === 8 || c === 10)) return C.GREEN;
    if (r >= 3 && r <= 5 && (c === 6 || c === 8 || c === 10)) return C.PALE_GREEN;
    if (r <= 3 && (c === 6 || c === 8 || c === 10)) return C.YELLOW;
    return _;
  }),
  g((r, c) => {
    if (r >= 7 && r <= 13 && (c === 5 || c === 7 || c === 9 || c === 11)) return C.DARK_GREEN;
    if (r >= 4 && r <= 7 && (c === 5 || c === 7 || c === 9 || c === 11)) return C.YELLOW;
    if (r >= 2 && r <= 4 && c >= 4 && c <= 12 && c % 2 === 0) return C.GOLD;
    if (r >= 1 && r <= 3 && c >= 4 && c <= 12 && c % 2 === 0) return C.YELLOW;
    return _;
  }),
];

// ── Pumpkin (4 stages) ───────────────────────────────────────────────────────

export const PUMPKIN_STAGE: number[][][] = [
  g((r, c) => {
    if (r === 13 && c >= 7 && c <= 9) return C.PALE_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r === 13 && c >= 5 && c <= 11) return C.GREEN;
    if (c === 8 && r >= 11) return C.DARK_GREEN;
    if ((r === 11 || r === 12) && (c === 6 || c === 10)) return C.PALE_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 8 && r <= 12 && c >= 4 && c <= 12 && (r + c) % 3 === 0) return C.GREEN;
    if (r >= 10 && r <= 13 && c >= 6 && c <= 10) return C.ORANGE;
    if (r === 11 && c >= 7 && c <= 9) return C.LIGHT_BROWN;
    if (r === 8 && c >= 4 && c <= 12) return C.DARK_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 4 && r <= 6 && c === 8) return C.DARK_GREEN;
    if (r === 4 && c >= 7 && c <= 9) return C.GREEN;
    const cx = 8, cy = 10;
    const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
    if (dist <= 5.5) {
      if (c === 5 || c === 8 || c === 11) return C.DARK_RED;
      if (r <= 8) return C.LIGHT_BROWN;
      return C.ORANGE;
    }
    return _;
  }),
];

// ── Strawberry (3 stages) ────────────────────────────────────────────────────

export const STRAWBERRY_STAGE: number[][][] = [
  g((r, c) => {
    if (r >= 12 && r <= 14 && c >= 6 && c <= 10 && (r + c) % 2 === 0) return C.PALE_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 8 && r <= 13 && c >= 5 && c <= 11 && (r + c) % 2 === 0) return C.GREEN;
    if (r >= 9 && r <= 12 && c >= 6 && c <= 10 && (r + c) % 2 !== 0) return C.PALE_GREEN;
    if (r === 14 && c >= 5 && c <= 11) return C.DARK_GREEN;
    return _;
  }),
  g((r, c) => {
    if (r >= 7 && r <= 11 && c >= 4 && c <= 12 && (r + c) % 2 === 0) return C.PALE_GREEN;
    if (r >= 11 && r <= 14 && (c === 6 || c === 10)) return C.RED;
    if (r === 12 && c === 8) return C.RED;
    if (r === 13 && (c === 7 || c === 9)) return C.DARK_RED;
    if (r === 12 && (c === 6 || c === 10)) return C.WHITE;
    return _;
  }),
];

export const CROP_SPRITES: Record<string, number[][][]> = {
  turnip:     TURNIP_STAGE,
  carrot:     CARROT_STAGE,
  wheat:      WHEAT_STAGE,
  pumpkin:    PUMPKIN_STAGE,
  strawberry: STRAWBERRY_STAGE,
};
