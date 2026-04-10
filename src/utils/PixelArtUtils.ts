import Phaser from 'phaser';
import { C } from './ColorPalette';

// ── Pastel color mapping ─────────────────────────────────────────────────────
// Maps saturated DB32 palette colors → softer pastel equivalents.
// Colors not in this map are kept as-is (e.g. TRANSPARENT, BLACK, ALMOST_BLACK).
const PASTEL_MAP = new Map<number, number>([
  [C.RED,           0xe8899a],  // soft rose
  [C.DARK_RED,      0xc06070],  // muted crimson
  [C.PINK,          0xe0a8cc],  // soft pink
  [C.DARK_PINK,     0xb0b070],  // muted olive-green (was olive-ish)
  [C.ORANGE,        0xe0c090],  // soft peach
  [C.LIGHT_BROWN,   0xd8a878],  // muted sandy
  [C.BROWN,         0xa07858],  // muted cocoa
  [C.DARK_BROWN,    0x704838],  // muted umber
  [C.TAN,           0xf0d8b8],  // pale cream
  [C.YELLOW,        0xf0e888],  // soft lemon
  [C.GOLD,          0xe8cf88],  // muted gold
  [C.PALE_GREEN,    0xb8e888],  // soft mint
  [C.GREEN,         0x88c858],  // muted sage
  [C.DARK_GREEN,    0x589868],  // muted forest
  [C.FOREST_GREEN,  0x6a8848],  // olive sage
  [C.DEEP_GREEN,    0x686040],  // dull moss
  [C.BLUE,          0x8898d8],  // periwinkle
  [C.LIGHT_BLUE,    0x90b8f0],  // soft sky
  [C.PALE_BLUE,     0x90d8e8],  // soft cyan
  [C.DARK_BLUE,     0x587898],  // muted steel
  [C.PALE_CYAN,     0xd0e0f0],  // ice white
  [C.WHITE,         0xf0f0f0],  // off-white
  [C.LIGHT_GREY,    0xb8c0c8],  // pale silver
  [C.MID_GREY,      0x98949a],  // muted grey
  [C.DARK_GREY,     0x787878],  // soft charcoal
  [C.DARKER_GREY,   0x686460],  // warm grey
  [C.OLIVE,         0x9a8848],  // muted olive
  [C.DARK_PURPLE,   0x604858],  // muted plum
  [C.DARK_TEAL,     0x485850],  // muted teal
  [C.DARK_SLATE,    0x585878],  // muted slate
  // Skin tones → slightly softened
  [C.SKIN_LIGHT,    0xf8e8d8],
  [C.SKIN_FAIR,     0xf0d8b8],
  [C.SKIN_MEDIUM,   0xd0a070],
  [C.SKIN_TAN,      0xa07850],
  [C.SKIN_DARK,     0x604030],
  // Hair colors → softened
  [C.HAIR_BLONDE,   0xe8cf88],
  [C.HAIR_AUBURN,   0xd8a0c0],
  [C.HAIR_BROWN,    0xa07858],
  [C.HAIR_DARK,     0x503828],
  [C.HAIR_BLACK,    0x383040],
  [C.HAIR_RED,      0xc06070],
  [C.HAIR_GREY,     0xb8c0c8],
  [C.HAIR_WHITE,    0xf0f0f0],
  // Shirt colors → softened
  [C.SHIRT_RED,     0xe8899a],
  [C.SHIRT_BLUE,    0x8898d8],
  [C.SHIRT_GREEN,   0x88c858],
  [C.SHIRT_YELLOW,  0xf0e888],
  [C.SHIRT_PURPLE,  0x604858],
  [C.SHIRT_ORANGE,  0xd8a878],
  [C.SHIRT_TEAL,    0x589868],
  [C.SHIRT_WHITE,   0xf0f0f0],
]);

const BK = C.ALMOST_BLACK;  // outline color
const SHADOW_COLOR = 0x383040;  // subtle dark shadow

/**
 * Post-process a sprite grid: convert to pastel colors, add black outlines,
 * and add a small drop-shadow (1px down-right).
 *
 * Processing order:
 *  1. Map each filled pixel to its pastel equivalent
 *  2. Drop shadow: for each filled pixel, if (row+1, col+1) is transparent → shadow
 *  3. Black outline: for each transparent pixel adjacent to a filled pixel → black
 *
 * Works on any grid size (16×16, 12×12, 8×8, etc.).
 * Returns a new grid — does not mutate the input.
 */
export function pastelizeSprite(grid: number[][]): number[][] {
  if (grid.length === 0) return grid;
  const rows = grid.length;
  const cols = grid[0].length;

  // Step 1: Pastel-ify colors
  const pastel: number[][] = grid.map(row =>
    row.map(c => {
      if (c === C.TRANSPARENT) return C.TRANSPARENT;
      return PASTEL_MAP.get(c) ?? c;
    }),
  );

  // Build a mask of filled pixels (after pastel pass)
  const filled = (r: number, c: number) =>
    r >= 0 && r < rows && c >= 0 && c < cols && pastel[r][c] !== C.TRANSPARENT;

  // Step 2: Drop shadow (1px down, 1px right)
  // We collect shadow positions first so we don't interfere with the outline pass
  const result: number[][] = pastel.map(row => [...row]);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pastel[r][c] === C.TRANSPARENT) continue;
      const sr = r + 1;
      const sc = c + 1;
      if (sr < rows && sc < cols && result[sr][sc] === C.TRANSPARENT) {
        result[sr][sc] = SHADOW_COLOR;
      }
    }
  }

  // Step 3: Black outline — any transparent pixel next to a filled pixel
  // (check original pastel grid for filled, write to result)
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (result[r][c] !== C.TRANSPARENT) continue;
      for (const [dr, dc] of dirs) {
        if (filled(r + dr, c + dc)) {
          result[r][c] = BK;
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Renders a pixel-art grid (2D number array) into a Phaser RenderTexture,
 * saves the result as a named texture, and cleans up temporary objects.
 *
 * @param scene    The scene to use for creating objects
 * @param key      Texture key to register with Phaser's texture manager
 * @param grid     2D array of hex color values; use C.TRANSPARENT (-1) to skip a pixel
 * @param pixelSize Size in pixels of each "pixel" in the grid (default 1, use SCALE from outside if needed)
 */
export function registerPixelTexture(
  scene: Phaser.Scene,
  key: string,
  grid: number[][],
  pixelSize = 1,
): void {
  if (grid.length === 0 || grid[0].length === 0) return;

  const rows = grid.length;
  const cols = grid[0].length;
  const w = cols * pixelSize;
  const h = rows * pixelSize;

  const gfx = scene.add.graphics();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = grid[row][col];
      if (color === C.TRANSPARENT) continue;
      gfx.fillStyle(color, 1);
      gfx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
    }
  }

  // Snapshot the graphics into a RenderTexture, then save as named texture
  const rt = scene.add.renderTexture(0, 0, w, h);
  rt.draw(gfx, 0, 0);
  rt.saveTexture(key);

  // Clean up — the saved texture persists in Phaser's TextureManager
  rt.destroy();
  gfx.destroy();
}

/**
 * Register a sprite sheet (single row of frames) as a Phaser texture + frame data.
 * Each frame is frameW × frameH pixels in the source grid.
 */
export function registerSpriteSheet(
  scene: Phaser.Scene,
  key: string,
  frames: number[][][],
  pixelSize = 1,
): void {
  if (frames.length === 0) return;

  const frameH = frames[0].length;
  const frameW = frames[0][0].length;
  const totalW = frames.length * frameW * pixelSize;
  const totalH = frameH * pixelSize;

  const gfx = scene.add.graphics();

  frames.forEach((frame, fi) => {
    const offsetX = fi * frameW * pixelSize;
    for (let row = 0; row < frameH; row++) {
      for (let col = 0; col < frameW; col++) {
        const color = frame[row][col];
        if (color === C.TRANSPARENT) continue;
        gfx.fillStyle(color, 1);
        gfx.fillRect(offsetX + col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      }
    }
  });

  const rt = scene.add.renderTexture(0, 0, totalW, totalH);
  rt.draw(gfx, 0, 0);
  rt.saveTexture(key);
  rt.destroy();
  gfx.destroy();

  // Register frame data so Phaser animations can use named frames
  const tex = scene.textures.get(key);
  frames.forEach((_, fi) => {
    tex.add(
      fi,
      0,
      fi * frameW * pixelSize,
      0,
      frameW * pixelSize,
      frameH * pixelSize,
    );
  });
}

/**
 * Add pointer-over / pointer-out brightness tint to an interactive game object.
 * The object must already have setInteractive() called (or useHandCursor enabled).
 */
export function addHoverHighlight(
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
): void {
  if (!obj.input) obj.setInteractive({ useHandCursor: true });
  obj.on('pointerover', () => obj.setTint(0xddddff));
  obj.on('pointerout',  () => obj.clearTint());
}

/**
 * Apply palette swaps to a pixel grid.
 * Replaces all occurrences of each key color with the corresponding value color.
 */
export function applyPaletteSwap(
  grid: number[][],
  swaps: Map<number, number>,
): number[][] {
  return grid.map(row =>
    row.map(color => swaps.get(color) ?? color),
  );
}
