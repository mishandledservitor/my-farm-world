import Phaser from 'phaser';
import { TILE_SIZE, SCALE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { Player } from '../entities/Player';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { EnergySystem } from '../systems/EnergySystem';
import { HotBar } from '../ui/HotBar';
import { TutorialSystem } from '../systems/TutorialSystem';
import { TutorialPopup } from '../ui/TutorialPopup';
import { SaveManager } from '../save/SaveManager';
import { defaultSave, SaveFile } from '../save/SaveSchema';
import { PetEntity } from '../entities/PetEntity';

// ── Map constants ──────────────────────────────────────────────────────────────

const MCOLS = 20;
const MROWS = 15;
const MAX_FLOOR = 5;

// Ladder tile positions (same on every floor)
const LADDER_UP_COL   = 2;
const LADDER_UP_ROW   = 7;
const LADDER_DOWN_COL = 17;
const LADDER_DOWN_ROW = 7;

// Rock positions per floor — row 7 kept clear as main corridor
function getFloorRocks(floor: number): Array<[number, number]> {
  const result: Array<[number, number]> = [
    [5,3],[7,3],[10,3],[13,3],[15,4],[17,3],
    [3,5],[6,6],[9,5],[12,6],[15,5],[18,6],
    [4,9],[7,9],[10,11],[13,10],[16,9],[18,11],
  ];
  if (floor >= 2) result.push([2,2],[18,2],[5,5],[14,5],[8,8],[11,9]);
  if (floor >= 3) result.push([3,4],[9,6],[15,6],[6,11],[14,11],[17,4]);
  if (floor >= 4) result.push([5,2],[10,2],[15,2],[4,8],[11,6],[17,9]);
  if (floor >= 5) result.push([7,2],[13,2],[18,4],[3,9],[10,10],[16,6]);
  return result;
}

function getFloorLoot(floor: number): string {
  const r = Math.random();
  if (floor === 1) return 'stone';
  if (floor === 2) return r < 0.6 ? 'stone' : 'iron_ore';
  if (floor === 3) return r < 0.4 ? 'stone' : 'iron_ore';
  if (floor === 4) return r < 0.2 ? 'stone' : (r < 0.7 ? 'iron_ore' : 'gold_ore');
  return r < 0.1 ? 'stone' : (r < 0.4 ? 'iron_ore' : 'gold_ore');
}

// ── Scene ──────────────────────────────────────────────────────────────────────

export class MineScene extends Phaser.Scene {
  private player!: Player;
  private movement!: MovementSystem;
  private interaction!: InteractionSystem;
  private timeSystem!: TimeSystem;
  private inventory!: InventorySystem;
  private energySystem!: EnergySystem;
  private hotBar!: HotBar;
  private tutorialSystem!: TutorialSystem;
  private tutorialPopup!: TutorialPopup;
  private transitioning = false;
  private entryX = 4;
  private entryY = 7;

  private currentFloor = 1;
  private mineRocks  = new Set<string>();
  private rockSprites = new Map<string, Phaser.GameObjects.Image>();
  private floorObjects: Phaser.GameObjects.GameObject[] = [];
  private pets: PetEntity[] = [];

  constructor() {
    super({ key: 'MineScene' });
  }

  init(data: { entryX?: number; entryY?: number } = {}): void {
    this.entryX       = data.entryX ?? 4;
    this.entryY       = data.entryY ?? 7;
    this.currentFloor = 1;
  }

  create(): void {
    const save = SaveManager.load() ?? defaultSave();
    this.transitioning = false;
    this.floorObjects  = [];
    this.pets          = [];
    this.tutorialSystem = new TutorialSystem(save.tutorialStep ?? 0);

    this.renderBaseTiles();
    this.placeFloorObjects();
    this.spawnPlayer();
    this.setupSystems(save);
    this.spawnPets(save);
    this.setupCamera();
    this.buildUI();
    this.launchUI();
    this.disableContextMenu();

    this.tutorialPopup = new TutorialPopup(this, this.tutorialSystem, 'MineScene');
    this.events.once('shutdown', () => { this.tutorialPopup.destroy(); this.hotBar.destroy(); });
  }

  // ── Base tiles (rendered once, never change) ──────────────────────────────

  private renderBaseTiles(): void {
    const td = TILE_SIZE * SCALE;
    for (let row = 0; row < MROWS; row++) {
      for (let col = 0; col < MCOLS; col++) {
        this.add.image(col * td, row * td, 'tile-stone')
          .setOrigin(0, 0).setScale(SCALE).setDepth(0);
      }
    }
  }

  // ── Floor objects (recreated on every floor change) ───────────────────────

  private placeFloorObjects(): void {
    const td = TILE_SIZE * SCALE;

    // Tear down previous floor objects
    for (const obj of this.floorObjects) obj.destroy();
    this.floorObjects = [];
    for (const sprite of this.rockSprites.values()) sprite.destroy();
    this.rockSprites.clear();
    this.mineRocks.clear();

    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.floorObjects.push(o);
      return o;
    };

    // Floor label (top-centre)
    add(this.add.text(MCOLS / 2 * td, 4, `FLOOR  ${this.currentFloor} / ${MAX_FLOOR}`, {
      fontFamily: '"Courier New"', fontSize: '12px', color: '#9badb7',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(20));

    // Ladder UP
    add(this.add.text(
      LADDER_UP_COL * td + td / 2, LADDER_UP_ROW * td + td / 2, '▲',
      { fontFamily: '"Courier New"', fontSize: '22px', color: '#fbf236', stroke: '#000', strokeThickness: 3 },
    ).setOrigin(0.5, 0.5).setDepth(10));
    add(this.add.text(
      LADDER_UP_COL * td + td / 2, (LADDER_UP_ROW + 1) * td,
      this.currentFloor === 1 ? '← EXIT' : '← UP',
      { fontFamily: '"Courier New"', fontSize: '9px', color: '#9badb7', stroke: '#000', strokeThickness: 2 },
    ).setOrigin(0.5, 0).setDepth(10));

    // Ladder DOWN (only floors 1-4)
    if (this.currentFloor < MAX_FLOOR) {
      add(this.add.text(
        LADDER_DOWN_COL * td + td / 2, LADDER_DOWN_ROW * td + td / 2, '▼',
        { fontFamily: '"Courier New"', fontSize: '22px', color: '#fbf236', stroke: '#000', strokeThickness: 3 },
      ).setOrigin(0.5, 0.5).setDepth(10));
      add(this.add.text(
        LADDER_DOWN_COL * td + td / 2, (LADDER_DOWN_ROW + 1) * td, 'DOWN →',
        { fontFamily: '"Courier New"', fontSize: '9px', color: '#9badb7', stroke: '#000', strokeThickness: 2 },
      ).setOrigin(0.5, 0).setDepth(10));
    }

    // Rock sprites for this floor
    for (const [col, row] of getFloorRocks(this.currentFloor)) {
      const key    = `${col},${row}`;
      this.mineRocks.add(key);
      const sprite = this.add.image(col * td + td / 2, row * td + td / 2, 'mine-rock')
        .setScale(SCALE).setDepth(9);
      this.rockSprites.set(key, sprite);
    }
  }

  // ── Systems ───────────────────────────────────────────────────────────────

  private spawnPlayer(): void {
    this.player = new Player(this, this.entryX, this.entryY);
    this.player.syncPixelPosition();
  }

  private spawnPets(save: SaveFile): void {
    for (const p of save.pets) {
      const pet = new PetEntity(
        this, p.id, p.petType, p.name, p.happiness,
        this.entryX + 1, this.entryY,
      );
      this.pets.push(pet);
    }
  }

  private setupSystems(save: SaveFile): void {
    this.timeSystem = new TimeSystem(save.day, Math.floor(save.totalMinutes / 60));

    this.movement = new MovementSystem((x, y) => this.isTileWalkable(x, y));
    this.movement.bind(this.player);

    this.inventory = new InventorySystem();
    this.inventory.deserialize(save.inventory);

    this.energySystem = new EnergySystem(save.energy);

    this.interaction = new InteractionSystem(this, this.movement, (tileX, tileY) => {
      this.handleTileClick(tileX, tileY);
    });

    this.timeSystem.start();
  }

  private buildUI(): void {
    this.hotBar = new HotBar(this, this.inventory, this.energySystem);
  }

  private setupCamera(): void {
    const td = TILE_SIZE * SCALE;
    this.cameras.main.setBounds(0, 0, MCOLS * td, MROWS * td);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.3);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private launchUI(): void {
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', { timeSystem: this.timeSystem, hideSleepHint: true });
    } else {
      this.scene.get('UIScene').scene.restart({ timeSystem: this.timeSystem, hideSleepHint: true });
    }
  }

  private disableContextMenu(): void {
    this.game.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  // ── Walkability ───────────────────────────────────────────────────────────

  private isTileWalkable(x: number, y: number): boolean {
    // Stone border walls (col/row 0 and MCOLS-1 / MROWS-1)
    if (x <= 0 || y <= 0 || x >= MCOLS - 1 || y >= MROWS - 1) return false;
    if (this.mineRocks.has(`${x},${y}`)) return false;
    return true;
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  private handleTileClick(tileX: number, tileY: number): void {
    // Ladder UP: exit mine or ascend
    if (tileX === LADDER_UP_COL && tileY === LADDER_UP_ROW) {
      if (this.currentFloor === 1) {
        this.transitionToVillage();
      } else {
        this.currentFloor--;
        this.player.tileX = LADDER_DOWN_COL - 1;
        this.player.tileY = LADDER_DOWN_ROW;
        this.player.syncPixelPosition();
        this.movement.stop();
        this.placeFloorObjects();
      }
      return;
    }

    // Ladder DOWN: descend
    if (tileX === LADDER_DOWN_COL && tileY === LADDER_DOWN_ROW && this.currentFloor < MAX_FLOOR) {
      this.currentFloor++;
      this.player.tileX = LADDER_UP_COL + 1;
      this.player.tileY = LADDER_UP_ROW;
      this.player.syncPixelPosition();
      this.movement.stop();
      this.placeFloorObjects();
      return;
    }

    // Mine rock (A* walked player adjacent; callback fires with original rock tile)
    const key = `${tileX},${tileY}`;
    if (this.mineRocks.has(key)) {
      this.mineRock(tileX, tileY);
    }
  }

  private mineRock(col: number, row: number): void {
    const key = `${col},${row}`;
    if (!this.mineRocks.has(key)) return;

    if (this.inventory.selectedItemId !== 'pickaxe') {
      this.showFloatingText(col, row, 'Equip Pickaxe!', 0xff8800);
      return;
    }
    if (!this.energySystem.spend(2)) {
      this.showFloatingText(col, row, 'Too tired!', 0xff4444);
      return;
    }

    // Remove rock
    this.mineRocks.delete(key);
    this.rockSprites.get(key)?.destroy();
    this.rockSprites.delete(key);

    // Loot
    const lootId = getFloorLoot(this.currentFloor);
    this.inventory.addItem(lootId, 1);
    this.hotBar.refresh();

    const labels: Record<string, string>  = { stone: 'Stone', iron_ore: 'Iron', gold_ore: 'Gold!' };
    const colors: Record<string, number>  = { stone: 0x9badb7, iron_ore: 0xdf7126, gold_ore: 0xf7c35e };
    this.showFloatingText(col, row, `+${labels[lootId] ?? lootId}`, colors[lootId] ?? 0xffffff);
  }

  // ── Floating text ─────────────────────────────────────────────────────────

  private showFloatingText(tileX: number, tileY: number, text: string, color: number): void {
    const td     = TILE_SIZE * SCALE;
    const hexStr = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(
      tileX * td + td / 2, tileY * td, text,
      { fontFamily: '"Courier New"', fontSize: '13px', color: hexStr, stroke: '#000', strokeThickness: 3 },
    ).setOrigin(0.5, 1).setDepth(50);
    this.tweens.add({
      targets: t, y: t.y - 32, alpha: 0,
      duration: 900, ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  // ── Transition ────────────────────────────────────────────────────────────

  private transitionToVillage(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.movement.stop();
    this.timeSystem.pause();

    const save = SaveManager.load() ?? defaultSave();
    SaveManager.save({
      ...save,
      inventory:    this.inventory.serialize(),
      energy:       this.energySystem.serialize(),
      totalMinutes: this.timeSystem.minutesElapsed,
      playerTileX:  16,
      playerTileY:  7,
      currentScene: 'VillageScene',
      tutorialStep: this.tutorialSystem.serialize(),
      pets:         this.pets.map(p => ({ id: p.id, petType: p.petType, name: p.name, happiness: p.happiness })),
    });

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('VillageScene', { entryX: 16, entryY: 7 }));
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    this.timeSystem.update(delta);
    this.movement.update(delta);

    for (const pet of this.pets) {
      pet.update(delta, this.player.tileX, this.player.tileY, (x, y) => this.isTileWalkable(x, y));
    }
  }
}
