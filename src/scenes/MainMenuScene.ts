import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCALE } from '../constants/GameConfig';
import { SaveManager } from '../save/SaveManager';
import { refreshPlayerTextures } from '../utils/PlayerTextureUtils';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const W = CANVAS_WIDTH;
    const H = CANVAS_HEIGHT;

    // ── Background ────────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x2d4a2d);

    // Decorative ground strip at bottom
    this.add.rectangle(W / 2, H - 55, W, 110, 0x5a3a1a);

    // Grass strip on top of ground
    for (let i = 0; i < Math.ceil(W / 48); i++) {
      this.add.image(i * 48, H - 96, 'tile-grass').setScale(SCALE).setOrigin(0, 0);
    }

    // Trees on left and right sides
    const treeXs = [80, 170, W - 170, W - 80];
    treeXs.forEach(tx => {
      this.add.image(tx, H - 144, 'tree-top').setScale(SCALE);
      this.add.image(tx, H - 96, 'tree-trunk').setScale(SCALE);
    });

    // Farmhouse center-bottom
    this.add.image(W / 2, H - 112, 'farmhouse').setScale(SCALE * 2);

    // ── Title panel ───────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, 200, 680, 200, 0x000000, 0.45)
      .setStrokeStyle(2, 0x6abe30, 0.7);

    this.add.text(W / 2, 150, 'MY FARM WORLD', {
      fontFamily: '"Courier New"',
      fontSize: '56px',
      color: '#fbf236',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(W / 2, 215, '~ a peaceful farming life ~', {
      fontFamily: '"Courier New"',
      fontSize: '20px',
      color: '#99e550',
    }).setOrigin(0.5);

    // ── Buttons ───────────────────────────────────────────────────────────────
    const hasSave = SaveManager.hasSave();
    const summary = hasSave ? SaveManager.getSummary() : null;

    if (hasSave && summary) {
      // Show save info above Continue button
      this.add.text(W / 2, 320, `Last saved: Day ${summary.day}  |  ${summary.coins} coins`, {
        fontFamily: '"Courier New"',
        fontSize: '14px',
        color: '#9badb7',
      }).setOrigin(0.5);

      this.makeButton(W / 2, 375, 'CONTINUE', 0x306082, () => {
        const save = SaveManager.load()!;
        refreshPlayerTextures(this, save.appearance);
        const scene = save.currentScene ?? 'GameScene';
        this.scene.start(scene);
      });

      this.makeButton(W / 2, 450, 'NEW GAME', 0x4a2d0a, () => {
        this.scene.start('CharacterCustomScene');
      });
    } else {
      this.makeButton(W / 2, 395, 'NEW GAME', 0x4a8f3f, () => {
        this.scene.start('CharacterCustomScene');
      });
    }

    // ── Version watermark ─────────────────────────────────────────────────────
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontFamily: '"Courier New"',
      fontSize: '11px',
      color: '#595652',
    }).setOrigin(1, 1);
  }

  private makeButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const w = 240;
    const h = 54;

    const bg = this.add.rectangle(x, y, w, h, color);
    bg.setStrokeStyle(2, 0xaaaaaa, 0.6);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Courier New"',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setStrokeStyle(3, 0xffff00, 1);
      txt.setColor('#fbf236');
    });
    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0xaaaaaa, 0.6);
      txt.setColor('#ffffff');
    });
    bg.on('pointerdown', onClick);
  }
}
