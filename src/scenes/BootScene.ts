import Phaser from 'phaser';
import { registerPixelTexture, registerSpriteSheet, applyPaletteSwap } from '../utils/PixelArtUtils';
import { C, SKIN_MASK, HAIR_MASK, SHIRT_MASK } from '../utils/ColorPalette';

// Terrain
import {
  TILE_GRASS, TILE_DIRT, TILE_WATERED_DIRT,
  TILE_STONE, TILE_WATER, TILE_WOOD_FLOOR,
} from '../sprites/TerrainSprites';

// Character
import { PLAYER_FRAMES } from '../sprites/CharacterSprites';

// UI
import {
  CLICK_RING, SLOT_BG, SLOT_HOVER, COIN_ICON,
  HEART, SLEEP_Z, BED, FARMHOUSE, TREE_TOP, TREE_TRUNK, FENCE_POST,
} from '../sprites/UISprites';

export interface PlayerAppearance {
  skin: number;
  hair: number;
  shirt: number;
}

export const DEFAULT_APPEARANCE: PlayerAppearance = {
  skin:  C.SKIN_FAIR,
  hair:  C.HAIR_BROWN,
  shirt: C.SHIRT_BLUE,
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.registerAllTextures(DEFAULT_APPEARANCE);
    this.scene.start('GameScene');
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

    // ── Player character (with palette swap) ──────────────────────────────────
    this.registerPlayerTextures(appearance);
  }

  registerPlayerTextures(appearance: PlayerAppearance): void {
    const swaps = new Map<number, number>([
      [SKIN_MASK,  appearance.skin],
      [HAIR_MASK,  appearance.hair],
      [SHIRT_MASK, appearance.shirt],
    ]);

    // Destroy old player textures if they exist (for re-customization)
    ['player-south', 'player-north', 'player-east', 'player-west'].forEach(key => {
      if (this.textures.exists(key)) this.textures.remove(key);
    });

    // pixelSize=1: 16×16 raw per frame; setScale(SCALE) on the sprite handles display scaling
    const dirs = ['south', 'north', 'east', 'west'] as const;
    dirs.forEach(dir => {
      const frames = PLAYER_FRAMES[dir].map(frame => applyPaletteSwap(frame, swaps));
      registerSpriteSheet(this, `player-${dir}`, frames, 1);
    });
  }
}
