import Phaser from 'phaser';
import { TILE_SIZE, SCALE } from '../constants/GameConfig';
import { MovementSystem } from './MovementSystem';

export type TileClickCallback = (tileX: number, tileY: number) => void;

export class InteractionSystem {
  private scene: Phaser.Scene;
  private movement: MovementSystem;
  private onTileClick: TileClickCallback | null;

  /** When set and returns true, all pointer-down events are ignored. */
  isBlocked: (() => boolean) | null = null;

  constructor(
    scene: Phaser.Scene,
    movement: MovementSystem,
    onTileClick: TileClickCallback | null = null,
  ) {
    this.scene = scene;
    this.movement = movement;
    this.onTileClick = onTileClick;
    this.bindInput();
  }

  private bindInput(): void {
    this.scene.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer) => {
        if (pointer.button !== 0) return;
        if (this.isBlocked?.()) return;

        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        const tileDisplay = TILE_SIZE * SCALE;
        const tileX = Math.floor(worldX / tileDisplay);
        const tileY = Math.floor(worldY / tileDisplay);

        this.handleClick(tileX, tileY, worldX, worldY);
      },
      this,
    );
  }

  handleClick(tileX: number, tileY: number, worldX: number, worldY: number): void {
    this.showClickIndicator(worldX, worldY);

    if (this.onTileClick) {
      // Walk to adjacent tile, then execute the tile action on arrival
      this.movement.moveTo(tileX, tileY, () => {
        this.onTileClick!(tileX, tileY);
      });
    } else {
      this.movement.moveTo(tileX, tileY);
    }
  }

  private showClickIndicator(worldX: number, worldY: number): void {
    if (!this.scene.textures.exists('click-ring')) return;

    const ring = this.scene.add.image(worldX, worldY, 'click-ring');
    ring.setDepth(30).setAlpha(1).setScale(6);

    this.scene.tweens.add({
      targets: ring,
      alpha: 0, scaleX: 10, scaleY: 10,
      duration: 350, ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
  }
}
