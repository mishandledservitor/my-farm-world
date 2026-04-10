import Phaser from 'phaser';
import { registerPixelTexture, pastelizeSprite } from '../utils/PixelArtUtils';
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

// Environment / unlockable areas
import {
  SPRITE_BERRY_BUSH, SPRITE_CAVE_ENTRANCE, SPRITE_MINE_ROCK, SPRITE_STUMP,
  SPRITE_SPRINKLER, SPRITE_COMPOST,
} from '../sprites/EnvironmentSprites';

// Pets
import { SPRITE_DOG, SPRITE_CAT } from '../sprites/PetSprites';

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

    // Helper: register with pastel post-processing (outlines + shadow + soft colors)
    const p = (key: string, grid: number[][], px = 1) =>
      registerPixelTexture(this, key, pastelizeSprite(grid), px);

    // ── Terrain tiles (16×16 each) — NO pastelize (they tile seamlessly) ──────
    registerPixelTexture(this, 'tile-grass',        TILE_GRASS,        1);
    registerPixelTexture(this, 'tile-dirt',         TILE_DIRT,         1);
    registerPixelTexture(this, 'tile-watered-dirt', TILE_WATERED_DIRT, 1);
    registerPixelTexture(this, 'tile-stone',        TILE_STONE,        1);
    registerPixelTexture(this, 'tile-water',        TILE_WATER,        1);
    registerPixelTexture(this, 'tile-wood-floor',   TILE_WOOD_FLOOR,   1);

    // ── World objects (pastelized with outlines + shadow) ─────────────────────
    p('farmhouse',   FARMHOUSE);
    p('tree-top',    TREE_TOP);
    p('tree-trunk',  TREE_TRUNK);
    p('fence-post',  FENCE_POST);
    p('bed',         BED);

    // ── UI elements — NO pastelize for slot chrome; yes for iconic elements ───
    registerPixelTexture(this, 'click-ring',  CLICK_RING,   1);
    registerPixelTexture(this, 'slot-bg',     SLOT_BG,      1);
    registerPixelTexture(this, 'slot-hover',  SLOT_HOVER,   1);
    p('coin-icon',   COIN_ICON);
    p('heart',       HEART);
    p('sleep-z',     SLEEP_Z);

    // ── Crop stage sprites (pastelized) ───────────────────────────────────────
    Object.entries(CROP_SPRITES).forEach(([cropType, stages]) => {
      stages.forEach((grid, stage) => {
        p(`crop-${cropType}-${stage}`, grid);
      });
    });

    // ── Item icons (12×12, pastelized) ────────────────────────────────────────
    Object.entries(ITEM_ICONS).forEach(([itemId, grid]) => {
      p(`icon-${itemId}`, grid);
    });

    // ── Animals & processing stations (pastelized) ────────────────────────────
    p('chicken', SPRITE_CHICKEN);
    p('cow',     SPRITE_COW);
    p('barn',    SPRITE_BARN);
    p('trough',  SPRITE_TROUGH);
    p('churn',   SPRITE_CHURN);
    p('mill',    SPRITE_MILL);
    p('oven',    SPRITE_OVEN);

    // ── Environment / unlockable areas (pastelized) ───────────────────────────
    p('berry-bush',      SPRITE_BERRY_BUSH);
    p('cave-entrance',   SPRITE_CAVE_ENTRANCE);
    p('mine-rock',       SPRITE_MINE_ROCK);
    p('stump',           SPRITE_STUMP);
    p('sprinkler',       SPRITE_SPRINKLER);
    p('compost',         SPRITE_COMPOST);

    // ── Pets (pastelized) ─────────────────────────────────────────────────────
    p('pet-dog', SPRITE_DOG);
    p('pet-cat', SPRITE_CAT);

    // ── Player character (with palette swap) ──────────────────────────────────
    refreshPlayerTextures(this, appearance);

    // ── NPC sprites ───────────────────────────────────────────────────────────
    registerNPCTextures(this);
  }
}
