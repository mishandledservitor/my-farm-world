import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { ProcessingSystem, RECIPES } from '../systems/ProcessingSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { getItem } from '../data/items';

const STATION_TITLES: Record<string, string> = {
  churn: 'BUTTER CHURN',
  mill:  'GRAIN MILL',
  oven:  'STONE OVEN',
};

/**
 * Panel for a single processing station — shows an active job's progress or
 * available recipes to start. Rebuilt on every action.
 */
export class CraftingPanel {
  private scene:             Phaser.Scene;
  private processingSystem:  ProcessingSystem;
  private inventory:         InventorySystem;
  private stationType:       string;
  private getAbsoluteMinutes: () => number;
  private root:              Phaser.GameObjects.Container | null = null;
  private visible = false;

  constructor(
    scene: Phaser.Scene,
    processingSystem: ProcessingSystem,
    inventory: InventorySystem,
    stationType: string,
    getAbsoluteMinutes: () => number,
  ) {
    this.scene              = scene;
    this.processingSystem   = processingSystem;
    this.inventory          = inventory;
    this.stationType        = stationType;
    this.getAbsoluteMinutes = getAbsoluteMinutes;
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

    const PW = 600, PH = 360;
    const px = (CANVAS_WIDTH  - PW) / 2;
    const py = (CANVAS_HEIGHT - PH) / 2;
    const cx = px + PW / 2;

    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    const now = this.getAbsoluteMinutes();

    // Dim background — clicking here closes the panel
    const dim = add(this.scene.add.rectangle(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.65,
    ).setScrollFactor(0).setDepth(179).setInteractive()) as Phaser.GameObjects.Rectangle;
    dim.on('pointerdown', () => this.close());

    // Panel — interactive to swallow clicks so they don't bubble to the dim bg
    add(this.scene.add.rectangle(cx, py + PH / 2, PW, PH, 0x0d0d1a, 0.97)
      .setStrokeStyle(2, 0x5b6ee1, 1).setScrollFactor(0).setDepth(180).setInteractive());

    // Title
    const title = STATION_TITLES[this.stationType] ?? this.stationType.toUpperCase();
    add(this.scene.add.text(cx, py + 14, title, {
      fontFamily: '"Courier New"', fontSize: '18px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(181));

    // Separator
    add(this.scene.add.rectangle(cx, py + 46, PW - 4, 2, 0x444466)
      .setScrollFactor(0).setDepth(181));

    // ── Content ────────────────────────────────────────────────────────────────
    let cy = py + 62;
    const job = this.processingSystem.getJob(this.stationType);

    if (job) {
      const complete  = this.processingSystem.isComplete(this.stationType, now);
      const progress  = this.processingSystem.getProgressFraction(this.stationType, now);
      const elapsed   = now - job.startTime;
      const remaining = Math.max(0, job.durationMinutes - elapsed);

      let jobIn  = job.inputItemId;
      let jobOut = job.outputItemId;
      try { jobIn  = getItem(job.inputItemId).name;  } catch { /* ok */ }
      try { jobOut = getItem(job.outputItemId).name; } catch { /* ok */ }
      add(this.scene.add.text(px + 20, cy, `Processing:  ${jobIn}  \u2192  ${jobOut}`, {
        fontFamily: '"Courier New"', fontSize: '14px', color: '#ffffff',
      }).setScrollFactor(0).setDepth(181));
      cy += 34;

      if (complete) {
        add(this.scene.add.text(px + 20, cy, '\u2713 READY TO COLLECT!', {
          fontFamily: '"Courier New"', fontSize: '14px', color: '#99e550',
        }).setScrollFactor(0).setDepth(181));
        cy += 32;

        const colBtn = add(this.scene.add.text(px + 20, cy, '[COLLECT]', {
          fontFamily: '"Courier New"', fontSize: '15px', color: '#5fcde4',
        }).setScrollFactor(0).setDepth(181)
          .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
        colBtn.on('pointerover', () => colBtn.setColor('#ffffff'));
        colBtn.on('pointerout',  () => colBtn.setColor('#5fcde4'));
        colBtn.on('pointerdown', () => {
          const outId = this.processingSystem.collectOutput(this.stationType);
          if (outId) this.inventory.addItem(outId, 1);
          this.rebuild();
        });
      } else {
        // Progress bar
        const BAR_W    = 340;
        const filledW  = Math.max(2, Math.floor(BAR_W * progress));
        add(this.scene.add.rectangle(
          px + 20 + BAR_W / 2, cy + 10, BAR_W, 18, 0x222244,
        ).setScrollFactor(0).setDepth(181));
        add(this.scene.add.rectangle(
          px + 20 + filledW / 2, cy + 10, filledW, 18, 0x5b6ee1,
        ).setScrollFactor(0).setDepth(182));
        cy += 30;

        add(this.scene.add.text(px + 20, cy, `${Math.ceil(remaining)} game-minutes remaining...`, {
          fontFamily: '"Courier New"', fontSize: '12px', color: '#9badb7',
        }).setScrollFactor(0).setDepth(181));
      }
    } else {
      // Idle — show recipes
      add(this.scene.add.text(px + 20, cy, 'Available recipes:', {
        fontFamily: '"Courier New"', fontSize: '13px', color: '#9badb7',
      }).setScrollFactor(0).setDepth(181));
      cy += 30;

      const recipes = RECIPES.filter(r => r.stationType === this.stationType);

      if (recipes.length === 0) {
        add(this.scene.add.text(px + 20, cy, 'No recipes for this station.', {
          fontFamily: '"Courier New"', fontSize: '13px', color: '#595652',
        }).setScrollFactor(0).setDepth(181));
      }

      for (const recipe of recipes) {
        const qty      = this.inventory.countItem(recipe.inputItemId);
        const extraQty = recipe.extraInputItemId
          ? this.inventory.countItem(recipe.extraInputItemId)
          : 1;
        const hasAll   = qty > 0 && extraQty > 0;
        const col      = hasAll ? '#ffffff' : '#595652';
        const btnCol   = hasAll ? '#99e550' : '#595652';

        let inputName  = recipe.inputItemId;
        let outputName = recipe.outputItemId;
        let extraName  = recipe.extraInputItemId ?? '';
        try { inputName  = getItem(recipe.inputItemId).name;  } catch { /* unknown item */ }
        try { outputName = getItem(recipe.outputItemId).name; } catch { /* unknown item */ }
        if (recipe.extraInputItemId) {
          try { extraName = getItem(recipe.extraInputItemId).name; } catch { /* unknown item */ }
        }

        // ── Render icons for the recipe ────────────────────────────────────────
        const ICON_SIZE = 24;
        let iconX = px + 20;
        const iconY = cy + 10;

        const addIcon = (itemId: string) => {
          const tex = `icon-${itemId}`;
          if (this.scene.textures.exists(tex)) {
            const img = this.scene.add.image(iconX, iconY, tex)
              .setOrigin(0, 0.5).setScale(2).setScrollFactor(0).setDepth(181);
            add(img);
          } else {
            // fallback placeholder
            add(this.scene.add.rectangle(
              iconX + ICON_SIZE / 2, iconY, ICON_SIZE, ICON_SIZE, 0x333355,
            ).setScrollFactor(0).setDepth(181));
          }
          iconX += ICON_SIZE + 6;
        };

        addIcon(recipe.inputItemId);
        if (recipe.extraInputItemId) {
          add(this.scene.add.text(iconX, iconY, '+', {
            fontFamily: '"Courier New"', fontSize: '16px', color: '#9badb7',
          }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(181));
          iconX += 14;
          addIcon(recipe.extraInputItemId);
        }
        add(this.scene.add.text(iconX, iconY, '\u2192', {
          fontFamily: '"Courier New"', fontSize: '16px', color: '#9badb7',
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(181));
        iconX += 20;
        addIcon(recipe.outputItemId);
        iconX += 8;

        const label = recipe.extraInputItemId
          ? `${inputName} (${qty}) + ${extraName} (${extraQty}) \u2192 ${outputName}  [${recipe.durationMinutes}m]`
          : `${inputName} ×1 (have: ${qty})  \u2192  ${outputName}  [${recipe.durationMinutes}m]`;
        add(this.scene.add.text(iconX, iconY, label, {
          fontFamily: '"Courier New"', fontSize: '12px', color: col,
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(181));

        const capturedRecipe = recipe;
        const startBtn = add(this.scene.add.text(px + PW - 90, iconY, '[START]', {
          fontFamily: '"Courier New"', fontSize: '13px', color: btnCol,
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(181)) as Phaser.GameObjects.Text;

        if (hasAll) {
          startBtn.setInteractive({ useHandCursor: true });
          startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
          startBtn.on('pointerout',  () => startBtn.setColor(btnCol));
          startBtn.on('pointerdown', () => {
            this.inventory.removeItem(capturedRecipe.inputItemId, 1);
            if (capturedRecipe.extraInputItemId) {
              this.inventory.removeItem(capturedRecipe.extraInputItemId, 1);
            }
            this.processingSystem.startJob(
              this.stationType,
              capturedRecipe.inputItemId,
              this.getAbsoluteMinutes(),
              capturedRecipe.outputItemId,
            );
            this.rebuild();
          });
        }

        cy += 42;
      }
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
