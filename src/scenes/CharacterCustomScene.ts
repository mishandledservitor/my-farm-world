import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { C } from '../utils/ColorPalette';
import { PlayerAppearance, DEFAULT_APPEARANCE, refreshPlayerTextures } from '../utils/PlayerTextureUtils';
import { SaveManager } from '../save/SaveManager';
import { defaultSave } from '../save/SaveSchema';

// ── Appearance options ────────────────────────────────────────────────────────

const SKIN_COLORS = [C.SKIN_LIGHT, C.SKIN_FAIR, C.SKIN_MEDIUM, C.SKIN_TAN, C.SKIN_DARK];

const HAIR_COLORS = [
  C.HAIR_BLONDE, C.HAIR_AUBURN, C.HAIR_BROWN, C.HAIR_DARK,
  C.HAIR_BLACK,  C.HAIR_RED,   C.HAIR_GREY,  C.HAIR_WHITE,
];

const SHIRT_COLORS = [
  C.SHIRT_RED,    C.SHIRT_BLUE,   C.SHIRT_GREEN,  C.SHIRT_YELLOW,
  C.SHIRT_PURPLE, C.SHIRT_ORANGE, C.SHIRT_TEAL,   C.SHIRT_WHITE,
];

// ── Scene ─────────────────────────────────────────────────────────────────────

export class CharacterCustomScene extends Phaser.Scene {
  private appearance: PlayerAppearance = { ...DEFAULT_APPEARANCE };
  private previewSprite!: Phaser.GameObjects.Image;

  // One selected swatch rect per category
  private selectedSkin:  Phaser.GameObjects.Rectangle | null = null;
  private selectedHair:  Phaser.GameObjects.Rectangle | null = null;
  private selectedShirt: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super({ key: 'CharacterCustomScene' });
  }

  create(): void {
    const W = CANVAS_WIDTH;
    const H = CANVAS_HEIGHT;

    // ── Background ────────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x2d4a2d);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.35);

    // ── Title ─────────────────────────────────────────────────────────────────
    this.add.text(W / 2, 52, 'CHOOSE YOUR FARMER', {
      fontFamily: '"Courier New"',
      fontSize: '38px',
      color: '#fbf236',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // ── Left panel: character preview ─────────────────────────────────────────
    const previewX = 190;
    const previewY = 330;

    this.add.rectangle(previewX, previewY, 220, 300, 0x1a2e1a)
      .setStrokeStyle(2, 0x4a8f3f, 1);

    this.add.text(previewX, 170, 'YOUR FARMER', {
      fontFamily: '"Courier New"',
      fontSize: '14px',
      color: '#9badb7',
    }).setOrigin(0.5);

    this.previewSprite = this.add.image(previewX, previewY - 10, 'player-south', 0).setScale(9);

    // Gentle idle bob
    this.tweens.add({
      targets: this.previewSprite,
      y: previewY - 18,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // ── Back link ─────────────────────────────────────────────────────────────
    const backLink = this.add.text(44, H - 48, '← BACK', {
      fontFamily: '"Courier New"',
      fontSize: '18px',
      color: '#9badb7',
    }).setInteractive({ useHandCursor: true });

    backLink.on('pointerover', () => backLink.setColor('#ffffff'));
    backLink.on('pointerout',  () => backLink.setColor('#9badb7'));
    backLink.on('pointerdown', () => this.scene.start('MainMenuScene'));

    // ── Right panel: option rows ──────────────────────────────────────────────
    const panelCX = 620;

    this.buildRow('skin',  'SKIN TONE',   panelCX, 145, SKIN_COLORS,  DEFAULT_APPEARANCE.skin);
    this.buildRow('hair',  'HAIR COLOR',  panelCX, 295, HAIR_COLORS,  DEFAULT_APPEARANCE.hair);
    this.buildRow('shirt', 'SHIRT COLOR', panelCX, 445, SHIRT_COLORS, DEFAULT_APPEARANCE.shirt);

    // ── Start Farm button ─────────────────────────────────────────────────────
    this.makeButton(panelCX, 580, 'START FARM!', 0x4a8f3f, () => {
      const save = defaultSave();
      save.appearance = { ...this.appearance };
      SaveManager.save(save);
      this.scene.start('GameScene');
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private buildRow(
    type: 'skin' | 'hair' | 'shirt',
    label: string,
    cx: number,
    y: number,
    colors: readonly number[],
    defaultColor: number,
  ): void {
    this.add.text(cx, y, label, {
      fontFamily: '"Courier New"',
      fontSize: '16px',
      color: '#cbdbfc',
    }).setOrigin(0.5);

    const SWATCH = 38;
    const GAP    = 10;
    const totalW = colors.length * SWATCH + (colors.length - 1) * GAP;
    const startX = cx - totalW / 2 + SWATCH / 2;

    colors.forEach((color, i) => {
      const sx = startX + i * (SWATCH + GAP);
      const sy = y + 55;

      const rect = this.add.rectangle(sx, sy, SWATCH, SWATCH, color);
      rect.setStrokeStyle(2, 0x666666, 1);
      rect.setInteractive({ useHandCursor: true });

      rect.on('pointerover', () => {
        if (!this.isSelected(type, rect)) rect.setStrokeStyle(2, 0xffffff, 0.8);
      });
      rect.on('pointerout', () => {
        if (!this.isSelected(type, rect)) rect.setStrokeStyle(2, 0x666666, 1);
      });
      rect.on('pointerdown', () => this.selectSwatch(type, rect, color));

      if (color === defaultColor) this.selectSwatch(type, rect, color);
    });
  }

  private isSelected(type: 'skin' | 'hair' | 'shirt', rect: Phaser.GameObjects.Rectangle): boolean {
    if (type === 'skin')  return this.selectedSkin  === rect;
    if (type === 'hair')  return this.selectedHair  === rect;
    return                       this.selectedShirt === rect;
  }

  private selectSwatch(
    type: 'skin' | 'hair' | 'shirt',
    rect: Phaser.GameObjects.Rectangle,
    color: number,
  ): void {
    // Deselect previous
    const prev = type === 'skin' ? this.selectedSkin : type === 'hair' ? this.selectedHair : this.selectedShirt;
    if (prev) prev.setStrokeStyle(2, 0x666666, 1);

    // Select new
    rect.setStrokeStyle(3, 0xffff00, 1);
    if (type === 'skin')  this.selectedSkin  = rect;
    if (type === 'hair')  this.selectedHair  = rect;
    if (type === 'shirt') this.selectedShirt = rect;

    this.appearance[type] = color;

    // Refresh player preview
    refreshPlayerTextures(this, this.appearance);
    this.previewSprite.setTexture('player-south', 0);
  }

  private makeButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const w = 260;
    const h = 56;

    const bg = this.add.rectangle(x, y, w, h, color);
    bg.setStrokeStyle(2, 0xaaaaaa, 0.6);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Courier New"',
      fontSize: '26px',
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
