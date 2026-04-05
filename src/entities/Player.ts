import Phaser from 'phaser';
import { TILE_SIZE, SCALE } from '../constants/GameConfig';
import { PlayerAppearance, DEFAULT_APPEARANCE } from '../scenes/BootScene';

export class Player {
  tileX: number;
  tileY: number;
  sprite: Phaser.GameObjects.Sprite;
  appearance: PlayerAppearance;

  constructor(
    scene: Phaser.Scene,
    startTileX: number,
    startTileY: number,
    appearance: PlayerAppearance = DEFAULT_APPEARANCE,
  ) {
    this.tileX = startTileX;
    this.tileY = startTileY;
    this.appearance = appearance;

    const tileDisplay = TILE_SIZE * SCALE;
    const px = startTileX * tileDisplay + tileDisplay / 2;
    const py = startTileY * tileDisplay + tileDisplay / 2;

    this.sprite = scene.add.sprite(px, py, 'player-south', 0);
    this.sprite.setScale(SCALE);
    this.sprite.setDepth(20);
    this.sprite.setOrigin(0.5, 0.5);

    this.createAnimations(scene);
    this.sprite.anims.play('player-idle-south', true);
  }

  private createAnimations(scene: Phaser.Scene): void {
    const mgr = scene.anims;
    const fps = 8;

    const dirs = ['south', 'north', 'east', 'west'] as const;
    dirs.forEach(dir => {
      const key = `player-${dir}`;

      // Walk animation: 4 frames
      if (!mgr.exists(`player-walk-${dir}`)) {
        mgr.create({
          key: `player-walk-${dir}`,
          frames: mgr.generateFrameNumbers(key, { start: 0, end: 3 }),
          frameRate: fps,
          repeat: -1,
        });
      }

      // Idle animation: frame 0 only
      if (!mgr.exists(`player-idle-${dir}`)) {
        mgr.create({
          key: `player-idle-${dir}`,
          frames: mgr.generateFrameNumbers(key, { start: 0, end: 0 }),
          frameRate: fps,
          repeat: -1,
        });
      }
    });
  }

  /** Snap pixel position to match current tile coordinates */
  syncPixelPosition(): void {
    const tileDisplay = TILE_SIZE * SCALE;
    this.sprite.x = this.tileX * tileDisplay + tileDisplay / 2;
    this.sprite.y = this.tileY * tileDisplay + tileDisplay / 2;
  }
}
