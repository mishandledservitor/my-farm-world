import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { InventorySystem, HOTBAR_SIZE } from '../systems/InventorySystem';
import { EnergySystem } from '../systems/EnergySystem';
import { EventBus } from '../utils/EventBus';
import { C } from '../utils/ColorPalette';
import { InventoryPanel } from './InventoryPanel';

const SLOT_SIZE = 44;
const SLOT_PAD = 4;
const ICON_SCALE = 3; // 12px raw × 3 = 36px displayed

export class HotBar {
  private scene: Phaser.Scene;
  private inventory: InventorySystem;
  private energy: EnergySystem;

  private slotBgs: Phaser.GameObjects.Rectangle[] = [];
  private slotIcons: Phaser.GameObjects.Image[] = [];
  private slotQtyTexts: Phaser.GameObjects.Text[] = [];
  private selectionHighlight!: Phaser.GameObjects.Rectangle;

  // Energy bar elements
  private energyBg!: Phaser.GameObjects.Rectangle;
  private energyFill!: Phaser.GameObjects.Rectangle;
  private energyText!: Phaser.GameObjects.Text;

  // Backpack panel
  private inventoryPanel: InventoryPanel | null = null;

  private readonly startX: number;
  private readonly startY: number;

  constructor(scene: Phaser.Scene, inventory: InventorySystem, energy: EnergySystem) {
    this.scene = scene;
    this.inventory = inventory;
    this.energy = energy;

    const totalW = HOTBAR_SIZE * (SLOT_SIZE + SLOT_PAD) - SLOT_PAD;
    this.startX = (CANVAS_WIDTH - totalW) / 2;
    this.startY = CANVAS_HEIGHT - SLOT_SIZE - 12;

    this.buildSlots();
    this.buildEnergyBar();
    this.buildBackpackButton();
    this.bindEvents();
    this.refresh();
  }

  isInventoryOpen(): boolean {
    return this.inventoryPanel?.isVisible() ?? false;
  }

  closeInventory(): void {
    this.inventoryPanel?.close();
    this.inventoryPanel = null;
  }

  private buildSlots(): void {
    // Selection highlight (behind slots)
    this.selectionHighlight = this.scene.add.rectangle(0, 0, SLOT_SIZE + 4, SLOT_SIZE + 4, 0xffff00, 0.4);
    this.selectionHighlight.setScrollFactor(0).setDepth(98);

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const x = this.startX + i * (SLOT_SIZE + SLOT_PAD) + SLOT_SIZE / 2;
      const y = this.startY + SLOT_SIZE / 2;

      // Slot background
      const bg = this.scene.add.rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x000000, 0.6);
      bg.setScrollFactor(0).setDepth(99);
      bg.setStrokeStyle(2, 0x888888, 1);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.inventory.selectSlot(i);
        this.refresh();
      });
      bg.on('pointerover', () => bg.setStrokeStyle(2, 0xffffff, 1));
      bg.on('pointerout', () => bg.setStrokeStyle(2, 0x888888, 1));
      this.slotBgs.push(bg);

      // Item icon (initially hidden)
      const icon = this.scene.add.image(x, y, 'icon-turnip_seed');
      icon.setScrollFactor(0).setDepth(100).setScale(ICON_SCALE).setVisible(false);
      this.slotIcons.push(icon);

      // Quantity text
      const qty = this.scene.add.text(
        x + SLOT_SIZE / 2 - 4,
        y + SLOT_SIZE / 2 - 14,
        '',
        { fontFamily: '"Courier New"', fontSize: '14px', color: '#ffffff', stroke: '#000', strokeThickness: 2 },
      );
      qty.setOrigin(1, 1).setScrollFactor(0).setDepth(101);
      this.slotQtyTexts.push(qty);

      // Slot number label
      this.scene.add.text(
        x - SLOT_SIZE / 2 + 4, y - SLOT_SIZE / 2 + 2,
        String(i + 1),
        { fontFamily: '"Courier New"', fontSize: '12px', color: '#888888' },
      ).setScrollFactor(0).setDepth(101);
    }
  }

  private buildEnergyBar(): void {
    const barW = 120;
    const barH = 12;
    const x = CANVAS_WIDTH - barW / 2 - 16;
    const y = CANVAS_HEIGHT - barH / 2 - 14;

    // Label
    this.scene.add.text(x - barW / 2 - 34, y - 7, 'ENE', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#88ff88',
      stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(100);

    this.energyBg = this.scene.add.rectangle(x, y, barW, barH, 0x222222, 0.8);
    this.energyBg.setScrollFactor(0).setDepth(99);
    this.energyBg.setStrokeStyle(1, 0x444444, 1);

    this.energyFill = this.scene.add.rectangle(x - barW / 2, y, barW, barH, 0x6abe30, 0.9);
    this.energyFill.setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
  }

  private buildBackpackButton(): void {
    const bx = this.startX - SLOT_SIZE - 10;
    const by = this.startY + SLOT_SIZE / 2;

    const bg = this.scene.add.rectangle(bx, by, SLOT_SIZE, SLOT_SIZE, 0x37946e, 0.8);
    bg.setScrollFactor(0).setDepth(99);
    bg.setStrokeStyle(2, 0x888888, 1);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.scene.add.text(bx, by, 'BAG', {
      fontFamily: '"Courier New"', fontSize: '12px', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    bg.on('pointerover', () => { bg.setStrokeStyle(2, 0xffffff); txt.setColor('#fbf236'); });
    bg.on('pointerout', () => { bg.setStrokeStyle(2, 0x888888); txt.setColor('#ffffff'); });
    bg.on('pointerdown', () => {
      if (this.inventoryPanel?.isVisible()) {
        this.inventoryPanel.close();
        this.inventoryPanel = null;
      } else {
        this.inventoryPanel = new InventoryPanel(this.scene, this.inventory);
        this.inventoryPanel.open();
      }
    });
  }

  private readonly onInventoryChanged = () => this.refresh();

  private bindEvents(): void {
    EventBus.on('inventory:changed', this.onInventoryChanged);
  }

  refresh(): void {
    const selected = this.inventory.getSelectedIndex();

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const slot = this.inventory.getSlot(i);
      const icon = this.slotIcons[i];
      const qty = this.slotQtyTexts[i];
      const bg = this.slotBgs[i];
      const x = this.startX + i * (SLOT_SIZE + SLOT_PAD) + SLOT_SIZE / 2;
      const y = this.startY + SLOT_SIZE / 2;

      if (slot.itemId) {
        const iconKey = `icon-${slot.itemId}`;
        const hasIcon = this.scene.textures.exists(iconKey);
        icon.setTexture(hasIcon ? iconKey : 'coin-icon');
        icon.setVisible(true).setScale(ICON_SCALE);
        qty.setText(slot.quantity > 1 ? String(slot.quantity) : '');
      } else {
        icon.setVisible(false);
        qty.setText('');
      }

      if (selected >= 0 && i === selected) {
        this.selectionHighlight.setPosition(x, y);
        this.selectionHighlight.setVisible(true);
        bg.setFillStyle(0x333333, 0.8);
      } else {
        bg.setFillStyle(0x000000, 0.6);
      }
    }

    // Hide highlight if nothing is selected
    if (selected < 0) {
      this.selectionHighlight.setVisible(false);
    }

    // Update energy bar
    const frac = this.energy.fraction;
    const barW = 120;
    this.energyFill.setDisplaySize(barW * frac, 12);

    // Color shifts: green → yellow → red
    if (frac > 0.5) {
      this.energyFill.setFillStyle(0x6abe30);
    } else if (frac > 0.25) {
      this.energyFill.setFillStyle(0xfbf236);
    } else {
      this.energyFill.setFillStyle(0xd95763);
    }
  }

  destroy(): void {
    EventBus.off('inventory:changed', this.onInventoryChanged);
    this.inventoryPanel?.close();
    this.inventoryPanel = null;
  }
}
