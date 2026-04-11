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
      this.add.text(W / 2, 300, `Last saved: Day ${summary.day}  |  ${summary.coins} coins`, {
        fontFamily: '"Courier New"',
        fontSize: '14px',
        color: '#9badb7',
      }).setOrigin(0.5);

      this.makeButton(W / 2, 350, 'CONTINUE', 0x306082, () => {
        const save = SaveManager.load()!;
        refreshPlayerTextures(this, save.appearance);
        const scene = save.currentScene ?? 'GameScene';
        this.scene.start(scene);
      });

      this.makeButton(W / 2, 420, 'NEW GAME', 0x4a2d0a, () => {
        this.showNewGameConfirm();
      });

      // Save/Load file buttons
      this.makeButton(W / 2 - 128, 490, 'SAVE FILE', 0x37946e, () => {
        SaveManager.exportToFile();
      }, 180, 44, '18px');

      this.makeButton(W / 2 + 128, 490, 'LOAD FILE', 0x37946e, () => {
        SaveManager.importFromFile().then(ok => {
          if (ok) this.scene.restart();
        });
      }, 180, 44, '18px');
    } else {
      this.makeButton(W / 2, 370, 'NEW GAME', 0x4a8f3f, () => {
        this.scene.start('CharacterCustomScene');
      });

      this.makeButton(W / 2, 440, 'LOAD FILE', 0x37946e, () => {
        SaveManager.importFromFile().then(ok => {
          if (ok) this.scene.restart();
        });
      }, 200, 44, '18px');
    }

    // ── Version watermark ─────────────────────────────────────────────────────
    this.add.text(W - 10, H - 10, 'v1.6.0', {
      fontFamily: '"Courier New"',
      fontSize: '11px',
      color: '#595652',
    }).setOrigin(1, 1);
  }

  private showNewGameConfirm(): void {
    const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
    const PW = 400, PH = 140;
    const px = (W - PW) / 2, py = (H - PH) / 2;
    const cx = px + PW / 2;

    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(50).setInteractive());
    add(this.add.rectangle(cx, py + PH / 2, PW, PH, 0x0d0d1a, 0.97)
      .setStrokeStyle(2, 0xfbf236, 1).setDepth(51));
    add(this.add.text(cx, py + 18, 'Start a new game?', {
      fontFamily: '"Courier New"', fontSize: '16px', color: '#fbf236',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(52));
    add(this.add.text(cx, py + 46, 'Your current save will be lost.', {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#ff8888',
    }).setOrigin(0.5, 0).setDepth(52));

    const closePanel = () => container.destroy();

    const yesBtn = add(this.add.text(cx - 60, py + PH - 22, '[YES]', {
      fontFamily: '"Courier New"', fontSize: '15px', color: '#99e550',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(53).setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    yesBtn.on('pointerover', () => yesBtn.setColor('#ffffff'));
    yesBtn.on('pointerout',  () => yesBtn.setColor('#99e550'));
    yesBtn.on('pointerdown', () => {
      SaveManager.deleteSave();
      closePanel();
      this.scene.start('CharacterCustomScene');
    });

    const noBtn = add(this.add.text(cx + 60, py + PH - 22, '[CANCEL]', {
      fontFamily: '"Courier New"', fontSize: '15px', color: '#9badb7',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(53).setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    noBtn.on('pointerover', () => noBtn.setColor('#ffffff'));
    noBtn.on('pointerout',  () => noBtn.setColor('#9badb7'));
    noBtn.on('pointerdown', () => closePanel());

    const container = this.add.container(0, 0, objs);
    void container;
  }

  private makeButton(x: number, y: number, label: string, color: number, onClick: () => void, w = 240, h = 54, fontSize = '24px'): void {

    const bg = this.add.rectangle(x, y, w, h, color);
    bg.setStrokeStyle(2, 0xaaaaaa, 0.6);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Courier New"',
      fontSize,
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
