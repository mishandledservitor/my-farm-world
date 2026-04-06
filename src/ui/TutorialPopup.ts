import Phaser from 'phaser';
import { CANVAS_WIDTH } from '../constants/GameConfig';
import { TutorialSystem } from '../systems/TutorialSystem';
import { EventBus } from '../utils/EventBus';

const DEPTH  = 141;
const PW     = 480;
const PH     = 128;
const PX     = (CANVAS_WIDTH - PW) / 2;   // top-centre below the clock HUD
const PY     = 10;

/**
 * Non-blocking tutorial hint box shown at the top of the screen.
 * Listens to the tutorial:step event and rebuilds automatically.
 * Call destroy() when the owning scene shuts down.
 */
export class TutorialPopup {
  private scene:    Phaser.Scene;
  private tutorial: TutorialSystem;
  private sceneName: string;
  private root:     Phaser.GameObjects.Container | null = null;

  // Keep bound reference so EventBus.off works correctly
  private readonly stepListener = (_d: { step: number }) => this.rebuild();

  constructor(scene: Phaser.Scene, tutorial: TutorialSystem, sceneName: string) {
    this.scene     = scene;
    this.tutorial  = tutorial;
    this.sceneName = sceneName;
    EventBus.on('tutorial:step', this.stepListener);
    this.rebuild();
  }

  destroy(): void {
    EventBus.off('tutorial:step', this.stepListener);
    this.root?.destroy();
    this.root = null;
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  private rebuild(): void {
    this.root?.destroy();
    this.root = null;

    if (this.tutorial.isComplete()) return;

    const step = this.tutorial.getCurrentStep();
    if (!step || !step.scenes.includes(this.sceneName)) return;

    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    // Background panel — interactive so clicks don't pass through to the world
    add(this.scene.add.rectangle(PX + PW / 2, PY + PH / 2, PW, PH, 0x080814, 0.92)
      .setStrokeStyle(1, 0x5b6ee1, 1).setScrollFactor(0).setDepth(DEPTH).setInteractive());

    // Step indicator
    const si    = this.tutorial.getStepIndex() + 1;  // display 1-based
    const total = this.tutorial.getTotalSteps();
    add(this.scene.add.text(PX + 8, PY + 6, `TUTORIAL  [${si} / ${total}]`, {
      fontFamily: '"Courier New"', fontSize: '11px', color: '#9badb7',
    }).setScrollFactor(0).setDepth(DEPTH + 1));

    // Skip button
    const skipBtn = add(this.scene.add.text(PX + PW - 8, PY + 6, '[SKIP]', {
      fontFamily: '"Courier New"', fontSize: '11px', color: '#595652',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH + 1)
      .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    skipBtn.on('pointerover', () => skipBtn.setColor('#d95763'));
    skipBtn.on('pointerout',  () => skipBtn.setColor('#595652'));
    skipBtn.on('pointerdown', () => this.tutorial.skip());

    // Main message
    add(this.scene.add.text(PX + 8, PY + 22, step.text, {
      fontFamily: '"Courier New"', fontSize: '12px', color: '#ffffff',
      wordWrap: { width: PW - 16 },
    }).setScrollFactor(0).setDepth(DEPTH + 1));

    // Directional arrow hint
    if (step.arrow) {
      add(this.scene.add.text(PX + PW / 2, PY + PH - 8, `${step.arrow}  ${step.arrowHint ?? ''}`, {
        fontFamily: '"Courier New"', fontSize: '11px', color: '#fbf236',
      }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(DEPTH + 1));
    }

    // OK button for manual-advance steps
    if (step.isManual) {
      const okBtn = add(this.scene.add.text(PX + PW - 8, PY + PH - 8, '[OK]', {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#99e550',
      }).setOrigin(1, 1).setScrollFactor(0).setDepth(DEPTH + 1)
        .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
      okBtn.on('pointerover', () => okBtn.setColor('#ffffff'));
      okBtn.on('pointerout',  () => okBtn.setColor('#99e550'));
      okBtn.on('pointerdown', () => this.tutorial.advance());
    }

    this.root = this.scene.add.container(0, 0, objs);
    this.root.setDepth(150);
  }
}
