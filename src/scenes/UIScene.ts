import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { TimeSystem } from '../systems/TimeSystem';
import { EventBus } from '../utils/EventBus';

interface UISceneData {
  timeSystem?: TimeSystem;
}

export class UIScene extends Phaser.Scene {
  private timeSystem: TimeSystem | null = null;

  // Text objects
  private dayText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private coordText!: Phaser.GameObjects.Text;
  private versionText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: UISceneData): void {
    this.timeSystem = data.timeSystem ?? null;
  }

  create(): void {
    // Ensure this scene's camera is always fixed (no scrolling)
    this.cameras.main.setScroll(0, 0);

    this.createHUD();
    this.bindEvents();
  }

  private createHUD(): void {
    const pad = 12;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    };

    // Day counter (top-left)
    this.dayText = this.add.text(pad, pad, 'Day 1', {
      ...textStyle,
      fontSize: '16px',
    });
    this.dayText.setDepth(100);
    this.dayText.setScrollFactor(0);

    // Clock (top-left, below day)
    this.timeText = this.add.text(pad, pad + 24, '6:00 AM', textStyle);
    this.timeText.setDepth(100);
    this.timeText.setScrollFactor(0);

    // Coordinate debug display (bottom-left)
    this.coordText = this.add.text(pad, CANVAS_HEIGHT - pad - 16, 'Tile: (0, 0)', {
      ...textStyle,
      fontSize: '12px',
      color: '#aaffaa',
    });
    this.coordText.setDepth(100);
    this.coordText.setScrollFactor(0);

    // Version (bottom-right)
    this.versionText = this.add.text(
      CANVAS_WIDTH - pad,
      CANVAS_HEIGHT - pad - 16,
      'v0.1',
      {
        ...textStyle,
        fontSize: '11px',
        color: '#888888',
      },
    );
    this.versionText.setOrigin(1, 0);
    this.versionText.setDepth(100);
    this.versionText.setScrollFactor(0);
  }

  private bindEvents(): void {
    EventBus.on('time:new-day', ({ day }) => {
      this.dayText.setText(`Day ${day}`);
    });

    EventBus.on('player:moved', ({ tileX, tileY }) => {
      this.coordText.setText(`Tile: (${tileX}, ${tileY})`);
    });
  }

  update(): void {
    if (this.timeSystem) {
      this.timeText.setText(this.timeSystem.getTimeString());

      // Update day display
      this.dayText.setText(`Day ${this.timeSystem.day}`);
    }
  }
}
