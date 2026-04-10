import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { InventorySystem, INVENTORY_SIZE, HOTBAR_SIZE } from '../systems/InventorySystem';
import { getItem } from '../data/items';
import { EventBus } from '../utils/EventBus';

const SLOT_SIZE = 48;
const SLOT_GAP = 6;
const COLS = 8;
const ICON_SCALE = 3;

/**
 * Full-screen inventory (backpack) panel.
 * Shows all 24 slots. Click a slot to select it, click another to swap.
 * Items in slots 0-7 are the hotbar; slots 8-23 are the backpack.
 */
export class InventoryPanel {
  private scene: Phaser.Scene;
  private inventory: InventorySystem;
  private root: Phaser.GameObjects.Container | null = null;
  private visible = false;
  private selectedSwapSlot = -1; // first click slot for swapping

  constructor(scene: Phaser.Scene, inventory: InventorySystem) {
    this.scene = scene;
    this.inventory = inventory;
  }

  open(): void {
    this.visible = true;
    this.selectedSwapSlot = -1;
    this.rebuild();
  }

  close(): void {
    this.visible = false;
    this.selectedSwapSlot = -1;
    this.root?.destroy();
    this.root = null;
  }

  isVisible(): boolean { return this.visible; }

  private rebuild(): void {
    this.root?.destroy();

    const ROWS = Math.ceil(INVENTORY_SIZE / COLS);
    const PW = COLS * (SLOT_SIZE + SLOT_GAP) + SLOT_GAP + 40;
    const PH = ROWS * (SLOT_SIZE + SLOT_GAP) + SLOT_GAP + 100;
    const px = (CANVAS_WIDTH - PW) / 2;
    const py = (CANVAS_HEIGHT - PH) / 2;
    const cx = px + PW / 2;

    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    // Dim background
    add(this.scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.65)
      .setScrollFactor(0).setDepth(179).setInteractive());

    // Panel
    add(this.scene.add.rectangle(cx, py + PH / 2, PW, PH, 0x0d0d1a, 0.97)
      .setStrokeStyle(2, 0x5b6ee1, 1).setScrollFactor(0).setDepth(180));

    // Title
    add(this.scene.add.text(cx, py + 14, 'INVENTORY', {
      fontFamily: '"Courier New"', fontSize: '20px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(181));

    // Instruction
    const instrText = this.selectedSwapSlot >= 0
      ? 'Click another slot to swap, or same slot to cancel'
      : 'Click a slot to pick it up, then click another to swap';
    add(this.scene.add.text(cx, py + 40, instrText, {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#9badb7',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(181));

    // Separator between hotbar label and slots
    add(this.scene.add.text(px + 20, py + 62, 'HOTBAR (1-8)', {
      fontFamily: '"Courier New"', fontSize: '12px', color: '#88ff88',
    }).setScrollFactor(0).setDepth(181));

    const startY = py + 80;

    for (let i = 0; i < INVENTORY_SIZE; i++) {
      // Add backpack label between hotbar and backpack rows
      if (i === HOTBAR_SIZE) {
        const labelY = startY + Math.floor(i / COLS) * (SLOT_SIZE + SLOT_GAP) - 18;
        add(this.scene.add.text(px + 20, labelY, 'BACKPACK', {
          fontFamily: '"Courier New"', fontSize: '12px', color: '#cbdbfc',
        }).setScrollFactor(0).setDepth(181));
      }

      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const extraY = i >= HOTBAR_SIZE ? 20 : 0; // gap between hotbar and backpack
      const sx = px + 20 + col * (SLOT_SIZE + SLOT_GAP) + SLOT_SIZE / 2;
      const sy = startY + row * (SLOT_SIZE + SLOT_GAP) + SLOT_SIZE / 2 + extraY;

      const slot = this.inventory.getSlot(i);

      // Slot background
      const isHighlighted = i === this.selectedSwapSlot;
      const bgColor = isHighlighted ? 0x5b6ee1 : 0x222222;
      const bg = add(this.scene.add.rectangle(sx, sy, SLOT_SIZE, SLOT_SIZE, bgColor, 0.8)
        .setStrokeStyle(2, isHighlighted ? 0xffff00 : 0x555555)
        .setScrollFactor(0).setDepth(181)
        .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Rectangle;

      const capturedIndex = i;
      bg.on('pointerover', () => { if (capturedIndex !== this.selectedSwapSlot) bg.setStrokeStyle(2, 0xffffff); });
      bg.on('pointerout', () => { if (capturedIndex !== this.selectedSwapSlot) bg.setStrokeStyle(2, 0x555555); });
      bg.on('pointerdown', () => this.handleSlotClick(capturedIndex));

      // Item icon
      if (slot.itemId) {
        const iconKey = `icon-${slot.itemId}`;
        if (this.scene.textures.exists(iconKey)) {
          add(this.scene.add.image(sx, sy, iconKey)
            .setScale(ICON_SCALE).setScrollFactor(0).setDepth(182));
        }

        // Quantity
        if (slot.quantity > 1) {
          add(this.scene.add.text(sx + SLOT_SIZE / 2 - 4, sy + SLOT_SIZE / 2 - 4, String(slot.quantity), {
            fontFamily: '"Courier New"', fontSize: '14px', color: '#ffffff',
            stroke: '#000', strokeThickness: 2,
          }).setOrigin(1, 1).setScrollFactor(0).setDepth(183));
        }

        // Item name tooltip below
        try {
          const item = getItem(slot.itemId);
          add(this.scene.add.text(sx, sy + SLOT_SIZE / 2 + 2, item.name, {
            fontFamily: '"Courier New"', fontSize: '9px', color: '#888888',
          }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(183));
        } catch { /* skip */ }
      }

      // Slot number for hotbar
      if (i < HOTBAR_SIZE) {
        add(this.scene.add.text(sx - SLOT_SIZE / 2 + 3, sy - SLOT_SIZE / 2 + 2, String(i + 1), {
          fontFamily: '"Courier New"', fontSize: '10px', color: '#666666',
        }).setScrollFactor(0).setDepth(183));
      }
    }

    // Close button
    const closeBtn = add(this.scene.add.text(px + PW - 14, py + PH - 14, '[ CLOSE ]', {
      fontFamily: '"Courier New"', fontSize: '16px', color: '#9badb7',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(182)
      .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#9badb7'));
    closeBtn.on('pointerdown', () => this.close());

    this.root = this.scene.add.container(0, 0, objs);
    this.root.setDepth(200);
  }

  private handleSlotClick(index: number): void {
    if (this.selectedSwapSlot < 0) {
      // First click: select slot to move
      this.selectedSwapSlot = index;
      this.rebuild();
    } else if (this.selectedSwapSlot === index) {
      // Clicked same slot: cancel
      this.selectedSwapSlot = -1;
      this.rebuild();
    } else {
      // Second click: swap slots
      this.inventory.swapSlots(this.selectedSwapSlot, index);
      this.selectedSwapSlot = -1;
      this.rebuild();
    }
  }
}
