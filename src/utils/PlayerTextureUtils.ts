import Phaser from 'phaser';
import { registerSpriteSheet, registerPixelTexture, applyPaletteSwap } from './PixelArtUtils';
import { PLAYER_FRAMES } from '../sprites/CharacterSprites';
import { C, SKIN_MASK, HAIR_MASK, SHIRT_MASK } from './ColorPalette';
import { NPC_DEFS } from '../sprites/NPCSprites';

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

const DIRS = ['south', 'north', 'east', 'west'] as const;

/**
 * (Re-)register all four directional player spritesheets with the given
 * appearance. Safe to call from any active scene — uses that scene's
 * renderer to build the RenderTextures, then persists them in the global
 * TextureManager (so they survive scene transitions).
 */
export function refreshPlayerTextures(scene: Phaser.Scene, appearance: PlayerAppearance): void {
  const swaps = new Map<number, number>([
    [SKIN_MASK,  appearance.skin],
    [HAIR_MASK,  appearance.hair],
    [SHIRT_MASK, appearance.shirt],
  ]);

  DIRS.forEach(dir => {
    const key = `player-${dir}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const frames = PLAYER_FRAMES[dir].map(frame => applyPaletteSwap(frame, swaps));
    registerSpriteSheet(scene, key, frames, 1);
  });
}

/**
 * Register static NPC sprites (south-facing idle frame, palette-swapped).
 * Called once from BootScene; results persist in the global TextureManager.
 */
export function registerNPCTextures(scene: Phaser.Scene): void {
  NPC_DEFS.forEach(({ id, appearance }) => {
    const swaps = new Map<number, number>([
      [SKIN_MASK,  appearance.skin],
      [HAIR_MASK,  appearance.hair],
      [SHIRT_MASK, appearance.shirt],
    ]);
    const frame = applyPaletteSwap(PLAYER_FRAMES.south[0], swaps);
    if (scene.textures.exists(`npc-${id}`)) scene.textures.remove(`npc-${id}`);
    registerPixelTexture(scene, `npc-${id}`, frame, 1);
  });
}
