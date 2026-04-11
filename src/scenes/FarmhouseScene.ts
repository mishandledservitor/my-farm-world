import Phaser from 'phaser';
import { TILE_SIZE, SCALE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { Player } from '../entities/Player';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { EnergySystem } from '../systems/EnergySystem';
import { HotBar } from '../ui/HotBar';
import { SaveManager } from '../save/SaveManager';
import { defaultSave, SaveFile } from '../save/SaveSchema';
import { EventBus } from '../utils/EventBus';
import { AnimalSystem } from '../systems/AnimalSystem';
import { advanceSaveDay } from '../utils/advanceSaveDay';
import { addHoverHighlight } from '../utils/PixelArtUtils';

// Interior is a small 8x6 room
const ICOLS = 8;
const IROWS = 6;

export class FarmhouseScene extends Phaser.Scene {
  private player!: Player;
  private movement!: MovementSystem;
  private interaction!: InteractionSystem;
  private timeSystem!: TimeSystem;
  private inventory!: InventorySystem;
  private energySystem!: EnergySystem;
  private animalSystem!: AnimalSystem;
  private hotBar!: HotBar;
  private sleepingIn = false;
  private transitioning = false;

  // Bound EventBus listeners (stored so they can be removed on shutdown)
  private readonly onMidnight = () => { if (!this.sleepingIn) this.triggerSleep(); };
  private readonly onSaveFlush = () => { SaveManager.save(this.buildSave()); };
  private readonly onSleepEnd = ({ day }: { day: number }) => {
    this.sleepingIn = false;
    this.animalSystem.advanceDay();
    this.energySystem.fullRestore();
    this.timeSystem.advanceDay();
    this.timeSystem.start();
    EventBus.emit('time:new-day', { day });
  };

  constructor() {
    super({ key: 'FarmhouseScene' });
  }

  create(): void {
    const save = SaveManager.load() ?? defaultSave();
    this.sleepingIn = false;
    this.transitioning = false;

    this.renderRoom();
    this.placeObjects();
    this.spawnPlayer(save);
    this.setupSystems(save);
    this.setupCamera();
    this.setupSleepListeners();
    this.launchUI();
    this.disableContextMenu();

    this.events.once('shutdown', () => {
      EventBus.off('time:midnight', this.onMidnight);
      EventBus.off('sleep:end', this.onSleepEnd);
      EventBus.off('save:flush', this.onSaveFlush);
      this.hotBar.destroy();
    });
  }

  private renderRoom(): void {
    const td = TILE_SIZE * SCALE;
    for (let row = 0; row < IROWS; row++) {
      for (let col = 0; col < ICOLS; col++) {
        const isBorder = row === 0 || row === IROWS - 1 || col === 0 || col === ICOLS - 1;
        const key = isBorder ? 'tile-stone' : 'tile-wood-floor';
        this.add.image(col * td, row * td, key).setOrigin(0, 0).setScale(SCALE).setDepth(0);
      }
    }

    // Door marker at bottom center
    const doorCol = Math.floor(ICOLS / 2);
    this.add.image(doorCol * td, (IROWS - 1) * td, 'tile-wood-floor')
      .setOrigin(0, 0).setScale(SCALE).setDepth(0);

    this.add.text(
      doorCol * td + td / 2, (IROWS - 1) * td + td / 2, 'EXIT',
      {
        fontFamily: '"Courier New"', fontSize: '16px', color: '#fbf236',
        stroke: '#000000', strokeThickness: 3,
      },
    ).setOrigin(0.5, 0.5).setDepth(20);
  }

  private placeObjects(): void {
    const td = TILE_SIZE * SCALE;

    // Bed at top-right interior
    const bedX = 6;
    const bedY = 1;
    const bedObject = this.add.image(
      bedX * td + td / 2, bedY * td + td / 2, 'bed',
    ).setScale(SCALE).setDepth(9).setInteractive({ useHandCursor: true });
    bedObject.on('pointerdown', () => this.triggerSleep());
    addHoverHighlight(bedObject);

    this.add.text(
      bedX * td + td / 2, bedY * td - 4, 'BED',
      {
        fontFamily: '"Courier New"', fontSize: '14px', color: '#aaddff',
        stroke: '#000000', strokeThickness: 3,
      },
    ).setOrigin(0.5, 1).setDepth(20);

    // Room label
    this.add.text(
      (ICOLS / 2) * td, 8, 'YOUR FARMHOUSE',
      {
        fontFamily: '"Courier New"', fontSize: '16px', color: '#cbdbfc',
        stroke: '#000000', strokeThickness: 3,
      },
    ).setOrigin(0.5, 0).setDepth(20);
  }

  private spawnPlayer(save: SaveFile | null): void {
    const doorCol = Math.floor(ICOLS / 2);
    this.player = new Player(this, doorCol, IROWS - 2);
    this.player.syncPixelPosition();
  }

  private setupSystems(save: SaveFile | null): void {
    const s = save ?? defaultSave();
    this.timeSystem = new TimeSystem(s.day, Math.floor(s.totalMinutes / 60));

    this.movement = new MovementSystem((x, y) => this.isTileWalkable(x, y));
    this.movement.bind(this.player);

    this.inventory = new InventorySystem();
    this.inventory.deserialize(s.inventory);
    // Deselect slot on enter
    this.inventory.selectSlot(-1);

    this.energySystem = new EnergySystem(s.energy);
    this.animalSystem = new AnimalSystem();
    this.animalSystem.deserialize(s.animals ?? []);
    this.hotBar = new HotBar(this, this.inventory, this.energySystem);

    this.interaction = new InteractionSystem(this, this.movement, (tileX, tileY) => {
      this.handleTileClick(tileX, tileY);
    });
    this.interaction.isBlocked = () => this.sleepingIn || this.transitioning;

    this.timeSystem.start();
  }

  private isTileWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= ICOLS || y >= IROWS) return false;
    // Walls on all edges except the door
    const doorCol = Math.floor(ICOLS / 2);
    if (y === 0) return false;
    if (y === IROWS - 1 && x !== doorCol) return false;
    if (x === 0 || x === ICOLS - 1) return false;
    // Bed blocks
    if (x === 6 && y === 1) return false;
    return true;
  }

  private handleTileClick(tileX: number, tileY: number): void {
    const doorCol = Math.floor(ICOLS / 2);
    if (tileY === IROWS - 1 && tileX === doorCol) {
      this.exitToFarm();
    }
  }

  private exitToFarm(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.movement.stop();
    this.timeSystem.pause();

    const save = SaveManager.load() ?? defaultSave();
    SaveManager.save({
      ...save,
      inventory: this.inventory.serialize(),
      energy: this.energySystem.serialize(),
      totalMinutes: this.timeSystem.minutesElapsed,
      currentScene: 'GameScene',
      playerTileX: 12,
      playerTileY: 9,
    });

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('GameScene'));
    });
  }

  // ── Sleep ──────────────────────────────────────────────────────────────────

  private setupSleepListeners(): void {
    EventBus.on('time:midnight', this.onMidnight);
    EventBus.on('sleep:end', this.onSleepEnd);
    EventBus.on('save:flush', this.onSaveFlush);
  }

  private triggerSleep(): void {
    if (this.sleepingIn) return;
    this.sleepingIn = true;
    this.timeSystem.pause();
    this.movement.stop();

    const nextDay = this.timeSystem.day + 1;
    this.scene.launch('SleepTransitionScene', {
      buildSave: () => this.buildSave(nextDay),
      nextDay,
    });
  }

  private buildSave(day?: number): SaveFile {
    const base = SaveManager.load() ?? defaultSave();
    const save: SaveFile = {
      ...base,
      day: day ?? this.timeSystem.day,
      totalMinutes: this.timeSystem.minutesElapsed,
      inventory: this.inventory.serialize(),
      energy: this.energySystem.serialize(),
      animals: this.animalSystem.serialize(),
      currentScene: 'FarmhouseScene',
    };

    if (day !== undefined) {
      // Sleeping: advance all farm state for the new day before writing to disk.
      // Advance animals in a temporary copy so the on-disk save is consistent.
      const tempAnimals = new AnimalSystem();
      tempAnimals.deserialize(save.animals);
      tempAnimals.advanceDay();
      return advanceSaveDay({ ...save, energy: 100, animals: tempAnimals.serialize() });
    }
    return save;
  }

  // ── Camera & UI ────────────────────────────────────────────────────────────

  private setupCamera(): void {
    const td = TILE_SIZE * SCALE;
    this.cameras.main.setBounds(0, 0, ICOLS * td, IROWS * td);
    this.cameras.main.centerOn((ICOLS * td) / 2, (IROWS * td) / 2);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private launchUI(): void {
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', { timeSystem: this.timeSystem });
    } else {
      this.scene.get('UIScene').scene.restart({ timeSystem: this.timeSystem });
    }
  }

  private disableContextMenu(): void {
    this.game.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  update(_time: number, delta: number): void {
    this.timeSystem.update(delta);
    this.movement.update(delta);
  }
}
