import Phaser from 'phaser';
import { TILE_SIZE, SCALE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/GameConfig';
import { Player } from '../entities/Player';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { EnergySystem } from '../systems/EnergySystem';
import { HotBar } from '../ui/HotBar';
import { DialogBox } from '../ui/DialogBox';
import { ShopPanel } from '../ui/ShopPanel';
import { EventBus } from '../utils/EventBus';
import { SaveManager } from '../save/SaveManager';
import { defaultSave, SaveFile } from '../save/SaveSchema';
import { TutorialSystem } from '../systems/TutorialSystem';
import { TutorialPopup } from '../ui/TutorialPopup';
import { NPC_DEFS } from '../sprites/NPCSprites';
import { NPC_DIALOGS, NPC_HAS_SHOP, NPC_SHOP_STOCK } from '../data/dialogs';

// ── Village map constants ─────────────────────────────────────────────────────

const VCOLS = 20;
const VROWS = 15;

const VTILE = { GRASS: 0, STONE: 3 } as const;
type VTileId = typeof VTILE[keyof typeof VTILE];
const VTILE_KEYS: Record<VTileId, string> = {
  [VTILE.GRASS]: 'tile-grass',
  [VTILE.STONE]: 'tile-stone',
};

// ── Scene ─────────────────────────────────────────────────────────────────────

export class VillageScene extends Phaser.Scene {
  private tileMap!: VTileId[][];
  private tileImages!: Phaser.GameObjects.Image[][];
  private player!: Player;
  private movement!: MovementSystem;
  private interaction!: InteractionSystem;
  private timeSystem!: TimeSystem;
  private inventory!: InventorySystem;
  private energySystem!: EnergySystem;
  private hotBar!: HotBar;
  private dialogBox!: DialogBox;
  private shopPanel: ShopPanel | null = null;
  private coins = 50;
  private transitioning = false;
  private tutorialSystem!: TutorialSystem;
  private tutorialPopup!:  TutorialPopup;

  // NPC tile blocking set (tile keys "x,y")
  private npcTiles: Set<string> = new Set();

  // Entry position passed from GameScene
  private entryX = 1;
  private entryY = 7;

  constructor() {
    super({ key: 'VillageScene' });
  }

  init(data: { entryX?: number; entryY?: number } = {}): void {
    this.entryX = data.entryX ?? 1;
    this.entryY = data.entryY ?? 7;
  }

  create(): void {
    const save = SaveManager.load() ?? defaultSave();
    this.coins = save.coins;
    this.shopPanel = null;
    this.transitioning = false;
    this.tutorialSystem = new TutorialSystem(save.tutorialStep ?? 0);

    this.buildTileMap();
    this.renderTiles();
    this.placeBuildings();
    this.placeNPCs();
    this.spawnPlayer();
    this.setupSystems(save);
    this.setupCamera();
    this.buildUI();
    this.launchUI();
    this.disableContextMenu();

    // Tutorial popup — must be after buildUI
    this.tutorialPopup = new TutorialPopup(this, this.tutorialSystem, 'VillageScene');
    this.events.once('shutdown', () => this.tutorialPopup.destroy());

    // Sync coin display
    EventBus.emit('coins:changed', { coins: this.coins });
  }

  // ── Map ───────────────────────────────────────────────────────────────────

  private buildTileMap(): void {
    this.tileMap = [];
    for (let row = 0; row < VROWS; row++) {
      this.tileMap[row] = [];
      for (let col = 0; col < VCOLS; col++) {
        const isBorder = row === 0 || row === VROWS - 1 || col === VCOLS - 1;
        const isLeftBorder = col === 0 && (row < 5 || row > 9);
        this.tileMap[row][col] = (isBorder || isLeftBorder) ? VTILE.STONE : VTILE.GRASS;
      }
    }

    // Main stone road: row 7, cols 0-18
    for (let col = 0; col <= 18; col++) {
      this.tileMap[7][col] = VTILE.STONE;
    }

    // Paths from road up to each building
    for (let row = 4; row <= 6; row++) {
      this.tileMap[row][3]  = VTILE.STONE; // Rosa path
      this.tileMap[row][16] = VTILE.STONE; // Mabel path
    }
  }

  private renderTiles(): void {
    const td = TILE_SIZE * SCALE;
    this.tileImages = [];
    for (let row = 0; row < VROWS; row++) {
      this.tileImages[row] = [];
      for (let col = 0; col < VCOLS; col++) {
        const img = this.add.image(col * td, row * td, VTILE_KEYS[this.tileMap[row][col]]);
        img.setOrigin(0, 0).setScale(SCALE).setDepth(0);
        this.tileImages[row][col] = img;
      }
    }
  }

  // ── World objects ─────────────────────────────────────────────────────────

  private placeBuildings(): void {
    const td = TILE_SIZE * SCALE;

    // Rosa's Workshop (left side)
    this.add.image(3 * td + td, 3.5 * td, 'farmhouse').setScale(SCALE * 1.5).setDepth(10);
    this.add.text(3 * td + td, 2 * td - 4, "ROSA'S TOOLS", {
      fontFamily: '"Courier New"', fontSize: '11px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2, align: 'center',
    }).setOrigin(0.5, 1).setDepth(20);

    // Mabel's Shop (right side)
    this.add.image(16 * td, 3.5 * td, 'farmhouse').setScale(SCALE * 1.5).setDepth(10);
    this.add.text(16 * td, 2 * td - 4, "MABEL'S SHOP", {
      fontFamily: '"Courier New"', fontSize: '11px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2, align: 'center',
    }).setOrigin(0.5, 1).setDepth(20);

    // Entry gate label
    this.add.text(0.5 * td, 7 * td + td / 2, '←', {
      fontFamily: '"Courier New"', fontSize: '18px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(20);

    this.add.text(0.5 * td, 7 * td + td / 2 + 20, 'FARM', {
      fontFamily: '"Courier New"', fontSize: '9px', color: '#cbdbfc',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(20);

    // Decorative trees
    [[7, 2], [12, 2], [7, 11], [12, 11], [5, 10], [14, 10]].forEach(([col, row]) => {
      const x = col * td + td / 2;
      this.add.image(x, row * td + td / 2, 'tree-trunk').setScale(SCALE).setDepth(9);
      this.add.image(x, (row - 1) * td + td / 2, 'tree-top').setScale(SCALE).setDepth(10);
    });
  }

  private placeNPCs(): void {
    const td = TILE_SIZE * SCALE;
    this.npcTiles.clear();

    NPC_DEFS.forEach(npc => {
      const wx = npc.tileX * td + td / 2;
      const wy = npc.tileY * td + td / 2;

      // Sprite
      this.add.image(wx, wy - 4, `npc-${npc.id}`).setScale(SCALE).setDepth(20);

      // Name label above
      this.add.text(wx, wy - td / 2 - 2, npc.name, {
        fontFamily: '"Courier New"', fontSize: '11px', color: '#cbdbfc',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5, 1).setDepth(21);

      // Bouncing interaction arrow
      const arrow = this.add.text(wx, wy - td / 2 + 4, '▼', {
        fontFamily: '"Courier New"', fontSize: '10px', color: '#fbf236',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(21);

      this.tweens.add({
        targets: arrow,
        y: arrow.y + 5, duration: 480,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
      });

      this.npcTiles.add(`${npc.tileX},${npc.tileY}`);
    });
  }

  // ── Systems ───────────────────────────────────────────────────────────────

  private spawnPlayer(): void {
    this.player = new Player(this, this.entryX, this.entryY);
    this.player.syncPixelPosition();
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
    this.dialogBox = new DialogBox(this);
  }

  private setupCamera(): void {
    const td = TILE_SIZE * SCALE;
    this.cameras.main.setBounds(0, 0, VCOLS * td, VROWS * td);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.3);
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

  private isTileWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= VCOLS || y >= VROWS) return false;
    // Right border is never walkable
    if (x === VCOLS - 1) return false;
    // Top / bottom borders
    if (y === 0 || y === VROWS - 1) return false;
    // Left border except entry rows 5-9
    if (x === 0 && (y < 5 || y > 9)) return false;
    // NPC tiles
    if (this.npcTiles.has(`${x},${y}`)) return false;
    return true;
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  private handleTileClick(tileX: number, tileY: number): void {
    if (this.dialogBox.isVisible() || this.shopPanel?.isVisible()) return;

    // NPC interaction
    const npc = NPC_DEFS.find(n => n.tileX === tileX && n.tileY === tileY);
    if (npc) {
      this.openDialog(npc.id);
      return;
    }

    // Farm gate
    if (tileX <= 0 && tileY >= 5 && tileY <= 9) {
      this.transitionToFarm();
    }
  }

  private openDialog(npcId: string): void {
    const lines = NPC_DIALOGS[npcId];
    if (!lines?.length) return;

    this.timeSystem.pause();

    this.dialogBox.show(lines, () => {
      this.timeSystem.start();
      if (NPC_HAS_SHOP.has(npcId)) {
        this.openShop(npcId);
      }
    });
  }

  private openShop(npcId: string): void {
    const stock     = NPC_SHOP_STOCK[npcId] ?? [];
    const shopTitle = npcId === 'mabel' ? "MABEL'S SHOP" : "ROSA'S TOOLS";

    this.shopPanel = new ShopPanel(
      this, this.inventory, stock, shopTitle, this.coins,
      (newCoins) => {
        if (newCoins > this.coins) this.tutorialSystem.advanceIfAt('sell');
        this.coins = newCoins;
      },
    );
    this.shopPanel.open(this.coins);
  }

  // ── Scene transition ──────────────────────────────────────────────────────

  private transitionToFarm(): void {
    if (this.transitioning) return;
    this.transitioning = true;

    this.shopPanel?.close();
    this.dialogBox.dismiss();
    this.movement.stop();
    this.timeSystem.pause();

    // Persist changes (coins, inventory) — farm tile/crop data preserved from prior save
    const save = SaveManager.load() ?? defaultSave();
    SaveManager.save({
      ...save,
      coins:        this.coins,
      inventory:    this.inventory.serialize(),
      energy:       this.energySystem.serialize(),
      totalMinutes: this.timeSystem.minutesElapsed,
      playerTileX:  24,
      playerTileY:  11,
      currentScene: 'GameScene',
      tutorialStep: this.tutorialSystem.serialize(),
    });

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UIScene');
      this.scene.start('GameScene');
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    this.timeSystem.update(delta);
    this.movement.update(delta);

    // Detect player reaching the farm gate
    if (
      !this.transitioning &&
      !this.dialogBox.isVisible() &&
      !this.shopPanel?.isVisible() &&
      this.player.tileX <= 0 &&
      this.player.tileY >= 5 && this.player.tileY <= 9
    ) {
      this.transitionToFarm();
    }
  }
}
