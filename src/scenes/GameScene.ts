import Phaser from 'phaser';
import { TILE_SIZE, SCALE, MAP_COLS, MAP_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { Player } from '../entities/Player';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { EnergySystem } from '../systems/EnergySystem';
import { CropSystem } from '../systems/CropSystem';
import { AnimalSystem } from '../systems/AnimalSystem';
import { ProcessingSystem } from '../systems/ProcessingSystem';
import { TutorialSystem } from '../systems/TutorialSystem';
import { UnlockSystem } from '../systems/UnlockSystem';
import { EventBus } from '../utils/EventBus';
import { SaveManager } from '../save/SaveManager';
import { defaultSave, SaveFile } from '../save/SaveSchema';
import { HotBar } from '../ui/HotBar';
import { AnimalPanel } from '../ui/AnimalPanel';
import { CraftingPanel } from '../ui/CraftingPanel';
import { TutorialPopup } from '../ui/TutorialPopup';
import { CROPS, getCropBySeed } from '../data/crops';
import { getItem } from '../data/items';
import { PetEntity } from '../entities/PetEntity';
import { getSeasonFromDay, seasonLabel } from '../utils/SeasonUtils';
import { addHoverHighlight } from '../utils/PixelArtUtils';
import { WeatherSystem, WeatherType } from '../systems/WeatherSystem';

// ── Tile type IDs ─────────────────────────────────────────────────────────────

export const TILE = {
  GRASS:        0,
  DIRT:         1,
  WATERED_DIRT: 2,
  STONE:        3,
  WATER:        4,
  WOOD_FLOOR:   5,
} as const;

type TileId = typeof TILE[keyof typeof TILE];

const TILE_KEYS: Record<TileId, string> = {
  [TILE.GRASS]:        'tile-grass',
  [TILE.DIRT]:         'tile-dirt',
  [TILE.WATERED_DIRT]: 'tile-watered-dirt',
  [TILE.STONE]:        'tile-stone',
  [TILE.WATER]:        'tile-water',
  [TILE.WOOD_FLOOR]:   'tile-wood-floor',
};

const BLOCKING_TILES = new Set<TileId>([TILE.WATER]);

// ── Scene ─────────────────────────────────────────────────────────────────────

export class GameScene extends Phaser.Scene {
  private tileMap!:    TileId[][];
  private tileImages!: Phaser.GameObjects.Image[][];
  private player!:     Player;
  private movement!:   MovementSystem;
  private interaction!: InteractionSystem;
  private timeSystem!: TimeSystem;

  // Core systems
  private inventory!:        InventorySystem;
  private energySystem!:     EnergySystem;
  private cropSystem!:       CropSystem;
  private animalSystem!:     AnimalSystem;
  private processingSystem!: ProcessingSystem;

  // UI
  private hotBar!:          HotBar;
  private animalPanel:      AnimalPanel | null = null;
  private craftingPanel:    CraftingPanel | null = null;
  private tutorialSystem!:  TutorialSystem;
  private tutorialPopup!:   TutorialPopup;

  // World object refs
  private farmhouseSprite!: Phaser.GameObjects.Image;

  private sleepingIn         = false;
  private transitioning      = false;
  private forestGateDenied   = false;
  private coins = 50;

  private cropSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private pets: PetEntity[] = [];

  // Weather
  private weatherSystem!: WeatherSystem;
  private rainEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  // Sprinklers placed on the farm
  private sprinklers: Set<string> = new Set(); // "x,y" keys
  private sprinklerSprites: Map<string, Phaser.GameObjects.Image> = new Map();

  // Track how many days each tilled tile has been untended (no crop on it)
  private tileUntendedDays: Map<string, number> = new Map();

  // Bound EventBus listeners (stored so they can be removed on shutdown)
  private readonly onMidnight = () => { if (!this.sleepingIn) this.triggerSleep(); };
  private readonly onSleepEnd = ({ day }: { day: number }) => {
    this.sleepingIn = false;
    this.animalSystem.advanceDay();
    this.timeSystem.advanceDay();
    this.timeSystem.start();
    this.tutorialSystem.advanceIfAt('sleep');
    EventBus.emit('time:new-day', { day });
  };
  private readonly onNewDay: (data: { day: number }) => void = ({ day }) => this.handleNewDay(day);
  private readonly onSaveFlush = () => { SaveManager.save(this.buildSave()); };

  // Non-walkable barn/station tiles
  private readonly barnTiles = new Set<string>([
    '3,10','4,10','3,11','4,11','3,12','4,12',  // barn 2×3 footprint
    '5,11',                                      // trough
    '3,13','5,13','7,13','9,13',                   // churn, mill, oven, compost
  ]);

  constructor() {
    super({ key: 'GameScene' });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  create(): void {
    const save = SaveManager.load();
    this.coins        = save?.coins ?? 50;
    this.transitioning = false;
    this.sleepingIn    = false;
    this.animalPanel   = null;
    this.craftingPanel = null;
    this.pets          = [];

    this.buildTileMap();
    this.renderTiles();
    this.placeWorldObjects();
    this.spawnPlayer(save);
    this.setupSystems(save);
    this.spawnPets(save);
    this.setupCamera();
    this.setupSleepListeners();
    this.setupCropListeners();
    this.launchUI();
    this.disableContextMenu();

    // Tutorial — created after all systems exist
    this.tutorialPopup = new TutorialPopup(this, this.tutorialSystem, 'GameScene');
    this.events.once('shutdown', () => {
      EventBus.off('time:midnight', this.onMidnight);
      EventBus.off('sleep:end', this.onSleepEnd);
      EventBus.off('time:new-day', this.onNewDay);
      EventBus.off('save:flush', this.onSaveFlush);
      this.tutorialPopup.destroy();
      this.hotBar.destroy();
      this.rainEmitter?.destroy();
      this.rainEmitter = null;
    });

    // Initialize rain visuals if currently raining
    this.updateRainEffect();
  }

  // ── Map setup ──────────────────────────────────────────────────────────────

  private buildTileMap(): void {
    this.tileMap = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      this.tileMap[row] = [];
      for (let col = 0; col < MAP_COLS; col++) {
        const isBorder = row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1;
        this.tileMap[row][col] = isBorder ? TILE.STONE : TILE.GRASS;
      }
    }

    // North–south path (col 14-15): runs from row 1 all the way to the village gate
    for (let row = 1; row < MAP_ROWS - 1; row++) {
      this.tileMap[row][14] = TILE.STONE;
      this.tileMap[row][15] = TILE.STONE;
    }

    // Farm plot (tilled dirt) — 6 cols × 4 rows
    for (let row = 12; row <= 15; row++) {
      for (let col = 18; col <= 23; col++) {
        this.tileMap[row][col] = TILE.DIRT;
      }
    }

    // Small pond
    for (let row = 18; row <= 20; row++) {
      for (let col = 3; col <= 6; col++) {
        this.tileMap[row][col] = TILE.WATER;
      }
    }

    // Village gate path (right side, rows 9-12)
    for (let row = 9; row <= 12; row++) {
      for (let col = 25; col <= 28; col++) {
        this.tileMap[row][col] = TILE.STONE;
      }
    }
  }

  private renderTiles(): void {
    const td = TILE_SIZE * SCALE;
    this.tileImages = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      this.tileImages[row] = [];
      for (let col = 0; col < MAP_COLS; col++) {
        const img = this.add.image(col * td, row * td, TILE_KEYS[this.tileMap[row][col]]);
        img.setOrigin(0, 0).setScale(SCALE).setDepth(0);
        this.tileImages[row][col] = img;
      }
    }
  }

  // ── World objects ──────────────────────────────────────────────────────────

  private placeWorldObjects(): void {
    const td = TILE_SIZE * SCALE;

    // Farmhouse at tile (12, 6) — displayed bigger (3 tiles wide)
    this.farmhouseSprite = this.add.image(
      12 * td + td / 2, 6 * td + td, 'farmhouse',
    ).setScale(SCALE * 2.5).setDepth(10).setInteractive({ useHandCursor: true });
    this.farmhouseSprite.on('pointerdown', () => this.enterFarmhouse());
    addHoverHighlight(this.farmhouseSprite);

    // Door label
    this.add.text(
      12 * td + td / 2, 8 * td + td / 2 + 4, 'ENTER HOUSE',
      { fontFamily: '"Courier New"', fontSize: '14px', color: '#fbf236', stroke: '#000', strokeThickness: 3 },
    ).setOrigin(0.5, 0).setDepth(20);

    // Trees
    const treePositions = [
      { col: 3, row: 3 }, { col: 5, row: 2 }, { col: 7, row: 4 },
      { col: 2, row: 6 }, { col: 4, row: 8 }, { col: 6, row: 6 },
      { col: 25, row: 3 }, { col: 27, row: 2 }, { col: 28, row: 5 },
    ];
    treePositions.forEach(({ col, row }) => {
      const x = col * td + td / 2;
      this.add.image(x, row * td + td / 2, 'tree-trunk').setScale(SCALE).setDepth(9);
      this.add.image(x, (row - 1) * td + td / 2, 'tree-top').setScale(SCALE).setDepth(10);
    });

    // Village gate sign
    this.add.text(
      28 * td + td / 2, 8 * td + td / 2, 'VILLAGE →',
      { fontFamily: '"Courier New"', fontSize: '16px', color: '#fbf236', stroke: '#000', strokeThickness: 3 },
    ).setOrigin(0.5, 0.5).setDepth(20);

    // Forest gate sign (north end of path, cols 14-15, row 1)
    this.add.text(
      14 * td + td, 1 * td + td / 2, 'FOREST ↑',
      { fontFamily: '"Courier New"', fontSize: '16px', color: '#99e550', stroke: '#000', strokeThickness: 3 },
    ).setOrigin(0.5, 0.5).setDepth(20);

    // Fence posts around farm plot
    const fencePositions: Array<{ col: number; row: number }> = [];
    for (let col = 17; col <= 24; col++) {
      fencePositions.push({ col, row: 11 });
      fencePositions.push({ col, row: 16 });
    }
    for (let row = 11; row <= 16; row++) {
      fencePositions.push({ col: 17, row });
      fencePositions.push({ col: 24, row });
    }
    fencePositions.forEach(({ col, row }) => {
      this.add.image(col * td + td / 2, row * td + td / 2, 'fence-post').setScale(SCALE).setDepth(8);
    });

    // ── Barn (tile 4, 11 visual center, 2×3 footprint cols 3-4 rows 10-12) ────
    const barnX = 4 * td + td / 2;
    const barnY = 11 * td + td / 2;
    const barnImg = this.add.image(barnX, barnY, 'barn')
      .setScale(SCALE).setDepth(11).setInteractive({ useHandCursor: true });
    barnImg.on('pointerdown', () => this.openAnimalPanel());
    addHoverHighlight(barnImg);

    this.add.text(barnX, barnY - td, 'THE BARN', {
      fontFamily: '"Courier New"', fontSize: '16px', color: '#cbdbfc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

    // Feed trough (tile 5, 11)
    const troughImg = this.add.image(5 * td + td / 2, 11 * td + td / 2, 'trough')
      .setScale(SCALE).setDepth(9).setInteractive({ useHandCursor: true });
    troughImg.on('pointerdown', () => this.openAnimalPanel());
    addHoverHighlight(troughImg);

    // ── Processing stations ────────────────────────────────────────────────────
    const stations: Array<{ key: string; type: string; col: number; row: number; label: string }> = [
      { key: 'churn',   type: 'churn',   col: 3, row: 13, label: 'CHURN'   },
      { key: 'mill',    type: 'mill',    col: 5, row: 13, label: 'MILL'    },
      { key: 'oven',    type: 'oven',    col: 7, row: 13, label: 'OVEN'    },
      { key: 'compost', type: 'compost', col: 9, row: 13, label: 'COMPOST' },
    ];

    for (const s of stations) {
      const sx = s.col * td + td / 2;
      const sy = s.row * td + td / 2;
      const sType = s.type;

      const stImg = this.add.image(sx, sy, s.key).setScale(SCALE).setDepth(9)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.openCraftingPanel(sType));
      addHoverHighlight(stImg as Phaser.GameObjects.Image);

      this.add.text(sx, sy + td / 2 + 2, s.label, {
        fontFamily: '"Courier New"', fontSize: '14px', color: '#cbdbfc',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 0).setDepth(20);
    }
  }

  // ── Player & systems ───────────────────────────────────────────────────────

  private spawnPlayer(save: SaveFile | null): void {
    const tx = save?.playerTileX ?? 14;
    const ty = save?.playerTileY ?? 11;
    this.player = new Player(this, tx, ty);
    this.player.syncPixelPosition();
  }

  private spawnPets(save: SaveFile | null): void {
    for (const p of (save?.pets ?? [])) {
      const startX = (save?.playerTileX ?? 14) + 1;
      const startY = save?.playerTileY ?? 11;
      this.pets.push(new PetEntity(this, p.id, p.petType, p.name, p.happiness, startX, startY));
    }
  }

  private setupSystems(save: SaveFile | null): void {
    const day  = save?.day ?? 1;
    const mins = save?.totalMinutes ?? 6 * 60;
    this.timeSystem = new TimeSystem(day, Math.floor(mins / 60));

    this.movement = new MovementSystem((x, y) => this.isTileWalkable(x, y));
    this.movement.bind(this.player);

    this.inventory = new InventorySystem();
    this.inventory.deserialize(save?.inventory ?? []);
    this.inventory.deselectAll();

    this.energySystem = new EnergySystem(save?.energy ?? 100);

    this.cropSystem = new CropSystem();
    this.cropSystem.deserialize(save?.crops ?? []);

    // Animal system
    this.animalSystem = new AnimalSystem();
    this.animalSystem.deserialize(save?.animals ?? defaultSave().animals);

    // Processing system
    this.processingSystem = new ProcessingSystem();
    this.processingSystem.deserialize(save?.processingQueues ?? []);

    // Weather
    this.weatherSystem = new WeatherSystem(
      (save?.weather as WeatherType) || undefined,
    );

    // Tutorial
    this.tutorialSystem = new TutorialSystem(save?.tutorialStep ?? 0);

    // Restore tile overrides (tilled/watered soil)
    for (const override of (save?.tileOverrides ?? [])) {
      this.setTile(override.tileX, override.tileY, override.tileId as TileId);
    }

    // Restore untended days tracker
    this.tileUntendedDays.clear();
    for (const u of (save?.tileUntendedDays ?? [])) {
      this.tileUntendedDays.set(`${u.tileX},${u.tileY}`, u.days);
    }

    // Restore sprinklers
    this.sprinklers.clear();
    for (const sp of (save?.sprinklers ?? [])) {
      this.sprinklers.add(`${sp.tileX},${sp.tileY}`);
      this.spawnSprinklerSprite(sp.tileX, sp.tileY);
    }

    // Rebuild saved crop sprites
    for (const crop of this.cropSystem.getAllCrops()) {
      this.spawnCropSprite(crop.tileX, crop.tileY, crop.cropType, crop.growthStage);
    }

    // HotBar
    this.hotBar = new HotBar(this, this.inventory, this.energySystem);

    // InteractionSystem
    this.interaction = new InteractionSystem(this, this.movement, (tileX, tileY) => {
      this.handleTileClick(tileX, tileY);
    });
    this.interaction.isBlocked = () =>
      this.sleepingIn || this.transitioning ||
      !!(this.animalPanel?.isVisible()) || !!(this.craftingPanel?.isVisible()) ||
      this.hotBar.isInventoryOpen();

    this.timeSystem.start();
  }

  // ── Interaction ────────────────────────────────────────────────────────────

  private handleTileClick(tileX: number, tileY: number): void {
    if (this.animalPanel?.isVisible() || this.craftingPanel?.isVisible()) return;

    // Harvest takes priority over tools
    if (this.cropSystem.isReadyToHarvest(tileX, tileY)) {
      this.harvestCrop(tileX, tileY);
      return;
    }

    const selectedId = this.inventory.selectedItemId;
    if (!selectedId) return;

    const item   = getItem(selectedId);
    const tileId = this.tileMap[tileY]?.[tileX];

    if (item.category === 'tool') {
      this.useTool(selectedId, tileX, tileY, tileId);
    } else if (item.category === 'seed') {
      this.plantSeed(selectedId, tileX, tileY, tileId);
    } else if (selectedId === 'sprinkler') {
      this.placeSprinkler(tileX, tileY, tileId);
    } else if (selectedId === 'fertilizer') {
      this.applyFertilizer(tileX, tileY);
    }

    // Fishing: click on water with fishing rod
    if (selectedId === 'fishing_rod' && tileId === TILE.WATER) {
      this.tryFishing(tileX, tileY);
    }
  }

  private useTool(toolId: string, tileX: number, tileY: number, tileId: number): void {
    if (toolId === 'hoe') {
      if (tileId !== TILE.GRASS) return;
      if (!this.energySystem.spend(2)) { this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444); return; }
      this.setTile(tileX, tileY, TILE.DIRT);
      this.showFloatingText(tileX, tileY, '+Till', 0xc8956b);
      this.tutorialSystem.advanceIfAt('hoe');
    } else if (toolId === 'watering_can') {
      if (tileId === TILE.DIRT) {
        if (!this.energySystem.spend(1)) { this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444); return; }
        this.setTile(tileX, tileY, TILE.WATERED_DIRT);
        this.cropSystem.water(tileX, tileY);
        this.showFloatingText(tileX, tileY, '\u{1F4A7}', 0x5fcde4);
        this.tutorialSystem.advanceIfAt('water');
      } else if (tileId === TILE.WATERED_DIRT || this.cropSystem.isOccupied(tileX, tileY)) {
        if (!this.energySystem.spend(1)) { this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444); return; }
        this.cropSystem.water(tileX, tileY);
        this.showFloatingText(tileX, tileY, '\u{1F4A7}', 0x5fcde4);
        this.tutorialSystem.advanceIfAt('water');
      }
    }
    this.hotBar.refresh();
  }

  private plantSeed(seedId: string, tileX: number, tileY: number, tileId: number): void {
    if (tileId !== TILE.DIRT && tileId !== TILE.WATERED_DIRT) return;
    if (this.cropSystem.isOccupied(tileX, tileY)) return;

    const cropDef = getCropBySeed(seedId);
    if (!cropDef) return;

    // Season check
    const currentSeason = getSeasonFromDay(this.timeSystem.day);
    if (!CropSystem.canPlantInSeason(seedId, currentSeason)) {
      const label = cropDef.season !== 'any'
        ? `${seasonLabel(cropDef.season)} only!`
        : 'Wrong season!';
      this.showFloatingText(tileX, tileY, label, 0xff8800);
      return;
    }

    if (!this.energySystem.spend(cropDef.energyCost)) {
      this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444);
      return;
    }

    this.inventory.removeItem(seedId, 1);
    this.cropSystem.plant(tileX, tileY, seedId);
    this.spawnCropSprite(tileX, tileY, cropDef.id, 0);
    this.hotBar.refresh();
    this.showFloatingText(tileX, tileY, 'Planted!', 0x99e550);
    this.tutorialSystem.advanceIfAt('plant');
  }

  private harvestCrop(tileX: number, tileY: number): void {
    if (!this.cropSystem.isReadyToHarvest(tileX, tileY)) return;
    const harvestId = this.cropSystem.harvest(tileX, tileY);
    if (!harvestId) return;

    const crop = this.cropSystem.getCrop(tileX, tileY);
    if (!crop) {
      this.destroyCropSprite(tileX, tileY);
    } else {
      this.updateCropSprite(tileX, tileY, crop.cropType, crop.growthStage);
    }

    this.inventory.addItem(harvestId, 1);
    this.showFloatingText(tileX, tileY, `+${harvestId.charAt(0).toUpperCase() + harvestId.slice(1)}`, 0x99e550);
    this.hotBar.refresh();
    this.tutorialSystem.advanceIfAt('harvest');
  }

  // ── Panel helpers ──────────────────────────────────────────────────────────

  openAnimalPanel(): void {
    if (this.sleepingIn || this.craftingPanel?.isVisible()) return;
    if (this.animalPanel?.isVisible()) { this.animalPanel.close(); return; }
    this.animalPanel = new AnimalPanel(this, this.animalSystem, this.inventory);
    this.animalPanel.open();
  }

  openCraftingPanel(stationType: string): void {
    if (this.sleepingIn || this.animalPanel?.isVisible()) return;
    // If same station re-clicked, toggle closed
    if (this.craftingPanel?.isVisible()) { this.craftingPanel.close(); this.craftingPanel = null; }
    this.craftingPanel = new CraftingPanel(
      this, this.processingSystem, this.inventory, stationType,
      () => this.getAbsoluteMinutes(),
    );
    this.craftingPanel.open();
  }

  // ── Crop listener ──────────────────────────────────────────────────────────

  private setupCropListeners(): void {
    EventBus.on('time:new-day', this.onNewDay);
  }

  private handleNewDay(day: number): void {
    const currentSeason = getSeasonFromDay(day);
    // Advance crops without withering (pass undefined to skip season check)
    this.cropSystem.advanceDay(undefined);

    for (const crop of this.cropSystem.getAllCrops()) {
      this.updateCropSprite(crop.tileX, crop.tileY, crop.cropType, crop.growthStage);
    }
    this.energySystem.fullRestore();

    // Roll new weather for the day
    this.weatherSystem.advanceDay();
    this.updateRainEffect();

    // Dry out watered tiles: watered_dirt → dirt
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (this.tileMap[row][col] === TILE.WATERED_DIRT) {
          this.setTile(col, row, TILE.DIRT);
        }
      }
    }

    // Rain auto-waters all tilled soil and crops
    if (this.weatherSystem.isRainy) {
      for (let row = 0; row < MAP_ROWS; row++) {
        for (let col = 0; col < MAP_COLS; col++) {
          if (this.tileMap[row][col] === TILE.DIRT) {
            this.setTile(col, row, TILE.WATERED_DIRT);
            this.cropSystem.water(col, row);
          }
        }
      }
    }

    // Sprinkler auto-watering: each sprinkler waters the 4 cardinal tiles
    for (const key of this.sprinklers) {
      const [sx, sy] = key.split(',').map(Number);
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = sx + dx;
        const ny = sy + dy;
        if (nx >= 0 && ny >= 0 && nx < MAP_COLS && ny < MAP_ROWS) {
          if (this.tileMap[ny][nx] === TILE.DIRT) {
            this.setTile(nx, ny, TILE.WATERED_DIRT);
            this.cropSystem.water(nx, ny);
          }
        }
      }
    }

    // Track untended tilled tiles and revert to grass after 3 days
    const occupiedTiles = new Set(
      this.cropSystem.getAllCrops().map(c => `${c.tileX},${c.tileY}`),
    );

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const key = `${col},${row}`;
        if (this.tileMap[row][col] === TILE.DIRT && !occupiedTiles.has(key)) {
          const days = (this.tileUntendedDays.get(key) ?? 0) + 1;
          if (days >= 3) {
            this.setTile(col, row, TILE.GRASS);
            this.tileUntendedDays.delete(key);
          } else {
            this.tileUntendedDays.set(key, days);
          }
        } else {
          // If tile has a crop or is no longer dirt, reset counter
          this.tileUntendedDays.delete(key);
        }
      }
    }

    // Dog bonus: alert when crops are harvest-ready
    const hasDog = this.pets.some(p => p.petType === 'dog');
    if (hasDog) {
      const readyCount = this.cropSystem.getAllCrops().filter(c => c.growthStage >= 3).length;
      if (readyCount > 0) {
        this.showFloatingText(
          this.player.tileX, this.player.tileY,
          `Dog: ${readyCount} crop${readyCount > 1 ? 's' : ''} ready!`,
          0x99e550,
        );
      }
    }

    // Auto-save so the fully advanced state survives a reload
    SaveManager.save(this.buildSave());
  }

  // ── Crop sprites ───────────────────────────────────────────────────────────

  private cropSpriteKey(x: number, y: number): string { return `${x},${y}`; }

  private spawnCropSprite(tileX: number, tileY: number, cropType: string, stage: number): void {
    this.destroyCropSprite(tileX, tileY);
    const def = CROPS[cropType];
    const maxSprite = def ? def.stages - 1 : stage;
    const clamped = Math.min(stage, maxSprite);
    const td  = TILE_SIZE * SCALE;
    const img = this.add.image(
      tileX * td + td / 2, tileY * td + td / 2, `crop-${cropType}-${clamped}`,
    ).setScale(SCALE).setDepth(15);
    this.cropSprites.set(this.cropSpriteKey(tileX, tileY), img);
  }

  private updateCropSprite(tileX: number, tileY: number, cropType: string, stage: number): void {
    const def = CROPS[cropType];
    const maxSprite = def ? def.stages - 1 : stage;
    const clamped = Math.min(stage, maxSprite);
    const img = this.cropSprites.get(this.cropSpriteKey(tileX, tileY));
    if (img) {
      img.setTexture(`crop-${cropType}-${clamped}`);
    } else {
      this.spawnCropSprite(tileX, tileY, cropType, clamped);
    }
  }

  private destroyCropSprite(tileX: number, tileY: number): void {
    const key = this.cropSpriteKey(tileX, tileY);
    this.cropSprites.get(key)?.destroy();
    this.cropSprites.delete(key);
  }

  // ── Tile mutation ──────────────────────────────────────────────────────────

  setTile(tileX: number, tileY: number, tileId: TileId): void {
    if (tileX < 0 || tileY < 0 || tileX >= MAP_COLS || tileY >= MAP_ROWS) return;
    this.tileMap[tileY][tileX] = tileId;
    this.tileImages[tileY][tileX].setTexture(TILE_KEYS[tileId]);
  }

  // ── Floating text ──────────────────────────────────────────────────────────

  private showFloatingText(tileX: number, tileY: number, text: string, color: number): void {
    const td    = TILE_SIZE * SCALE;
    const hexStr = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(
      tileX * td + td / 2, tileY * td, text,
      { fontFamily: '"Courier New"', fontSize: '18px', color: hexStr, stroke: '#000', strokeThickness: 3 },
    ).setOrigin(0.5, 1).setDepth(50);
    this.tweens.add({
      targets: t, y: t.y - 32, alpha: 0,
      duration: 900, ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  // ── Fishing ────────────────────────────────────────────────────────────────

  private tryFishing(tileX: number, tileY: number): void {
    if (!this.energySystem.spend(2)) {
      this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444);
      return;
    }
    // Random chance: 70% fish, 30% nothing
    const caught = Math.random() < 0.7;
    if (caught) {
      this.inventory.addItem('fish', 1);
      this.showFloatingText(tileX, tileY, '+Fish!', 0x5fcde4);
      this.hotBar.refresh();
    } else {
      this.showFloatingText(tileX, tileY, 'Nothing biting...', 0x9badb7);
    }
  }

  // ── Sprinkler placement ────────────────────────────────────────────────

  private placeSprinkler(tileX: number, tileY: number, tileId: number): void {
    // Can only place on grass or dirt tiles
    if (tileId !== TILE.GRASS && tileId !== TILE.DIRT && tileId !== TILE.WATERED_DIRT) {
      this.showFloatingText(tileX, tileY, 'Can\'t place here', 0xff4444);
      return;
    }
    const key = `${tileX},${tileY}`;
    if (this.sprinklers.has(key)) {
      this.showFloatingText(tileX, tileY, 'Already placed', 0xff8800);
      return;
    }
    if (this.cropSystem.isOccupied(tileX, tileY)) {
      this.showFloatingText(tileX, tileY, 'Tile occupied', 0xff4444);
      return;
    }

    this.inventory.consumeSelectedItem();
    this.sprinklers.add(key);
    this.spawnSprinklerSprite(tileX, tileY);
    this.showFloatingText(tileX, tileY, '+Sprinkler', 0x5fcde4);
    this.hotBar.refresh();
  }

  private spawnSprinklerSprite(tileX: number, tileY: number): void {
    const td = TILE_SIZE * SCALE;
    const img = this.add.image(
      tileX * td + td / 2, tileY * td + td / 2, 'sprinkler',
    ).setScale(SCALE).setDepth(12);
    this.sprinklerSprites.set(`${tileX},${tileY}`, img);
  }

  // ── Fertilizer ────────────────────────────────────────────────────────

  private applyFertilizer(tileX: number, tileY: number): void {
    const crop = this.cropSystem.getCrop(tileX, tileY);
    if (!crop) {
      this.showFloatingText(tileX, tileY, 'No crop here', 0xff8800);
      return;
    }
    const boosted = this.cropSystem.boostGrowth(tileX, tileY);
    if (!boosted) {
      this.showFloatingText(tileX, tileY, 'Already mature', 0xff8800);
      return;
    }
    this.inventory.consumeSelectedItem();
    this.updateCropSprite(tileX, tileY, crop.cropType, crop.growthStage + 1);
    this.showFloatingText(tileX, tileY, '+Growth!', 0x99e550);
    this.hotBar.refresh();
  }

  // ── Rain effect ───────────────────────────────────────────────────────

  private updateRainEffect(): void {
    if (this.weatherSystem.isRainy) {
      if (!this.rainEmitter) {
        // Create a small blue pixel texture for rain if it doesn't exist
        if (!this.textures.exists('rain-drop')) {
          const g = this.make.graphics({ x: 0, y: 0 });
          g.setVisible(false);
          g.fillStyle(0x5fcde4, 0.6);
          g.fillRect(0, 0, 2, 6);
          g.generateTexture('rain-drop', 2, 6);
          g.destroy();
        }
        const particles = this.add.particles(0, 0, 'rain-drop', {
          x: { min: 0, max: MAP_COLS * TILE_SIZE * SCALE },
          y: -10,
          lifespan: 800,
          speedY: { min: 300, max: 500 },
          speedX: { min: -20, max: -50 },
          scale: { start: 1, end: 0.5 },
          alpha: { start: 0.5, end: 0.1 },
          frequency: 15,
          quantity: 3,
        });
        particles.setDepth(45);
        this.rainEmitter = particles;
      }
    } else {
      if (this.rainEmitter) {
        this.rainEmitter.destroy();
        this.rainEmitter = null;
      }
    }
  }

  // ── Sleep ──────────────────────────────────────────────────────────────────

  private setupSleepListeners(): void {
    EventBus.on('time:midnight', this.onMidnight);
    EventBus.on('sleep:end', this.onSleepEnd);
    EventBus.on('save:flush', this.onSaveFlush);
  }

  triggerSleep(): void {
    if (this.sleepingIn) return;
    this.animalPanel?.close();
    this.craftingPanel?.close();
    this.sleepingIn = true;
    this.timeSystem.pause();
    this.movement.stop();

    const nextDay = this.timeSystem.day + 1;
    this.scene.launch('SleepTransitionScene', {
      buildSave: () => this.buildSave(nextDay),
      nextDay,
    });
  }

  private enterFarmhouse(): void {
    if (this.transitioning || this.sleepingIn) return;
    this.transitioning = true;
    this.animalPanel?.close();
    this.craftingPanel?.close();
    this.movement.stop();
    this.timeSystem.pause();
    SaveManager.save(this.buildSave());

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('FarmhouseScene'));
    });
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  buildSave(day?: number): SaveFile {
    const base = SaveManager.load() ?? defaultSave();

    const tileOverrides: Array<{ tileX: number; tileY: number; tileId: number }> = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const id = this.tileMap[row][col];
        if (id === TILE.DIRT || id === TILE.WATERED_DIRT) {
          tileOverrides.push({ tileX: col, tileY: row, tileId: id });
        }
      }
    }

    const tileUntendedDays = Array.from(this.tileUntendedDays.entries()).map(([key, days]) => {
      const [x, y] = key.split(',').map(Number);
      return { tileX: x, tileY: y, days };
    });

    return {
      ...base,
      day:              day ?? this.timeSystem.day,
      totalMinutes:     this.timeSystem.minutesElapsed,
      coins:            this.coins,
      playerTileX:      this.player.tileX,
      playerTileY:      this.player.tileY,
      currentScene:     'GameScene',
      inventory:        this.inventory.serialize(),
      crops:            this.cropSystem.serialize(),
      energy:           this.energySystem.serialize(),
      animals:          this.animalSystem.serialize(),
      pets:             this.pets.map(p => ({ id: p.id, petType: p.petType, name: p.name, happiness: p.happiness })),
      processingQueues: this.processingSystem.serialize(),
      tutorialStep:     this.tutorialSystem.serialize(),
      tileOverrides,
      tileUntendedDays,
      weather: this.weatherSystem.serialize(),
      sprinklers: Array.from(this.sprinklers).map(k => {
        const [x, y] = k.split(',').map(Number);
        return { tileX: x, tileY: y };
      }),
    };
  }

  // ── Walkability ────────────────────────────────────────────────────────────

  private isTileWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= MAP_COLS || y >= MAP_ROWS) return false;
    if (BLOCKING_TILES.has(this.tileMap[y][x])) return false;
    // Farmhouse area (wider for bigger house) — leave row 9 col 12 open as door approach
    if (x >= 10 && x <= 14 && y >= 4 && y <= 8) return false;
    // Barn, trough, and station tiles
    if (this.barnTiles.has(`${x},${y}`)) return false;
    // Sprinklers block movement
    if (this.sprinklers.has(`${x},${y}`)) return false;
    return true;
  }

  // ── Camera & UI ────────────────────────────────────────────────────────────

  private setupCamera(): void {
    const td = TILE_SIZE * SCALE;
    this.cameras.main.setBounds(0, 0, MAP_COLS * td, MAP_ROWS * td);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(CANVAS_WIDTH * 0.25, CANVAS_HEIGHT * 0.25);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private launchUI(): void {
    const uiData = { timeSystem: this.timeSystem, weather: this.weatherSystem.weather };
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', uiData);
    } else {
      this.scene.get('UIScene').scene.restart(uiData);
    }
  }

  private disableContextMenu(): void {
    this.game.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Absolute game-minute across all days; used by ProcessingSystem. */
  getAbsoluteMinutes(): number {
    return (this.timeSystem.day - 1) * 1440 + this.timeSystem.minutesElapsed;
  }

  getTimeSystem(): TimeSystem { return this.timeSystem; }
  getPlayer():     Player     { return this.player; }

  // ── Forest transition ──────────────────────────────────────────────────────

  private triggerForestTransition(): void {
    if (this.transitioning) return;

    const save = SaveManager.load();
    if (!save || !UnlockSystem.isForestUnlocked(save)) {
      if (!this.forestGateDenied) {
        this.forestGateDenied = true;
        this.showFloatingText(14, 0, 'Day 7 + Axe needed', 0xff8800);
        // Push player back south one tile and reset cooldown
        this.movement.moveTo(14, 2);
        this.time.delayedCall(1800, () => { this.forestGateDenied = false; });
      }
      return;
    }

    this.transitioning = true;
    this.animalPanel?.close();
    this.craftingPanel?.close();
    this.movement.stop();
    this.timeSystem.pause();
    SaveManager.save(this.buildSave());

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('ForestScene', { entryX: 9, entryY: 13 }));
    });
  }

  // ── Village transition ─────────────────────────────────────────────────────

  private triggerVillageTransition(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.animalPanel?.close();
    this.craftingPanel?.close();
    this.tutorialSystem.advanceIfAt('village');
    this.movement.stop();
    this.timeSystem.pause();
    SaveManager.save(this.buildSave());

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('VillageScene', { entryX: 1, entryY: 7 }));
    });
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    this.timeSystem.update(delta);
    this.movement.update(delta);

    for (const pet of this.pets) {
      pet.update(delta, this.player.tileX, this.player.tileY, (x, y) => this.isTileWalkable(x, y));
    }

    const idle = !this.transitioning && !this.sleepingIn &&
                 !this.animalPanel?.isVisible() && !this.craftingPanel?.isVisible();

    // Village gate (east border, rows 9-12)
    if (idle && this.player.tileX >= 28 && this.player.tileY >= 9 && this.player.tileY <= 12) {
      this.triggerVillageTransition();
    }

    // Forest gate (north border, cols 13-16)
    if (idle && this.player.tileY <= 0 && this.player.tileX >= 13 && this.player.tileX <= 16) {
      this.triggerForestTransition();
    }
  }
}
