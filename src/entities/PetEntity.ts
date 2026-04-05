import Phaser from 'phaser';
import { TILE_SIZE, SCALE } from '../constants/GameConfig';

const MOVE_INTERVAL = 600;   // ms between pet steps
const TELEPORT_DIST = 5;     // tiles — snap to player if farther than this

export class PetEntity {
  id: string;
  petType: string;
  name: string;
  happiness: number;

  tileX: number;
  tileY: number;
  sprite: Phaser.GameObjects.Image;

  private moveTimer = 0;
  private scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    id: string,
    petType: string,
    name: string,
    happiness: number,
    startTileX: number,
    startTileY: number,
  ) {
    this.scene    = scene;
    this.id       = id;
    this.petType  = petType;
    this.name     = name;
    this.happiness = happiness;
    this.tileX    = startTileX;
    this.tileY    = startTileY;

    const td = TILE_SIZE * SCALE;
    const textureKey = petType === 'cat' ? 'pet-cat' : 'pet-dog';

    this.sprite = scene.add.image(
      startTileX * td + td / 2,
      startTileY * td + td / 2,
      textureKey,
    ).setScale(SCALE).setDepth(19).setInteractive({ useHandCursor: true });

    this.sprite.on('pointerdown', () => this.onPetClick());
  }

  // ── Follow player ─────────────────────────────────────────────────────────

  update(
    delta: number,
    playerTileX: number,
    playerTileY: number,
    isWalkable: (x: number, y: number) => boolean,
  ): void {
    this.moveTimer += delta;
    if (this.moveTimer < MOVE_INTERVAL) return;
    this.moveTimer = 0;

    const dx = playerTileX - this.tileX;
    const dy = playerTileY - this.tileY;
    const dist = Math.abs(dx) + Math.abs(dy);

    // Already adjacent — no move needed
    if (dist <= 1) return;

    // Teleport if too far away (player just scene-transitioned or is far off)
    if (dist > TELEPORT_DIST) {
      // Place next to player in a free tile
      const candidates: Array<[number, number]> = [
        [playerTileX - 1, playerTileY],
        [playerTileX + 1, playerTileY],
        [playerTileX, playerTileY - 1],
        [playerTileX, playerTileY + 1],
      ];
      for (const [cx, cy] of candidates) {
        if (isWalkable(cx, cy)) {
          this.tileX = cx;
          this.tileY = cy;
          this.syncPixelPosition();
          return;
        }
      }
      return;
    }

    // Simple directional step: prefer the larger axis gap, fallback to other
    const stepCandidates: Array<[number, number]> = [];

    if (Math.abs(dx) >= Math.abs(dy)) {
      stepCandidates.push([this.tileX + Math.sign(dx), this.tileY]);
      stepCandidates.push([this.tileX, this.tileY + Math.sign(dy)]);
    } else {
      stepCandidates.push([this.tileX, this.tileY + Math.sign(dy)]);
      stepCandidates.push([this.tileX + Math.sign(dx), this.tileY]);
    }

    for (const [nx, ny] of stepCandidates) {
      // Don't step onto the player's tile
      if (nx === playerTileX && ny === playerTileY) continue;
      if (isWalkable(nx, ny)) {
        this.tileX = nx;
        this.tileY = ny;
        this.syncPixelPosition();
        return;
      }
    }
  }

  // ── Click interaction ─────────────────────────────────────────────────────

  private onPetClick(): void {
    this.happiness = Math.min(100, this.happiness + 5);

    const td = TILE_SIZE * SCALE;
    const hearts = ['♥', '♥', '♥'];
    hearts.forEach((h, i) => {
      const offsetX = (i - 1) * 14;
      const t = this.scene.add.text(
        this.sprite.x + offsetX,
        this.sprite.y - td / 2,
        h,
        { fontFamily: '"Courier New"', fontSize: '16px', color: '#ff6b8a', stroke: '#000', strokeThickness: 2 },
      ).setOrigin(0.5, 1).setDepth(60);

      this.scene.tweens.add({
        targets: t,
        y: t.y - 28 - i * 6,
        alpha: 0,
        duration: 900 + i * 100,
        ease: 'Quad.easeOut',
        onComplete: () => t.destroy(),
      });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  syncPixelPosition(): void {
    const td = TILE_SIZE * SCALE;
    this.sprite.x = this.tileX * td + td / 2;
    this.sprite.y = this.tileY * td + td / 2;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
