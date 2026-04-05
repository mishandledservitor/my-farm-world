import Phaser from 'phaser';
import { findPath, TilePos, WalkabilityFn } from '../utils/AStarPathfinder';
import { TILE_SIZE, SCALE, PLAYER_SPEED_TILES_PER_SECOND } from '../constants/GameConfig';
import { EventBus } from '../utils/EventBus';

export type Direction = 'south' | 'north' | 'east' | 'west';

export interface MovableEntity {
  tileX: number;
  tileY: number;
  sprite: Phaser.GameObjects.Sprite;
  onArrival?: () => void;
}

export class MovementSystem {
  private path: TilePos[] = [];
  private stepProgress = 0;
  private entity: MovableEntity | null = null;
  private isWalkable: WalkabilityFn;
  private pendingCallback: (() => void) | null = null;
  private lastDirection: Direction = 'south';

  // Pixels per second the character moves (tile units * TILE_DISPLAY)
  private readonly SPEED = PLAYER_SPEED_TILES_PER_SECOND; // tiles / second

  constructor(isWalkable: WalkabilityFn) {
    this.isWalkable = isWalkable;
  }

  bind(entity: MovableEntity): void {
    this.entity = entity;
  }

  // ── Pathfinding ────────────────────────────────────────────────────────────

  moveTo(tileX: number, tileY: number, onArrival?: () => void): boolean {
    if (!this.entity) return false;

    const path = findPath(
      this.isWalkable,
      this.entity.tileX,
      this.entity.tileY,
      tileX,
      tileY,
    );

    if (path.length === 0) {
      // Already there or unreachable
      if (this.entity.tileX === tileX && this.entity.tileY === tileY) {
        onArrival?.();
        return true;
      }
      return false;
    }

    this.path = path;
    this.stepProgress = 0;
    this.pendingCallback = onArrival ?? null;
    return true;
  }

  stop(): void {
    this.path = [];
    this.stepProgress = 0;
    this.pendingCallback = null;
    if (this.entity) {
      this.entity.sprite.anims.play(`player-idle-${this.lastDirection}`, true);
    }
  }

  get isMoving(): boolean {
    return this.path.length > 0;
  }

  get direction(): Direction {
    return this.lastDirection;
  }

  // ── Update (called from GameScene.update) ─────────────────────────────────

  update(delta: number): void {
    if (!this.entity || this.path.length === 0) return;

    const next = this.path[0];
    const dx = next.x - this.entity.tileX;
    const dy = next.y - this.entity.tileY;

    // Determine facing direction
    if (Math.abs(dx) >= Math.abs(dy)) {
      this.lastDirection = dx > 0 ? 'east' : 'west';
    } else {
      this.lastDirection = dy > 0 ? 'south' : 'north';
    }

    // Play walk animation
    const animKey = `player-walk-${this.lastDirection}`;
    if (this.entity.sprite.anims.currentAnim?.key !== animKey) {
      this.entity.sprite.anims.play(animKey, true);
    }

    // Advance along the step
    this.stepProgress += (delta / 1000) * this.SPEED;

    if (this.stepProgress >= 1) {
      // Snap to next tile
      this.entity.tileX = next.x;
      this.entity.tileY = next.y;
      this.stepProgress = 0;
      this.path.shift();

      EventBus.emit('player:moved', { tileX: this.entity.tileX, tileY: this.entity.tileY });

      if (this.path.length === 0) {
        // Arrived at destination
        this.entity.sprite.anims.play(`player-idle-${this.lastDirection}`, true);
        const cb = this.pendingCallback;
        this.pendingCallback = null;
        cb?.();
      }
    } else {
      // Lerp pixel position for smooth rendering
      const prevX = this.entity.tileX;
      const prevY = this.entity.tileY;
      const tileDisplay = TILE_SIZE * SCALE;
      this.entity.sprite.x =
        (prevX + dx * this.stepProgress) * tileDisplay + tileDisplay / 2;
      this.entity.sprite.y =
        (prevY + dy * this.stepProgress) * tileDisplay + tileDisplay / 2;
    }
  }

  // Called once path step is snapped, to set pixel pos
  syncSpriteToTile(): void {
    if (!this.entity) return;
    const tileDisplay = TILE_SIZE * SCALE;
    this.entity.sprite.x = this.entity.tileX * tileDisplay + tileDisplay / 2;
    this.entity.sprite.y = this.entity.tileY * tileDisplay + tileDisplay / 2;
  }
}
