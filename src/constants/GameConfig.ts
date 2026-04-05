export const TILE_SIZE = 16;
export const SCALE = 3;
export const TILE_DISPLAY = TILE_SIZE * SCALE; // 48 pixels per tile on screen

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 720;

export const MAP_COLS = 30;
export const MAP_ROWS = 24;

export const MAP_PIXEL_WIDTH = MAP_COLS * TILE_DISPLAY;
export const MAP_PIXEL_HEIGHT = MAP_ROWS * TILE_DISPLAY;

// Time config
export const GAME_MINUTES_PER_REAL_SECOND = 1; // 1 real sec = 1 game min (slow-paced)
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 24; // midnight
export const MINUTES_PER_DAY = 24 * 60;
export const SLEEP_START_MINUTE = DAY_START_HOUR * 60; // 6:00 AM in minutes

// Player config
export const PLAYER_SPEED_TILES_PER_SECOND = 4; // tiles per second

// Z-depth / depth ordering
export const Z = {
  GROUND: 0,
  OBJECTS: 10,
  PLAYER: 20,
  EFFECTS: 30,
  UI: 100,
} as const;
