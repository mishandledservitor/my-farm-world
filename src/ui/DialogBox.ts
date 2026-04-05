import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { DialogLine } from '../data/dialogs';

/**
 * Fixed-position RPG-style dialog box displayed at the bottom of the screen.
 * Renders inside the active scene (not UIScene) so world clicks are blocked
 * by the invisible interceptor rectangle while dialog is showing.
 */
export class DialogBox {
  private scene: Phaser.Scene;

  private blocker!: Phaser.GameObjects.Rectangle;
  private bg!: Phaser.GameObjects.Rectangle;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private advanceIndicator!: Phaser.GameObjects.Text;

  private lines: DialogLine[] = [];
  private currentIndex = 0;
  private open = false;
  private onDone: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.build();
    this.setVisible(false);
  }

  private build(): void {
    const BOX_H = 115;
    const BOX_W = CANVAS_WIDTH - 40;
    const cx    = CANVAS_WIDTH / 2;
    const top   = CANVAS_HEIGHT - BOX_H - 72; // above the HotBar

    // Invisible click-blocker covers the dialog area + a bit more
    this.blocker = this.scene.add.rectangle(cx, top + BOX_H / 2, CANVAS_WIDTH, BOX_H + 20, 0x000000, 0);
    this.blocker.setScrollFactor(0).setDepth(148).setInteractive();

    // Visible panel
    this.bg = this.scene.add.rectangle(cx, top + BOX_H / 2, BOX_W, BOX_H, 0x0d0d1a, 0.94);
    this.bg.setStrokeStyle(2, 0x5b6ee1, 1).setScrollFactor(0).setDepth(149);
    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerdown', () => this.advance());

    // NPC name tag
    this.nameText = this.scene.add.text(cx - BOX_W / 2 + 14, top + 10, '', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(150);

    // Dialog body
    this.bodyText = this.scene.add.text(cx - BOX_W / 2 + 14, top + 32, '', {
      fontFamily: '"Courier New"', fontSize: '15px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
      wordWrap: { width: BOX_W - 28 },
    }).setScrollFactor(0).setDepth(150);

    // "▶" advance indicator with blink
    this.advanceIndicator = this.scene.add.text(cx + BOX_W / 2 - 12, top + BOX_H - 14, '▶', {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#888888',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(150);

    this.scene.tweens.add({
      targets: this.advanceIndicator,
      alpha: 0.15, duration: 550,
      ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
    });
  }

  /** Show the dialog with the given lines. onDone is called after the last line. */
  show(lines: DialogLine[], onDone?: () => void): void {
    this.lines = lines;
    this.currentIndex = 0;
    this.onDone = onDone ?? null;
    this.open = true;
    this.setVisible(true);
    this.renderCurrent();
  }

  /** Forcibly close without firing onDone. */
  dismiss(): void {
    this.open = false;
    this.setVisible(false);
  }

  isVisible(): boolean {
    return this.open;
  }

  private renderCurrent(): void {
    const line = this.lines[this.currentIndex];
    this.nameText.setText(line.speaker + ':');
    this.bodyText.setText(line.text);
  }

  private advance(): void {
    this.currentIndex++;
    if (this.currentIndex >= this.lines.length) {
      this.open = false;
      this.setVisible(false);
      this.onDone?.();
    } else {
      this.renderCurrent();
    }
  }

  private setVisible(v: boolean): void {
    this.blocker.setVisible(v);
    this.bg.setVisible(v);
    this.nameText.setVisible(v);
    this.bodyText.setVisible(v);
    this.advanceIndicator.setVisible(v);
  }
}
