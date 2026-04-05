import Phaser from 'phaser';
import { registerPixelTexture } from '../utils/PixelArtUtils';
import { PlayerAppearance, DEFAULT_APPEARANCE, refreshPlayerTextures, registerNPCTextures } from '../utils/PlayerTextureUtils';

// Terrain
import {
  TILE_GRASS, TILE_DIRT, TILE_WATERED_DIRT,
  TILE_STONE, TILE_WATER, TILE_WOOD_FLOOR,
} from '../sprites/TerrainSprites';

// UI
import {
  CLICK_RING, SLOT_BG, SLOT_HOVER, COIN_ICON,
  HEART, SLEEP_Z, BED, FARMHOUSE, TREE_TOP, TREE_TRUNK, FENCE_POST,
} from '../sprites/UISprites';

// Crops
import { CROP_SPRITES } from '../sprites/CropSprites';

// Items
import { ITEM_ICONS } from '../sprites/ItemSprites';

// Animals & processing stations
import {
  SPRITE_CHICKEN, SPRITE_COW,
  SPRITE_BARN, SPRITE_TROUGH,
  SPRITE_CHURN, SPRITE_MILL, SPRITE_OVEN,
} from '../sprites/AnimalSprites';

export type { PlayerAppearance };
export { DEFAULT_APPEARANCE };

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.registerAllTextures(DEFAULT_APPEARANCE);
    this.scene.start('MainMenuScene');
  }

  registerAllTextures(appearance: PlayerAppearance): void {
    // All pixel-art grids are stored 1:1 (one grid cell = 1 raw texture pixel).
    // Visual scaling is handled entirely by setScale() on the game objects.
    // Tile sprites: setScale(SCALE=3) → 16*3=48 px displayed per tile.
    // Player sprites: setScale(SCALE=3) → 16*3=48 px displayed.

    // ── Terrain tiles (16×16 each) ────────────────────────────────────────────
    registerPixelTexture(this, 'tile-grass',        TILE_GRASS,        1);
    registerPixelTexture(this, 'tile-dirt',         TILE_DIRT,         1);
    registerPixelTexture(this, 'tile-watered-dirt', TILE_WATERED_DIRT, 1);
    registerPixelTexture(this, 'tile-stone',        TILE_STONE,        1);
    registerPixelTexture(this, 'tile-water',        TILE_WATER,        1);
    registerPixelTexture(this, 'tile-wood-floor',   TILE_WOOD_FLOOR,   1);

    // ── World objects (all 16×16 or smaller) ─────────────────────────────────
    registerPixelTexture(this, 'farmhouse',   FARMHOUSE,    1);
    registerPixelTexture(this, 'tree-top',    TREE_TOP,     1);
    registerPixelTexture(this, 'tree-trunk',  TREE_TRUNK,   1);
    registerPixelTexture(this, 'fence-post',  FENCE_POST,   1);
    registerPixelTexture(this, 'bed',         BED,          1);

    // ── UI elements (displayed with explicit scale in their consumers) ─────────
    registerPixelTexture(this, 'click-ring',  CLICK_RING,   1); // 8×8 raw
    registerPixelTexture(this, 'slot-bg',     SLOT_BG,      1); // 18×18 raw
    registerPixelTexture(this, 'slot-hover',  SLOT_HOVER,   1);
    registerPixelTexture(this, 'coin-icon',   COIN_ICON,    1);
    registerPixelTexture(this, 'heart',       HEART,        1);
    registerPixelTexture(this, 'sleep-z',     SLEEP_Z,      1);

    // ── Crop stage sprites ────────────────────────────────────────────────────
    Object.entries(CROP_SPRITES).forEach(([cropType, stages]) => {
      stages.forEach((grid, stage) => {
        registerPixelTexture(this, `crop-${cropType}-${stage}`, grid, 1);
      });
    });

    // ── Item icons (12×12 raw) ────────────────────────────────────────────────
    Object.entries(ITEM_ICONS).forEach(([itemId, grid]) => {
      registerPixelTexture(this, `icon-${itemId}`, grid, 1);
    });

    // ── Animals & processing stations ─────────────────────────────────────────
    registerPixelTexture(this, 'chicken', SPRITE_CHICKEN, 1);
    registerPixelTexture(this, 'cow',     SPRITE_COW,     1);
    registerPixelTexture(this, 'barn',    SPRITE_BARN,    1);
    registerPixelTexture(this, 'trough',  SPRITE_TROUGH,  1);
    registerPixelTexture(this, 'churn',   SPRITE_CHURN,   1);
    registerPixelTexture(this, 'mill',    SPRITE_MILL,    1);
    registerPixelTexture(this, 'oven',    SPRITE_OVEN,    1);

    // ── Player character (with palette swap) ──────────────────────────────────
    refreshPlayerTextures(this, appearance);

    // ── NPC sprites ───────────────────────────────────────────────────────────
    registerNPCTextures(this);
  }
}
