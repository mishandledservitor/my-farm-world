import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { SaveManager } from '../save/SaveManager';
import { SaveFile } from '../save/SaveSchema';
import { EventBus } from '../utils/EventBus';
import {
  isLastDayOfSeason, getSeasonFromDay, seasonLabel, seasonColor,
} from '../utils/SeasonUtils';

interface SleepData {
  buildSave: () => SaveFile;
  nextDay: number;
}

export class SleepTransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SleepTransitionScene' });
  }

  create(data: SleepData): void {
    const overlay = this.add.rectangle(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
      CANVAS_WIDTH, CANVAS_HEIGHT,
      0x000000,
    );
    overlay.setDepth(200);
    overlay.setAlpha(0);

    // Fade to black
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 800,
      ease: 'Linear',
      onComplete: () => {
        // Autosave
        const saveData = data.buildSave();
        SaveManager.save(saveData);

        // Show "Day N" title
        this.showDayCard(data.nextDay, overlay);
      },
    });
  }

  private showDayCard(day: number, overlay: Phaser.GameObjects.Rectangle): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    };

    const subStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '20px',
      color: '#aaaaaa',
    };

    // The night that just passed was day-1; check if it was the last day of a season
    const prevDay     = day - 1;
    const seasonEnded = isLastDayOfSeason(prevDay);
    const newSeason   = getSeasonFromDay(day);

    const titleStr = seasonEnded
      ? `${seasonLabel(getSeasonFromDay(prevDay))} Complete!`
      : `Day ${day}`;

    const subStr = seasonEnded
      ? `${seasonLabel(newSeason)} has begun!`
      : 'A new day begins...';

    const titleColor = seasonEnded ? seasonColor(newSeason) : '#ffffff';

    const dayText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30, titleStr, {
      ...textStyle, color: titleColor,
    });
    dayText.setOrigin(0.5, 0.5);
    dayText.setDepth(201);
    dayText.setAlpha(0);

    const subText = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, subStr, subStyle);
    subText.setOrigin(0.5, 0.5);
    subText.setDepth(201);
    subText.setAlpha(0);

    // Fade in title
    this.tweens.add({
      targets: [dayText, subText],
      alpha: 1,
      duration: 600,
      ease: 'Linear',
      delay: 200,
      onComplete: () => {
        // Hold for 1.5s then fade out and launch game
        this.time.delayedCall(1500, () => {
          this.tweens.add({
            targets: [overlay, dayText, subText],
            alpha: 0,
            duration: 800,
            ease: 'Linear',
            onComplete: () => {
              EventBus.emit('sleep:end', { day });
              this.scene.stop('SleepTransitionScene');
            },
          });
        });
      },
    });
  }
}
