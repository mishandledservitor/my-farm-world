import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { TimeSystem } from '../systems/TimeSystem';
import { EventBus } from '../utils/EventBus';
import { C } from '../utils/ColorPalette';
import {
  getSeasonFromDay, getDayOfSeason, seasonLabel, seasonColor,
} from '../utils/SeasonUtils';

interface UISceneData {
  timeSystem?: TimeSystem;
  hideSleepHint?: boolean;
}

export class UIScene extends Phaser.Scene {
  private timeSystem: TimeSystem | null = null;
  private hideSleepHint = false;

  private dayText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private seasonText!: Phaser.GameObjects.Text;
  private coordText!: Phaser.GameObjects.Text;
  private versionText!: Phaser.GameObjects.Text;
  private clockBg!: Phaser.GameObjects.Rectangle;
  private coinText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: UISceneData): void {
    this.timeSystem = data.timeSystem ?? null;
    this.hideSleepHint = data.hideSleepHint ?? false;
  }

  create(): void {
    this.cameras.main.setScroll(0, 0);
    this.createHUD();
    this.bindEvents();
  }

  private createHUD(): void {
    const pad = 10;

    // ── Clock panel (top-left) ────────────────────────────────────────────────
    this.clockBg = this.add.rectangle(pad + 82, pad + 28, 172, 60, 0x000000, 0.55);
    this.clockBg.setScrollFactor(0).setDepth(99);

    const baseStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      stroke: '#000000',
      strokeThickness: 3,
    };

    this.dayText = this.add.text(pad + 4, pad + 4, 'Day 1 (Spring 1)', {
      ...baseStyle, fontSize: '14px', color: '#ffffff',
    });
    this.dayText.setScrollFactor(0).setDepth(100);

    this.seasonText = this.add.text(pad + 4, pad + 24, 'Spring', {
      ...baseStyle, fontSize: '13px', color: seasonColor('spring'),
    });
    this.seasonText.setScrollFactor(0).setDepth(100);

    this.timeText = this.add.text(pad + 4, pad + 40, '6:00 AM', {
      ...baseStyle, fontSize: '13px', color: '#ffff88',
    });
    this.timeText.setScrollFactor(0).setDepth(100);

    // ── Coin display (top-right) ──────────────────────────────────────────────
    const coinBg = this.add.rectangle(CANVAS_WIDTH - 70, pad + 16, 130, 32, 0x000000, 0.55);
    coinBg.setScrollFactor(0).setDepth(99);

    this.coinText = this.add.text(CANVAS_WIDTH - 128, pad + 8, '$ 50', {
      ...baseStyle, fontSize: '16px', color: '#f7c35e',
    });
    this.coinText.setScrollFactor(0).setDepth(100);

    // ── Tile coords (bottom-left, debug) ──────────────────────────────────────
    this.coordText = this.add.text(pad, CANVAS_HEIGHT - pad - 16, 'Tile: (0, 0)', {
      ...baseStyle, fontSize: '12px', color: '#88ff88',
    });
    this.coordText.setScrollFactor(0).setDepth(100);

    // ── Version (bottom-right) ───────────────────────────────────────────────
    this.versionText = this.add.text(CANVAS_WIDTH - pad, CANVAS_HEIGHT - pad - 16, 'v1.3', {
      ...baseStyle, fontSize: '11px', color: '#666666',
    });
    this.versionText.setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // ── Sleep hint (shows after 9 PM) ─────────────────────────────────────────
    this.createSleepHint();
  }

  private sleepHint!: Phaser.GameObjects.Text;

  private createSleepHint(): void {
    this.sleepHint = this.add.text(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT - 36,
      '💤 Click the bed to sleep',
      {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '13px', color: '#aaddff',
        stroke: '#000000', strokeThickness: 3,
      },
    );
    this.sleepHint.setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.sleepHint.setAlpha(0);
  }

  private bindEvents(): void {
    EventBus.on('time:new-day', ({ day }) => {
      const season = getSeasonFromDay(day);
      const dayOS  = getDayOfSeason(day);
      this.dayText.setText(`Day ${day}  (${seasonLabel(season)} ${dayOS})`);
      this.seasonText.setText(seasonLabel(season)).setStyle({ color: seasonColor(season) });
    });

    EventBus.on('player:moved', ({ tileX, tileY }) => {
      this.coordText.setText(`Tile: (${tileX}, ${tileY})`);
    });

    EventBus.on('coins:changed', ({ coins }) => {
      this.coinText.setText(`$ ${coins}`);
    });
  }

  update(): void {
    if (!this.timeSystem) return;

    const hour    = this.timeSystem.hour;
    const timeStr = this.timeSystem.getTimeString();
    const day     = this.timeSystem.day;
    const season  = getSeasonFromDay(day);
    const dayOS   = getDayOfSeason(day);

    this.timeText.setText(timeStr);
    this.dayText.setText(`Day ${day}  (${seasonLabel(season)} ${dayOS})`);
    this.seasonText.setText(seasonLabel(season)).setStyle({ color: seasonColor(season) });

    // Clock turns red after 9 PM (hour 21)
    if (hour >= 21) {
      this.timeText.setStyle({ color: '#ff4444' });
      this.clockBg.setFillStyle(0x440000, 0.65);
      this.sleepHint.setAlpha(this.hideSleepHint ? 0 : 1);
    } else {
      this.timeText.setStyle({ color: '#ffff88' });
      this.clockBg.setFillStyle(0x000000, 0.55);
      this.sleepHint.setAlpha(0);
    }

    // Midnight warning — blink faster
    if (hour === 23) {
      const blink = Math.sin(Date.now() / 150) > 0;
      this.timeText.setAlpha(blink ? 1 : 0.3);
    } else {
      this.timeText.setAlpha(1);
    }
  }
}
