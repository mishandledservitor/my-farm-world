// DB32 palette — 32 classic 8-bit colors
// Hex values as numbers (0xRRGGBB) for use with Phaser Graphics.fillStyle()

export const C = {
  TRANSPARENT:    -1,
  BLACK:          0x000000,
  ALMOST_BLACK:   0x222034,
  DARK_PURPLE:    0x45283c,
  DARK_BROWN:     0x663931,
  BROWN:          0x8f563b,
  LIGHT_BROWN:    0xdf7126,
  ORANGE:         0xd9a066,
  TAN:            0xeec39a,
  YELLOW:         0xfbf236,
  PALE_GREEN:     0x99e550,
  GREEN:          0x6abe30,
  DARK_GREEN:     0x37946e,
  FOREST_GREEN:   0x4b692f,
  DEEP_GREEN:     0x524b24,
  DARK_TEAL:      0x323c39,
  DARK_SLATE:     0x3f3f74,
  DARK_BLUE:      0x306082,
  BLUE:           0x5b6ee1,
  LIGHT_BLUE:     0x639bff,
  PALE_BLUE:      0x5fcde4,
  PALE_CYAN:      0xcbdbfc,
  WHITE:          0xffffff,
  LIGHT_GREY:     0x9badb7,
  MID_GREY:       0x847e87,
  DARK_GREY:      0x696a6a,
  DARKER_GREY:    0x595652,
  RED:            0xd95763,
  DARK_RED:       0xac3232,
  PINK:           0xd77bba,
  DARK_PINK:      0x8f974a,
  OLIVE:          0x8a6f30,
  GOLD:           0xf7c35e,

  // Skin tones for character customization
  SKIN_LIGHT:     0xfde0c8,
  SKIN_FAIR:      0xeec39a,
  SKIN_MEDIUM:    0xc68642,
  SKIN_TAN:       0x8d5524,
  SKIN_DARK:      0x4a2912,

  // Hair colors
  HAIR_BLONDE:    0xf7c35e,
  HAIR_AUBURN:    0xd77bba,
  HAIR_BROWN:     0x8f563b,
  HAIR_DARK:      0x3d2314,
  HAIR_BLACK:     0x222034,
  HAIR_RED:       0xac3232,
  HAIR_GREY:      0x9badb7,
  HAIR_WHITE:     0xffffff,

  // Shirt colors
  SHIRT_RED:      0xd95763,
  SHIRT_BLUE:     0x5b6ee1,
  SHIRT_GREEN:    0x6abe30,
  SHIRT_YELLOW:   0xfbf236,
  SHIRT_PURPLE:   0x45283c,
  SHIRT_ORANGE:   0xdf7126,
  SHIRT_TEAL:     0x37946e,
  SHIRT_WHITE:    0xffffff,
} as const;

export type Color = typeof C[keyof typeof C];

// Mask colors used as placeholder in sprite definitions for customizable parts
export const SKIN_MASK   = 0xFF00FF;  // magenta → replaced with chosen skin
export const HAIR_MASK   = 0x00FFFF;  // cyan    → replaced with chosen hair
export const SHIRT_MASK  = 0xFF8000;  // orange  → replaced with chosen shirt
export const HAT_MASK    = 0x8000FF;  // violet  → replaced with chosen hat color
