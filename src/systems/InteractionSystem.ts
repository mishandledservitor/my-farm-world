import Phaser from 'phaser';
import { TILE_SIZE, SCALE } from '../constants/GameConfig';
import { MovementSystem } from './MovementSystem';

export class InteractionSystem {
  private scene: Phaser.Scene;
  private movement: MovementSystem;

  constructor(scene: Phaser.Scene, movement: MovementSystem) {
    this.scene = scene;
    this.movement = movement;
    this.bindInput();
  }

  private bindInput(): void {
    this.scene.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer) => {
        // Only respond to left-click (button 0)
        if (pointer.button !== 0) return;

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
    this.movement.moveTo(tileX, tileY);
  }

  private showClickIndicator(worldX: number, worldY: number): void {
    if (!this.scene.textures.exists('click-ring')) return;

    // 8×8 raw texture × scale 6 = 48×48 = 1 tile at game scale
    const ring = this.scene.add.image(worldX, worldY, 'click-ring');
    ring.setDepth(30);
    ring.setAlpha(1);
    ring.setScale(6);

    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 10,
      scaleY: 10,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
  }
}
