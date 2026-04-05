import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { InventorySystem } from '../systems/InventorySystem';
import { getItem } from '../data/items';
import { EventBus } from '../utils/EventBus';

const SELLABLE_CATS = new Set(['crop', 'processed', 'resource']);

type CoinsCallback = (newCoins: number) => void;

/**
 * Full-screen shop overlay with SELL and BUY columns.
 * Rebuilt from scratch each time a transaction occurs so coin/stock
 * displays are always up-to-date.
 */
export class ShopPanel {
  private scene: Phaser.Scene;
  private inventory: InventorySystem;
  private stock: string[];       // item IDs the shop sells
  private title: string;
  private coins: number;
  private onCoinsChange: CoinsCallback;
  sellMultiplier = 1.0;          // set to 1.1 when cat is owned

  private root: Phaser.GameObjects.Container | null = null;
  private visible = false;

  constructor(
    scene: Phaser.Scene,
    inventory: InventorySystem,
    stock: string[],
    title: string,
    initialCoins: number,
    onCoinsChange: CoinsCallback,
  ) {
    this.scene = scene;
    this.inventory = inventory;
    this.stock = stock;
    this.title = title;
    this.coins = initialCoins;
    this.onCoinsChange = onCoinsChange;
  }

  open(coins: number): void {
    this.coins = coins;
    this.visible = true;
    this.rebuild();
  }

  close(): void {
    this.visible = false;
    this.root?.destroy();
    this.root = null;
  }

  isVisible(): boolean { return this.visible; }

  // ── Build / rebuild ─────────────────────────────────────────────────────────

  private rebuild(): void {
    this.root?.destroy();

    const PW = 820, PH = 460;
    const px = (CANVAS_WIDTH - PW) / 2;
    const py = (CANVAS_HEIGHT - PH) / 2;
    const cx = px + PW / 2;
    const HALF = PW / 2;

    const objs: Phaser.GameObjects.GameObject[] = [];

    const add = <T extends Phaser.GameObjects.GameObject>(obj: T) => { objs.push(obj); return obj; };

    // Dim background
    add(this.scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.65)
      .setScrollFactor(0).setDepth(179).setInteractive());

    // Panel
    add(this.scene.add.rectangle(cx, py + PH / 2, PW, PH, 0x0d0d1a, 0.97)
      .setStrokeStyle(2, 0x5b6ee1, 1).setScrollFactor(0).setDepth(180));

    // Title
    add(this.scene.add.text(cx, py + 14, this.title, {
      fontFamily: '"Courier New"', fontSize: '18px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(181));

    // Coins display
    const coinTxt = add(this.scene.add.text(px + PW - 14, py + 14, `$ ${this.coins}`, {
      fontFamily: '"Courier New"', fontSize: '16px', color: '#f7c35e',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(181)) as Phaser.GameObjects.Text;
    void coinTxt; // kept via objs reference

    // Header separator
    add(this.scene.add.rectangle(cx, py + 46, PW - 4, 2, 0x444466).setScrollFactor(0).setDepth(181));

    // Column headers
    add(this.scene.add.text(px + 20, py + 54, 'SELL YOUR GOODS', {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#99e550',
    }).setScrollFactor(0).setDepth(181));

    add(this.scene.add.text(px + HALF + 16, py + 54, 'BUY', {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#5fcde4',
    }).setScrollFactor(0).setDepth(181));

    // Vertical divider
    add(this.scene.add.rectangle(px + HALF, py + PH / 2 + 20, 2, PH - 80, 0x333355).setScrollFactor(0).setDepth(181));

    // ── Sell column ────────────────────────────────────────────────────────────
    let sy = py + 78;
    let hasSellable = false;

    for (let i = 0; i < 24 && sy < py + PH - 50; i++) {
      const slot = this.inventory.getSlot(i);
      if (!slot.itemId || slot.quantity <= 0) continue;
      const item = getItem(slot.itemId);
      if (!SELLABLE_CATS.has(item.category)) continue;

      hasSellable = true;
      const total = Math.floor(item.basePrice * this.sellMultiplier) * slot.quantity;
      const capturedId = slot.itemId;

      this.addRow(objs, px + 16, sy,
        capturedId, item.name, slot.quantity, `${total}g`,
        '[SELL]', '#99e550',
        () => {
          const qty = this.inventory.countItem(capturedId);
          if (qty <= 0) return;
          this.inventory.removeItem(capturedId, qty);
          this.coins += Math.floor(item.basePrice * this.sellMultiplier) * qty;
          this.onCoinsChange(this.coins);
          EventBus.emit('coins:changed', { coins: this.coins });
          this.rebuild();
        },
      );
      sy += 38;
    }

    if (!hasSellable) {
      add(this.scene.add.text(px + 20, py + 80, 'Nothing to sell right now.', {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#595652',
      }).setScrollFactor(0).setDepth(181));
    }

    // ── Buy column ─────────────────────────────────────────────────────────────
    let by = py + 78;

    for (const itemId of this.stock) {
      if (by > py + PH - 50) break;
      const item = getItem(itemId);
      if (item.buyPrice <= 0) continue;

      const canAfford = this.coins >= item.buyPrice;
      this.addRow(objs, px + HALF + 12, by,
        itemId, item.name, null, `${item.buyPrice}g`,
        '[BUY]', canAfford ? '#5fcde4' : '#595652',
        canAfford ? () => {
          if (this.coins < item.buyPrice) return;
          this.coins -= item.buyPrice;
          this.inventory.addItem(itemId, 1);
          this.onCoinsChange(this.coins);
          EventBus.emit('coins:changed', { coins: this.coins });
          this.rebuild();
        } : null,
        !canAfford,
      );
      by += 38;
    }

    // Close button
    const closeBtn = add(this.scene.add.text(px + PW - 14, py + PH - 14, '[ CLOSE ]', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#9badb7',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(182).setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout',  () => closeBtn.setColor('#9badb7'));
    closeBtn.on('pointerdown', () => this.close());

    this.root = this.scene.add.container(0, 0, objs);
  }

  private addRow(
    objs: Phaser.GameObjects.GameObject[],
    x: number, y: number,
    itemId: string,
    name: string,
    qty: number | null,
    priceStr: string,
    btnLabel: string,
    btnColor: string,
    onAction: (() => void) | null,
    dimmed = false,
  ): void {
    const depth = 182;
    const col = dimmed ? '#595652' : '#ffffff';
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    // Icon
    const iconKey = `icon-${itemId}`;
    if (this.scene.textures.exists(iconKey)) {
      add(this.scene.add.image(x + 16, y + 16, iconKey).setScale(2.5).setScrollFactor(0).setDepth(depth));
    }

    // Name + qty
    const nameStr = qty !== null ? `${name} ×${qty}` : name;
    add(this.scene.add.text(x + 36, y + 4, nameStr, {
      fontFamily: '"Courier New"', fontSize: '13px', color: col,
    }).setScrollFactor(0).setDepth(depth));

    // Price
    add(this.scene.add.text(x + 36, y + 20, priceStr, {
      fontFamily: '"Courier New"', fontSize: '12px', color: dimmed ? '#595652' : '#f7c35e',
    }).setScrollFactor(0).setDepth(depth));

    // Action button
    const btn = add(this.scene.add.text(x + 168, y + 10, btnLabel, {
      fontFamily: '"Courier New"', fontSize: '13px', color: btnColor,
    }).setScrollFactor(0).setDepth(depth)) as Phaser.GameObjects.Text;

    if (onAction) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout',  () => btn.setColor(btnColor));
      btn.on('pointerdown', onAction);
    }
  }
}
