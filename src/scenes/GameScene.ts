import Phaser from 'phaser';
import { TILE_SIZE, SCALE, MAP_COLS, MAP_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { Player } from '../entities/Player';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { EnergySystem } from '../systems/EnergySystem';
import { CropSystem } from '../systems/CropSystem';
import { EventBus } from '../utils/EventBus';
import { SaveManager } from '../save/SaveManager';
import { defaultSave, SaveFile } from '../save/SaveSchema';
import { HotBar } from '../ui/HotBar';
import { getCropBySeed } from '../data/crops';
import { getItem } from '../data/items';

// Tile type IDs used in the map grid
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

// Tiles the player cannot walk onto
const BLOCKING_TILES = new Set<TileId>([TILE.WATER]);

export class GameScene extends Phaser.Scene {
  private tileMap!: TileId[][];
  private tileImages!: Phaser.GameObjects.Image[][];
  private player!: Player;
  private movement!: MovementSystem;
  private interaction!: InteractionSystem;
  private timeSystem!: TimeSystem;

  // Core systems
  private inventory!: InventorySystem;
  private energySystem!: EnergySystem;
  private cropSystem!: CropSystem;
  private hotBar!: HotBar;

  // World objects
  private farmhouseSprite!: Phaser.GameObjects.Image;
  private bedObject!: Phaser.GameObjects.Image;
  private sleepingIn = false;
  private cropSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private coins = 50;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const save = SaveManager.load();
    this.coins = save?.coins ?? 50;
    this.buildTileMap();
    this.renderTiles();
    this.placeWorldObjects();
    this.spawnPlayer(save);
    this.setupSystems(save);
    this.setupCamera();
    this.setupSleepListeners();
    this.setupCropListeners();
    this.launchUI();
    this.disableContextMenu();
  }

  // ── Map setup ──────────────────────────────────────────────────────────────

  private buildTileMap(): void {
    this.tileMap = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      this.tileMap[row] = [];
      for (let col = 0; col < MAP_COLS; col++) {
        // Border ring of stone path, rest is grass
        // Farm plot area (rows 8-18, cols 8-22) has some dirt patches
        const isBorder = row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1;
        this.tileMap[row][col] = isBorder ? TILE.STONE : TILE.GRASS;
      }
    }

    // Stone path from house to south border
    for (let row = 10; row < MAP_ROWS - 1; row++) {
      this.tileMap[row][14] = TILE.STONE;
      this.tileMap[row][15] = TILE.STONE;
    }

    // Farm plot (tilled dirt) — 6 cols × 4 rows
    for (let row = 12; row <= 15; row++) {
      for (let col = 18; col <= 23; col++) {
        this.tileMap[row][col] = TILE.DIRT;
      }
    }

    // Small pond in bottom-left area
    for (let row = 18; row <= 20; row++) {
      for (let col = 3; col <= 6; col++) {
        this.tileMap[row][col] = TILE.WATER;
      }
    }
  }

  private renderTiles(): void {
    const tileDisplay = TILE_SIZE * SCALE;
    this.tileImages = [];

    for (let row = 0; row < MAP_ROWS; row++) {
      this.tileImages[row] = [];
      for (let col = 0; col < MAP_COLS; col++) {
        const tileId = this.tileMap[row][col];
        const key = TILE_KEYS[tileId];
        const x = col * tileDisplay;
        const y = row * tileDisplay;

        const img = this.add.image(x, y, key);
        img.setOrigin(0, 0);
        img.setScale(SCALE);
        img.setDepth(0);
        this.tileImages[row][col] = img;
      }
    }
  }

  private placeWorldObjects(): void {
    const tileDisplay = TILE_SIZE * SCALE;

    // Farmhouse at tile (12, 6)
    this.farmhouseSprite = this.add.image(
      12 * tileDisplay + tileDisplay / 2,
      6 * tileDisplay + tileDisplay / 2,
      'farmhouse',
    );
    this.farmhouseSprite.setScale(SCALE);
    this.farmhouseSprite.setDepth(10);
    this.farmhouseSprite.setOrigin(0.5, 0.5);

    // Bed inside the farmhouse (tile 12, 8) — clickable to sleep
    this.bedObject = this.add.image(
      12 * tileDisplay + tileDisplay / 2,
      8 * tileDisplay + tileDisplay / 2,
      'bed',
    );
    this.bedObject.setScale(SCALE);
    this.bedObject.setDepth(9);
    this.bedObject.setOrigin(0.5, 0.5);
    this.bedObject.setInteractive({ useHandCursor: true });
    this.bedObject.on('pointerdown', () => this.triggerSleep());

    // Trees along the top-left border
    const treePositions = [
      { col: 3, row: 3 }, { col: 5, row: 2 }, { col: 7, row: 4 },
      { col: 2, row: 6 }, { col: 4, row: 8 }, { col: 6, row: 6 },
      { col: 25, row: 3 }, { col: 27, row: 2 }, { col: 28, row: 5 },
    ];
    treePositions.forEach(({ col, row }) => {
      const x = col * tileDisplay + tileDisplay / 2;
      const yTrunk = row * tileDisplay + tileDisplay / 2;
      const yTop  = (row - 1) * tileDisplay + tileDisplay / 2;

      const trunk = this.add.image(x, yTrunk, 'tree-trunk');
      trunk.setScale(SCALE);
      trunk.setDepth(9);

      const top = this.add.image(x, yTop, 'tree-top');
      top.setScale(SCALE);
      top.setDepth(10);
    });

    // Fence posts around the farm plot
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
      const fp = this.add.image(
        col * tileDisplay + tileDisplay / 2,
        row * tileDisplay + tileDisplay / 2,
        'fence-post',
      );
      fp.setScale(SCALE);
      fp.setDepth(8);
    });
  }

  // ── Player & systems ───────────────────────────────────────────────────────

  private spawnPlayer(save: SaveFile | null): void {
    const tx = save?.playerTileX ?? 14;
    const ty = save?.playerTileY ?? 11;
    this.player = new Player(this, tx, ty);
    this.player.syncPixelPosition();
  }

  private setupSystems(save: SaveFile | null): void {
    const day = save?.day ?? 1;
    const mins = save?.totalMinutes ?? 6 * 60;
    this.timeSystem = new TimeSystem(day, Math.floor(mins / 60));

    this.movement = new MovementSystem((x, y) => this.isTileWalkable(x, y));
    this.movement.bind(this.player);

    // Inventory & energy
    this.inventory = new InventorySystem();
    this.inventory.deserialize(save?.inventory ?? []);

    this.energySystem = new EnergySystem(save?.energy ?? 100);

    // Crop system
    this.cropSystem = new CropSystem();
    this.cropSystem.deserialize(save?.crops ?? []);

    // Restore tile overrides (tilled/watered soil)
    for (const override of (save?.tileOverrides ?? [])) {
      this.setTile(override.tileX, override.tileY, override.tileId as TileId);
    }

    // Rebuild any saved crops visually
    for (const crop of this.cropSystem.getAllCrops()) {
      this.spawnCropSprite(crop.tileX, crop.tileY, crop.cropType, crop.growthStage);
    }

    // HotBar (runs in GameScene's scene, uses scrollFactor 0)
    this.hotBar = new HotBar(this, this.inventory, this.energySystem);

    // InteractionSystem with tool use awareness
    this.interaction = new InteractionSystem(this, this.movement, (tileX, tileY) => {
      this.handleTileClick(tileX, tileY);
    });

    // Start the clock!
    this.timeSystem.start();
  }

  // ── Tool & crop interaction ────────────────────────────────────────────────

  private handleTileClick(tileX: number, tileY: number): void {
    // Harvest takes priority over tools
    if (this.cropSystem.isReadyToHarvest(tileX, tileY)) {
      this.harvestCrop(tileX, tileY);
      return;
    }

    const selectedId = this.inventory.selectedItemId;
    if (!selectedId) return;

    const item = getItem(selectedId);
    const tileId = this.tileMap[tileY]?.[tileX];

    if (item.category === 'tool') {
      this.useTool(selectedId, tileX, tileY, tileId);
    } else if (item.category === 'seed') {
      this.plantSeed(selectedId, tileX, tileY, tileId);
    }
  }

  private useTool(toolId: string, tileX: number, tileY: number, tileId: number): void {
    if (toolId === 'hoe') {
      if (tileId !== TILE.GRASS) return;
      if (!this.energySystem.spend(2)) { this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444); return; }
      this.setTile(tileX, tileY, TILE.DIRT);
      this.showFloatingText(tileX, tileY, '+Till', 0xc8956b);
    } else if (toolId === 'watering_can') {
      if (tileId === TILE.DIRT) {
        if (!this.energySystem.spend(1)) { this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444); return; }
        this.setTile(tileX, tileY, TILE.WATERED_DIRT);
        this.cropSystem.water(tileX, tileY);
        this.showFloatingText(tileX, tileY, '💧', 0x5fcde4);
      } else if (tileId === TILE.WATERED_DIRT || this.cropSystem.isOccupied(tileX, tileY)) {
        if (!this.energySystem.spend(1)) { this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444); return; }
        this.cropSystem.water(tileX, tileY);
        this.showFloatingText(tileX, tileY, '💧', 0x5fcde4);
      }
    }
    this.hotBar.refresh();
  }

  private plantSeed(seedId: string, tileX: number, tileY: number, tileId: number): void {
    if (tileId !== TILE.DIRT && tileId !== TILE.WATERED_DIRT) return;
    if (this.cropSystem.isOccupied(tileX, tileY)) return;

    const cropDef = getCropBySeed(seedId);
    if (!cropDef) return;
    if (!this.energySystem.spend(cropDef.energyCost)) {
      this.showFloatingText(tileX, tileY, 'Too tired!', 0xff4444);
      return;
    }

    this.inventory.removeItem(seedId, 1);
    this.cropSystem.plant(tileX, tileY, seedId);
    this.spawnCropSprite(tileX, tileY, cropDef.id, 0);
    this.hotBar.refresh();
    this.showFloatingText(tileX, tileY, 'Planted!', 0x99e550);
  }

  private harvestCrop(tileX: number, tileY: number): void {
    if (!this.cropSystem.isReadyToHarvest(tileX, tileY)) return;
    const harvestId = this.cropSystem.harvest(tileX, tileY);
    if (!harvestId) return;

    const crop = this.cropSystem.getCrop(tileX, tileY);
    if (!crop) {
      // Crop removed — destroy sprite
      this.destroyCropSprite(tileX, tileY);
    } else {
      // Regrows — update sprite to new stage
      this.updateCropSprite(tileX, tileY, crop.cropType, crop.growthStage);
    }

    this.inventory.addItem(harvestId, 1);
    const price = getItem(harvestId).basePrice;
    this.showFloatingText(tileX, tileY, `+${harvestId.charAt(0).toUpperCase() + harvestId.slice(1)}`, 0x99e550);
    this.hotBar.refresh();
  }

  private setupCropListeners(): void {
    // When a new day comes, advance crops and refresh sprites
    EventBus.on('time:new-day', () => {
      this.cropSystem.advanceDay();
      for (const crop of this.cropSystem.getAllCrops()) {
        this.updateCropSprite(crop.tileX, crop.tileY, crop.cropType, crop.growthStage);
      }
      this.energySystem.fullRestore();
    });
  }

  // ── Crop sprite management ─────────────────────────────────────────────────

  private cropSpriteKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private spawnCropSprite(tileX: number, tileY: number, cropType: string, stage: number): void {
    const key = this.cropSpriteKey(tileX, tileY);
    this.destroyCropSprite(tileX, tileY);
    const tileDisplay = TILE_SIZE * SCALE;
    const img = this.add.image(
      tileX * tileDisplay + tileDisplay / 2,
      tileY * tileDisplay + tileDisplay / 2,
      `crop-${cropType}-${stage}`,
    );
    img.setScale(SCALE).setDepth(15);
    this.cropSprites.set(key, img);
  }

  private updateCropSprite(tileX: number, tileY: number, cropType: string, stage: number): void {
    const img = this.cropSprites.get(this.cropSpriteKey(tileX, tileY));
    if (img) {
      const textureKey = `crop-${cropType}-${stage}`;
      if (this.textures.exists(textureKey)) img.setTexture(textureKey);
    } else {
      this.spawnCropSprite(tileX, tileY, cropType, stage);
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
    const img = this.tileImages[tileY][tileX];
    img.setTexture(TILE_KEYS[tileId]);
  }

  // ── Floating text helper ───────────────────────────────────────────────────

  private showFloatingText(tileX: number, tileY: number, text: string, color: number): void {
    const tileDisplay = TILE_SIZE * SCALE;
    const hexStr = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(
      tileX * tileDisplay + tileDisplay / 2,
      tileY * tileDisplay,
      text,
      { fontFamily: '"Courier New"', fontSize: '13px', color: hexStr, stroke: '#000', strokeThickness: 3 },
    );
    t.setOrigin(0.5, 1).setDepth(50);
    this.tweens.add({
      targets: t, y: t.y - 32, alpha: 0,
      duration: 900, ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  private setupSleepListeners(): void {
    // Midnight → forced sleep
    EventBus.on('time:midnight', () => {
      if (!this.sleepingIn) this.triggerSleep();
    });

    // After sleep transition ends → resume game
    EventBus.on('sleep:end', ({ day }) => {
      this.sleepingIn = false;
      this.timeSystem.advanceDay();
      this.timeSystem.start();
      // Broadcast so UIScene updates
      EventBus.emit('time:new-day', { day });
    });
  }

  triggerSleep(): void {
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

  buildSave(day?: number): SaveFile {
    const base = SaveManager.load() ?? defaultSave();

    // Collect tile overrides (tilled/watered tiles)
    const tileOverrides: Array<{ tileX: number; tileY: number; tileId: number }> = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const id = this.tileMap[row][col];
        if (id === TILE.DIRT || id === TILE.WATERED_DIRT) {
          tileOverrides.push({ tileX: col, tileY: row, tileId: id });
        }
      }
    }

    return {
      ...base,
      day: day ?? this.timeSystem.day,
      totalMinutes: this.timeSystem.minutesElapsed,
      coins: this.coins,
      playerTileX: this.player.tileX,
      playerTileY: this.player.tileY,
      currentScene: 'GameScene',
      inventory: this.inventory.serialize(),
      crops: this.cropSystem.serialize(),
      energy: this.energySystem.serialize(),
      tileOverrides,
    };
  }

  private isTileWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= MAP_COLS || y >= MAP_ROWS) return false;
    const tileId = this.tileMap[y][x];
    if (BLOCKING_TILES.has(tileId)) return false;
    // House occupies tiles 11-13 × 4-8 (rough blockade)
    if (x >= 11 && x <= 13 && y >= 4 && y <= 9) return false;
    return true;
  }

  private setupCamera(): void {
    const tileDisplay = TILE_SIZE * SCALE;
    const worldW = MAP_COLS * tileDisplay;
    const worldH = MAP_ROWS * tileDisplay;

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(CANVAS_WIDTH * 0.25, CANVAS_HEIGHT * 0.25);
  }

  private launchUI(): void {
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', { timeSystem: this.timeSystem });
    } else {
      this.scene.get('UIScene').scene.restart({ timeSystem: this.timeSystem });
    }
  }

  private disableContextMenu(): void {
    // Prevent right-click context menu on the canvas
    this.game.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  // ── Update loop ────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    this.timeSystem.update(delta);
    this.movement.update(delta);
  }

  // ── Public accessors (used by UIScene via EventBus) ────────────────────────

  getTimeSystem(): TimeSystem {
    return this.timeSystem;
  }

  getPlayer(): Player {
    return this.player;
  }
}
