import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { TimeSystem } from '../systems/TimeSystem';
import { EventBus } from '../utils/EventBus';
import { SaveManager } from '../save/SaveManager';
import { C } from '../utils/ColorPalette';
import {
  getSeasonFromDay, getDayOfSeason, seasonLabel, seasonColor,
} from '../utils/SeasonUtils';

import { WeatherType } from '../systems/WeatherSystem';

interface UISceneData {
  timeSystem?: TimeSystem;
  hideSleepHint?: boolean;
  weather?: WeatherType;
}

export class UIScene extends Phaser.Scene {
  private timeSystem: TimeSystem | null = null;
  private hideSleepHint = false;
  private currentWeather: WeatherType = 'sunny';

  private dayText!: Phaser.GameObjects.Text;
  private weatherText!: Phaser.GameObjects.Text;
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
    this.currentWeather = data.weather ?? 'sunny';
  }

  create(): void {
    this.cameras.main.setScroll(0, 0);
    this.createHUD();
    this.bindEvents();
  }

  private createHUD(): void {
    const pad = 10;

    // ── Clock panel (top-left) ────────────────────────────────────────────────
    this.clockBg = this.add.rectangle(pad + 100, pad + 34, 210, 74, 0x000000, 0.55);
    this.clockBg.setScrollFactor(0).setDepth(99);

    const baseStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      stroke: '#000000',
      strokeThickness: 3,
    };

    this.dayText = this.add.text(pad + 4, pad + 4, 'Day 1 (Spring 1)', {
      ...baseStyle, fontSize: '18px', color: '#ffffff',
    });
    this.dayText.setScrollFactor(0).setDepth(100);

    this.seasonText = this.add.text(pad + 4, pad + 28, 'Spring', {
      ...baseStyle, fontSize: '16px', color: seasonColor('spring'),
    });
    this.seasonText.setScrollFactor(0).setDepth(100);

    this.weatherText = this.add.text(pad + 140, pad + 28, this.weatherLabel(this.currentWeather), {
      ...baseStyle, fontSize: '16px', color: this.weatherColor(this.currentWeather),
    });
    this.weatherText.setScrollFactor(0).setDepth(100);

    this.timeText = this.add.text(pad + 4, pad + 50, '6:00 AM', {
      ...baseStyle, fontSize: '16px', color: '#ffff88',
    });
    this.timeText.setScrollFactor(0).setDepth(100);

    // ── Coin display (top-right) ──────────────────────────────────────────────
    const coinBg = this.add.rectangle(CANVAS_WIDTH - 80, pad + 18, 150, 38, 0x000000, 0.55);
    coinBg.setScrollFactor(0).setDepth(99);

    const initialCoins = SaveManager.load()?.coins ?? 50;
    this.coinText = this.add.text(CANVAS_WIDTH - 148, pad + 6, `$ ${initialCoins}`, {
      ...baseStyle, fontSize: '20px', color: '#f7c35e',
    });
    this.coinText.setScrollFactor(0).setDepth(100);

    // ── Tile coords (bottom-left, debug) ──────────────────────────────────────
    this.coordText = this.add.text(pad, CANVAS_HEIGHT - pad - 20, 'Tile: (0, 0)', {
      ...baseStyle, fontSize: '15px', color: '#88ff88',
    });
    this.coordText.setScrollFactor(0).setDepth(100);

    // ── Save button (bottom-right) ──────────────────────────────────────────
    const saveBtn = this.add.text(CANVAS_WIDTH - pad, CANVAS_HEIGHT - pad - 40, '[ SAVE FILE ]', {
      ...baseStyle, fontSize: '13px', color: '#37946e',
    });
    saveBtn.setOrigin(1, 0).setScrollFactor(0).setDepth(100)
      .setInteractive({ useHandCursor: true });
    saveBtn.on('pointerover', () => saveBtn.setColor('#ffffff'));
    saveBtn.on('pointerout',  () => saveBtn.setColor('#37946e'));
    saveBtn.on('pointerdown', () => {
      EventBus.emit('save:flush', {} as Record<string, never>);
      SaveManager.exportToFile();
      saveBtn.setText('SAVED!');
      this.time.delayedCall(1500, () => saveBtn.setText('[ SAVE FILE ]'));
    });

    // ── Version (bottom-right) ───────────────────────────────────────────────
    this.versionText = this.add.text(CANVAS_WIDTH - pad, CANVAS_HEIGHT - pad - 20, 'v1.6.0', {
      ...baseStyle, fontSize: '13px', color: '#666666',
    });
    this.versionText.setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // ── Sleep hint (shows after 9 PM) ─────────────────────────────────────────
    this.createSleepHint();
  }

  private sleepHint!: Phaser.GameObjects.Text;

  private createSleepHint(): void {
    this.sleepHint = this.add.text(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT - 36,
      '💤 Enter the farmhouse to sleep',
      {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '16px', color: '#aaddff',
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

    EventBus.on('weather:changed', ({ weather }) => {
      this.currentWeather = weather;
      this.weatherText.setText(this.weatherLabel(weather));
      this.weatherText.setColor(this.weatherColor(weather));
    });
  }

  private weatherLabel(w: WeatherType): string {
    switch (w) {
      case 'sunny':  return 'Sunny';
      case 'cloudy': return 'Cloudy';
      case 'rainy':  return 'Rain';
    }
  }

  private weatherColor(w: WeatherType): string {
    switch (w) {
      case 'sunny':  return '#fbf236';
      case 'cloudy': return '#9badb7';
      case 'rainy':  return '#5fcde4';
    }
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
