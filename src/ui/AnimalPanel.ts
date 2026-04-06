import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { AnimalSystem } from '../systems/AnimalSystem';
import { InventorySystem } from '../systems/InventorySystem';

/**
 * Full-screen barn panel — shows animals, hunger, produce, and cow-adding.
 * Rebuilt on every action to stay in sync with game state.
 */
export class AnimalPanel {
  private scene:         Phaser.Scene;
  private animalSystem:  AnimalSystem;
  private inventory:     InventorySystem;
  private root:          Phaser.GameObjects.Container | null = null;
  private visible = false;

  constructor(
    scene: Phaser.Scene,
    animalSystem: AnimalSystem,
    inventory: InventorySystem,
  ) {
    this.scene        = scene;
    this.animalSystem = animalSystem;
    this.inventory    = inventory;
  }

  open(): void { this.visible = true; this.rebuild(); }

  close(): void {
    this.visible = false;
    this.root?.destroy();
    this.root = null;
  }

  isVisible(): boolean { return this.visible; }

  // ── Build ──────────────────────────────────────────────────────────────────

  private rebuild(): void {
    this.root?.destroy();

    const PW = 700, PH = 440;
    const px = (CANVAS_WIDTH  - PW) / 2;
    const py = (CANVAS_HEIGHT - PH) / 2;
    const cx = px + PW / 2;

    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    // Dim background
    add(this.scene.add.rectangle(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.65,
    ).setScrollFactor(0).setDepth(179).setInteractive());

    // Panel
    add(this.scene.add.rectangle(cx, py + PH / 2, PW, PH, 0x0d0d1a, 0.97)
      .setStrokeStyle(2, 0x5b6ee1, 1).setScrollFactor(0).setDepth(180));

    // Title
    add(this.scene.add.text(cx, py + 14, 'THE BARN', {
      fontFamily: '"Courier New"', fontSize: '18px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(181));

    // Separator
    add(this.scene.add.rectangle(cx, py + 46, PW - 4, 2, 0x444466)
      .setScrollFactor(0).setDepth(181));

    // ── Animals ────────────────────────────────────────────────────────────────
    const animals = this.animalSystem.getAll();
    let ay = py + 58;

    if (animals.length === 0) {
      add(this.scene.add.text(px + 20, ay, 'No animals yet.', {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#595652',
      }).setScrollFactor(0).setDepth(181));
    }

    for (const animal of animals) {
      const capturedId  = animal.id;
      const hungerPct   = animal.hunger;
      const hungerColor = hungerPct < 40 ? '#99e550' : hungerPct < 70 ? '#f7c35e' : '#d95763';
      const hungerLabel = hungerPct < 40 ? 'Well fed' : hungerPct < 70 ? 'Hungry' : 'STARVING!';

      // Optional icon
      const iconKey = `icon-${animal.animalType}`;
      if (this.scene.textures.exists(iconKey)) {
        add(this.scene.add.image(px + 26, ay + 16, iconKey)
          .setScale(2.5).setScrollFactor(0).setDepth(181));
      }

      // Name & type
      add(this.scene.add.text(px + 50, ay + 2, `${animal.name}  (${animal.animalType})`, {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#ffffff',
      }).setScrollFactor(0).setDepth(181));

      // Hunger
      add(this.scene.add.text(px + 50, ay + 20, `Hunger: ${hungerLabel}`, {
        fontFamily: '"Courier New"', fontSize: '12px', color: hungerColor,
      }).setScrollFactor(0).setDepth(181));

      // Feed button
      const feedBtn = add(this.scene.add.text(px + 280, ay + 10, '[FEED]', {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#99e550',
      }).setScrollFactor(0).setDepth(181)
        .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
      feedBtn.on('pointerover', () => feedBtn.setColor('#ffffff'));
      feedBtn.on('pointerout',  () => feedBtn.setColor('#99e550'));
      feedBtn.on('pointerdown', () => {
        this.animalSystem.feed(capturedId);
        this.rebuild();
      });

      // Collect produce
      if (animal.produceReady) {
        const produceLabel = animal.animalType === 'chicken' ? 'COLLECT EGG' : 'COLLECT MILK';
        const colBtn = add(this.scene.add.text(px + 360, ay + 10, `[${produceLabel}]`, {
          fontFamily: '"Courier New"', fontSize: '13px', color: '#5fcde4',
        }).setScrollFactor(0).setDepth(181)
          .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
        colBtn.on('pointerover', () => colBtn.setColor('#ffffff'));
        colBtn.on('pointerout',  () => colBtn.setColor('#5fcde4'));
        colBtn.on('pointerdown', () => {
          const itemId = this.animalSystem.collectProduce(capturedId);
          if (itemId) this.inventory.addItem(itemId, 1);
          this.rebuild();
        });
      } else {
        add(this.scene.add.text(px + 360, ay + 10, 'No produce yet', {
          fontFamily: '"Courier New"', fontSize: '12px', color: '#595652',
        }).setScrollFactor(0).setDepth(181));
      }

      ay += 54;
    }

    // ── Add Cow (if player carries a 'cow' item) ───────────────────────────────
    if (this.inventory.countItem('cow') > 0) {
      const cowBtn = add(this.scene.add.text(px + 20, py + PH - 54, '[+ ADD COW TO BARN]', {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#f7c35e',
      }).setScrollFactor(0).setDepth(181)
        .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
      cowBtn.on('pointerover', () => cowBtn.setColor('#ffffff'));
      cowBtn.on('pointerout',  () => cowBtn.setColor('#f7c35e'));
      cowBtn.on('pointerdown', () => {
        this.inventory.removeItem('cow', 1);
        this.animalSystem.addAnimal('cow', 'Bessie');
        this.rebuild();
      });
    }

    // Close button
    const closeBtn = add(this.scene.add.text(px + PW - 14, py + PH - 14, '[ CLOSE ]', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#9badb7',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(182)
      .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout',  () => closeBtn.setColor('#9badb7'));
    closeBtn.on('pointerdown', () => this.close());

    this.root = this.scene.add.container(0, 0, objs);
    this.root.setDepth(200);
  }
}
