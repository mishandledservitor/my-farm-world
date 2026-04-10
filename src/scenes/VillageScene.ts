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
import { UnlockSystem } from '../systems/UnlockSystem';
import { NPC_DEFS } from '../sprites/NPCSprites';
import { NPC_DIALOGS, NPC_HAS_SHOP, NPC_SHOP_STOCK, getFinnDialog } from '../data/dialogs';
import { PetEntity } from '../entities/PetEntity';
import { addHoverHighlight } from '../utils/PixelArtUtils';
import { getSeasonFromDay } from '../utils/SeasonUtils';
import { getEffectiveSellPrice } from '../data/items';

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
  private lifetimeCoinsEarned = 0;
  private lifetimeItemsSold   = 0;
  private transitioning = false;
  private tutorialSystem!: TutorialSystem;
  private tutorialPopup!:  TutorialPopup;

  // NPC tile blocking set (tile keys "x,y")
  private npcTiles: Set<string> = new Set();

  // Pets
  private pets: PetEntity[] = [];
  private catOfferShown = false;

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
    this.coins               = save.coins;
    this.lifetimeCoinsEarned = save.lifetimeCoinsEarned ?? 0;
    this.lifetimeItemsSold   = save.lifetimeItemsSold   ?? 0;
    this.shopPanel           = null;
    this.transitioning       = false;
    this.catOfferShown       = false;
    this.pets                = [];
    this.tutorialSystem      = new TutorialSystem(save.tutorialStep ?? 0);

    this.buildTileMap();
    this.renderTiles();
    this.placeBuildings();
    this.placeNPCs();
    this.spawnPlayer();
    this.setupSystems(save);
    this.spawnPets(save);
    this.setupCamera();
    this.buildUI();
    this.launchUI();
    this.disableContextMenu();

    // Cat offer: 50+ items sold, no cat yet
    if (this.lifetimeItemsSold >= 50 && !save.pets.some(p => p.petType === 'cat')) {
      this.time.delayedCall(1500, () => this.showCatOffer(save));
    }

    // Tutorial popup — must be after buildUI
    this.tutorialPopup = new TutorialPopup(this, this.tutorialSystem, 'VillageScene');
    this.events.once('shutdown', () => { this.tutorialPopup.destroy(); this.hotBar.destroy(); });

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
      fontFamily: '"Courier New"', fontSize: '16px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3, align: 'center',
    }).setOrigin(0.5, 1).setDepth(20);

    // Mabel's Shop (right side)
    this.add.image(16 * td, 3.5 * td, 'farmhouse').setScale(SCALE * 1.5).setDepth(10);
    this.add.text(16 * td, 2 * td - 4, "MABEL'S SHOP", {
      fontFamily: '"Courier New"', fontSize: '16px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3, align: 'center',
    }).setOrigin(0.5, 1).setDepth(20);

    // Entry gate label
    this.add.text(0.5 * td, 7 * td + td / 2, '←', {
      fontFamily: '"Courier New"', fontSize: '18px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(20);

    this.add.text(0.5 * td, 7 * td + td / 2 + 20, 'FARM', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#cbdbfc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(20);

    // Cave entrance (mine) at the east end of the road
    const caveImg = this.add.image(17 * td + td / 2, 7 * td + td / 2, 'cave-entrance')
      .setScale(SCALE).setDepth(10);
    addHoverHighlight(caveImg);
    this.add.text(17 * td + td / 2, 6 * td - 4, 'THE MINE', {
      fontFamily: '"Courier New"', fontSize: '16px', color: '#9badb7',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

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

      // Sprite — gentle idle bob
      const npcSprite = this.add.image(wx, wy - 4, `npc-${npc.id}`).setScale(SCALE).setDepth(20);
      this.tweens.add({
        targets: npcSprite,
        y: npcSprite.y - 4,
        duration: 1100 + Math.random() * 400,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });

      // Name label above
      this.add.text(wx, wy - td / 2 - 2, npc.name, {
        fontFamily: '"Courier New"', fontSize: '15px', color: '#cbdbfc',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(21);

      // Bouncing interaction arrow
      const arrow = this.add.text(wx, wy - td / 2 + 4, '▼', {
        fontFamily: '"Courier New"', fontSize: '14px', color: '#fbf236',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(21);

      this.tweens.add({
        targets: arrow,
        y: arrow.y + 5, duration: 480,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
      });

      this.npcTiles.add(`${npc.tileX},${npc.tileY}`);
    });

    // Cave entrance blocks its tile
    this.npcTiles.add('17,7');
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

  // ── Cat offer ─────────────────────────────────────────────────────────────

  private showCatOffer(save: SaveFile): void {
    if (this.catOfferShown || this.transitioning) return;
    this.catOfferShown = true;
    this.movement.stop();

    const PW = 420, PH = 160;
    const px = (CANVAS_WIDTH - PW) / 2;
    const py = (CANVAS_HEIGHT - PH) / 2;
    const cx = px + PW / 2;

    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { objs.push(o); return o; };

    add(this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.55)
      .setScrollFactor(0).setDepth(190).setInteractive());
    add(this.add.rectangle(cx, py + PH / 2, PW, PH, 0x0d0d1a, 0.97)
      .setStrokeStyle(2, 0xd95763, 1).setScrollFactor(0).setDepth(191));

    add(this.add.text(cx, py + 18, 'Mabel: "This stray keeps visiting..."', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(192));

    add(this.add.text(cx, py + 48, '"Would you like to adopt her?"', {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(192));

    const closePanel = () => { container.destroy(); };

    const adoptBtn = add(this.add.text(cx - 60, py + PH - 30, '[ADOPT]', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#d95763',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(193)
      .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    adoptBtn.on('pointerover',  () => adoptBtn.setColor('#ffffff'));
    adoptBtn.on('pointerout',   () => adoptBtn.setColor('#d95763'));
    adoptBtn.on('pointerdown',  () => { closePanel(); this.adoptCat(save); });

    const leaveBtn = add(this.add.text(cx + 60, py + PH - 30, '[LEAVE]', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#9badb7',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(193)
      .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    leaveBtn.on('pointerover',  () => leaveBtn.setColor('#ffffff'));
    leaveBtn.on('pointerout',   () => leaveBtn.setColor('#9badb7'));
    leaveBtn.on('pointerdown',  () => closePanel());

    const container = this.add.container(0, 0, objs);
    container.setDepth(200);
    void container;
  }

  private adoptCat(save: SaveFile): void {
    const newPet = { id: 'cat-1', petType: 'cat', name: 'Luna', happiness: 50 };
    const updatedSave = { ...save, pets: [...save.pets, newPet] };
    SaveManager.save(updatedSave);

    const pet = new PetEntity(
      this, newPet.id, newPet.petType, newPet.name, newPet.happiness,
      this.player.tileX + 1, this.player.tileY,
    );
    this.pets.push(pet);
    this.showFloatingText(
      this.player.tileX * TILE_SIZE * SCALE + TILE_SIZE * SCALE / 2,
      this.player.tileY * TILE_SIZE * SCALE,
      'Luna joined! +10% sell price', 0xf7c35e,
    );
    // Update any open shop panel
    if (this.shopPanel) this.shopPanel.sellMultiplier = 1.1;
  }

  private setupSystems(save: SaveFile): void {
    this.timeSystem = new TimeSystem(save.day, Math.floor(save.totalMinutes / 60));

    this.movement = new MovementSystem((x, y) => this.isTileWalkable(x, y));
    this.movement.bind(this.player);

    this.inventory = new InventorySystem();
    this.inventory.deserialize(save.inventory);
    this.inventory.deselectAll();

    this.energySystem = new EnergySystem(save.energy);

    this.interaction = new InteractionSystem(this, this.movement, (tileX, tileY) => {
      this.handleTileClick(tileX, tileY);
    });
    this.interaction.isBlocked = () =>
      this.transitioning || this.dialogBox.isVisible() || !!(this.shopPanel?.isVisible());

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

    // Mine entrance
    if (tileX === 17 && tileY === 7) {
      this.handleMineEntrance();
      return;
    }

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

  private handleMineEntrance(): void {
    const save = SaveManager.load();
    if (!save || !UnlockSystem.isMineUnlocked(save)) {
      const remaining = 1000 - (save?.lifetimeCoinsEarned ?? 0);
      const td = TILE_SIZE * SCALE;
      this.showFloatingText(
        17 * td + td / 2, 7 * td,
        `Earn ${remaining} more coins`, 0xff8800,
      );
      return;
    }
    this.triggerMineTransition();
  }

  private showFloatingText(worldX: number, worldY: number, text: string, color: number): void {
    const hexStr = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(worldX, worldY, text, {
      fontFamily: '"Courier New"', fontSize: '18px', color: hexStr,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(50);
    this.tweens.add({
      targets: t, y: t.y - 24, alpha: 0,
      duration: 1200, ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  private openDialog(npcId: string): void {
    let lines = NPC_DIALOGS[npcId];

    // Contextual Finn dialog
    if (npcId === 'finn') {
      const save      = SaveManager.load();
      const hasAxe    = save?.inventory.some(s => s.itemId === 'axe') ?? false;
      const forestUnlocked = save ? UnlockSystem.isForestUnlocked(save) : false;
      const mineUnlocked   = save ? UnlockSystem.isMineUnlocked(save)   : false;
      lines = getFinnDialog(this.timeSystem.day, hasAxe, forestUnlocked, mineUnlocked);
    }

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

    const currentSeason = getSeasonFromDay(this.timeSystem.day);

    this.shopPanel = new ShopPanel(
      this, this.inventory, stock, shopTitle, this.coins,
      (newCoins, qtySold) => {
        if (newCoins > this.coins) {
          this.lifetimeCoinsEarned += newCoins - this.coins;
          this.lifetimeItemsSold   += qtySold;
          this.tutorialSystem.advanceIfAt('sell');
        }
        this.coins = newCoins;
      },
      // Seasonal price modifier
      (itemId, basePrice) => getEffectiveSellPrice(itemId, currentSeason),
    );
    // Cat bonus: +10% sell price
    if (this.pets.some(p => p.petType === 'cat')) {
      this.shopPanel.sellMultiplier = 1.1;
    }
    this.shopPanel.seasonalPrices = true;
    this.shopPanel.open(this.coins);
  }

  // ── Scene transitions ─────────────────────────────────────────────────────

  private triggerMineTransition(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.shopPanel?.close();
    this.dialogBox.dismiss();
    this.movement.stop();
    this.timeSystem.pause();

    const save = SaveManager.load() ?? defaultSave();
    SaveManager.save({
      ...save,
      coins:               this.coins,
      inventory:           this.inventory.serialize(),
      energy:              this.energySystem.serialize(),
      totalMinutes:        this.timeSystem.minutesElapsed,
      playerTileX:         4,
      playerTileY:         7,
      currentScene:        'MineScene',
      tutorialStep:        this.tutorialSystem.serialize(),
      lifetimeCoinsEarned: this.lifetimeCoinsEarned,
      lifetimeItemsSold:   this.lifetimeItemsSold,
      pets:                this.pets.map(p => ({ id: p.id, petType: p.petType, name: p.name, happiness: p.happiness })),
    });

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('MineScene', { entryX: 4, entryY: 7 }));
    });
  }

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
      coins:               this.coins,
      inventory:           this.inventory.serialize(),
      energy:              this.energySystem.serialize(),
      totalMinutes:        this.timeSystem.minutesElapsed,
      playerTileX:         24,
      playerTileY:         11,
      currentScene:        'GameScene',
      tutorialStep:        this.tutorialSystem.serialize(),
      lifetimeCoinsEarned: this.lifetimeCoinsEarned,
      lifetimeItemsSold:   this.lifetimeItemsSold,
      pets:                this.pets.map(p => ({ id: p.id, petType: p.petType, name: p.name, happiness: p.happiness })),
    });

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(0, () => this.scene.start('GameScene'));
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    this.timeSystem.update(delta);
    this.movement.update(delta);

    for (const pet of this.pets) {
      pet.update(delta, this.player.tileX, this.player.tileY, (x, y) => this.isTileWalkable(x, y));
    }

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
