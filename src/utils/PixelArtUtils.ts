import Phaser from 'phaser';
import { C } from './ColorPalette';

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
