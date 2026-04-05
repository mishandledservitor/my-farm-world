import Phaser from 'phaser';
import { registerSpriteSheet, applyPaletteSwap } from './PixelArtUtils';
import { PLAYER_FRAMES } from '../sprites/CharacterSprites';
import { C, SKIN_MASK, HAIR_MASK, SHIRT_MASK } from './ColorPalette';

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
