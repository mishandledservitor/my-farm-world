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

const FCOLS = 20;
const FROWS = 15;
const EXIT_COL_MIN = 8;
const EXIT_COL_MAX = 11;

// [col, row] — trunk tile positions; top is at (col, row-1)
const TREE_POSITIONS: [number, number][] = [
  [2,2],[5,2],[8,2],[11,2],[14,2],[17,2],
  [3,5],[7,4],[10,5],[13,4],[16,5],[18,5],
  [2,8],[6,8],[9,10],[12,9],[15,8],[18,8],
];

const BUSH_POSITIONS: [number, number][] = [
  [4,6],[8,7],[13,6],[5,11],[16,10],[11,11],
];

type FTile = 0 | 1; // 0 = GRASS, 1 = STONE
const FTILE_KEYS: Record<FTile, string> = { 0: 'tile-grass', 1: 'tile-stone' };

// ── Scene ──────────────────────────────────────────────────────────────────────

export class ForestScene extends Phaser.Scene {
  private tileMap!: FTile[][];
  private tileImages!: Phaser.GameObjects.Image[][];
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
  private entryX = 9;
  private entryY = 13;

  // Blocking sets (cleared on each create())
  private treeBlockSet   = new Set<string>(); // trunk + top — movement obstacle
  private choppableTrees = new Set<string>(); // trunk positions only — interactable
  private bushSet        = new Set<string>(); // bush positions — interactable

  // Sprite refs for removal when chopped / harvested
  private treeSprites = new Map<string, { trunk: Phaser.GameObjects.Image; top: Phaser.GameObjects.Image }>();
  private bushSprites = new Map<string, Phaser.GameObjects.Image>();

  // Pets
  private pets: PetEntity[] = [];
  private dogOfferShown = false;

  constructor() {
    super({ key: 'ForestScene' });
  }

  init(data: { entryX?: number; entryY?: number } = {}): void {
    this.entryX = data.entryX ?? 9;
    this.entryY = data.entryY ?? 13;
  }

  create(): void {
    const save = SaveManager.load() ?? defaultSave();
    this.transitioning = false;
    this.dogOfferShown = false;
    this.pets = [];
    this.treeBlockSet.clear();
    this.choppableTrees.clear();
    this.bushSet.clear();
    this.treeSprites.clear();
    this.bushSprites.clear();

    this.tutorialSystem = new TutorialSystem(save.tutorialStep ?? 0);

    this.buildTileMap();
    this.renderTiles();
    this.placeObjects();
    this.spawnPlayer();
    this.setupSystems(save);
    this.spawnPets(save);
    this.setupCamera();
    this.buildUI();
    this.launchUI();
    this.disableContextMenu();

    // Dog cutscene: Day 10+, no dog yet
    if (save.day >= 10 && !save.pets.some(p => p.petType === 'dog')) {
      this.time.delayedCall(1200, () => this.showDogOffer(save));
    }

    this.tutorialPopup = new TutorialPopup(this, this.tutorialSystem, 'ForestScene');
    this.events.once('shutdown', () => { this.tutorialPopup.destroy(); this.hotBar.destroy(); });
  }

  // ── Map ───────────────────────────────────────────────────────────────────

  private buildTileMap(): void {
    this.tileMap = [];
    for (let row = 0; row < FROWS; row++) {
      this.tileMap[row] = [];
      for (let col = 0; col < FCOLS; col++) {
        const isBorder    = row === 0 || col === 0 || col === FCOLS - 1;
        const isSouthWall = row === FROWS - 1 && (col < EXIT_COL_MIN || col > EXIT_COL_MAX);
        this.tileMap[row][col] = (isBorder || isSouthWall) ? 1 : 0;
      }
    }
  }

  private renderTiles(): void {
    const td = TILE_SIZE * SCALE;
    this.tileImages = [];
    for (let row = 0; row < FROWS; row++) {
      this.tileImages[row] = [];
      for (let col = 0; col < FCOLS; col++) {
        const img = this.add.image(col * td, row * td, FTILE_KEYS[this.tileMap[row][col]]);
        img.setOrigin(0, 0).setScale(SCALE).setDepth(0);
        this.tileImages[row][col] = img;
      }
    }
  }

  // ── World objects ─────────────────────────────────────────────────────────

  private placeObjects(): void {
    const td = TILE_SIZE * SCALE;

    // Trees: trunk blocks movement; top (row-1) also blocks movement
    for (const [col, row] of TREE_POSITIONS) {
      const key = `${col},${row}`;
      this.treeBlockSet.add(key);
      if (row > 0) this.treeBlockSet.add(`${col},${row - 1}`);
      this.choppableTrees.add(key);

      const x = col * td + td / 2;
      const trunk = this.add.image(x, row * td + td / 2, 'tree-trunk').setScale(SCALE).setDepth(9);
      const top   = this.add.image(x, (row - 1) * td + td / 2, 'tree-top').setScale(SCALE).setDepth(10);
      this.treeSprites.set(key, { trunk, top });
    }

    // Berry bushes
    for (const [col, row] of BUSH_POSITIONS) {
      const key = `${col},${row}`;
      this.treeBlockSet.add(key);
      this.bushSet.add(key);
      const bush = this.add.image(col * td + td / 2, row * td + td / 2, 'berry-bush')
        .setScale(SCALE).setDepth(9);
      this.bushSprites.set(key, bush);
    }

    // Scene header
    this.add.text(FCOLS / 2 * td, 4, 'WHISPERING FOREST', {
      fontFamily: '"Courier New"', fontSize: '12px', color: '#99e550',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(20);

    // South exit label
    const exitCenterX = ((EXIT_COL_MIN + EXIT_COL_MAX) / 2 + 0.5) * td;
    this.add.text(exitCenterX, (FROWS - 1) * td + td / 2, '↓ FARM', {
      fontFamily: '"Courier New"', fontSize: '10px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(20);
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

  // ── Dog cutscene ──────────────────────────────────────────────────────────

  private showDogOffer(save: SaveFile): void {
    if (this.dogOfferShown || this.transitioning) return;
    this.dogOfferShown = true;
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
      .setStrokeStyle(2, 0x99e550, 1).setScrollFactor(0).setDepth(191));

    add(this.add.text(cx, py + 18, 'A dog is whimpering nearby!', {
      fontFamily: '"Courier New"', fontSize: '15px', color: '#fbf236',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(192));

    add(this.add.text(cx, py + 48, 'Will you take it home?', {
      fontFamily: '"Courier New"', fontSize: '13px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(192));

    const closePanel = () => { container.destroy(); };

    const adoptBtn = add(this.add.text(cx - 60, py + PH - 30, '[ADOPT]', {
      fontFamily: '"Courier New"', fontSize: '14px', color: '#99e550',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(193)
      .setInteractive({ useHandCursor: true })) as Phaser.GameObjects.Text;
    adoptBtn.on('pointerover',  () => adoptBtn.setColor('#ffffff'));
    adoptBtn.on('pointerout',   () => adoptBtn.setColor('#99e550'));
    adoptBtn.on('pointerdown',  () => { closePanel(); this.adoptDog(save); });

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

  private adoptDog(save: SaveFile): void {
    const newPet = { id: 'dog-1', petType: 'dog', name: 'Buddy', happiness: 50 };
    const updatedSave = { ...save, pets: [...save.pets, newPet] };
    SaveManager.save(updatedSave);

    const pet = new PetEntity(
      this, newPet.id, newPet.petType, newPet.name, newPet.happiness,
      this.player.tileX + 1, this.player.tileY,
    );
    this.pets.push(pet);
    this.showFloatingText(this.player.tileX, this.player.tileY, 'Buddy joined!', 0xfbf236);
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
    this.interaction.isBlocked = () => this.transitioning;

    this.timeSystem.start();
  }

  private buildUI(): void {
    this.hotBar = new HotBar(this, this.inventory, this.energySystem);
  }

  private setupCamera(): void {
    const td = TILE_SIZE * SCALE;
    this.cameras.main.setBounds(0, 0, FCOLS * td, FROWS * td);
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
    if (x < 0 || y < 0 || x >= FCOLS || y >= FROWS) return false;
    if (this.tileMap[y][x] === 1) return false;
    if (this.treeBlockSet.has(`${x},${y}`)) return false;
    return true;
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  private handleTileClick(tileX: number, tileY: number): void {
    const key      = `${tileX},${tileY}`;
    const keyBelow = `${tileX},${tileY + 1}`; // tree-top → trunk is one row below

    if (this.choppableTrees.has(key)) {
      this.chopTree(tileX, tileY);
      return;
    }
    if (this.choppableTrees.has(keyBelow)) {
      this.chopTree(tileX, tileY + 1);
      return;
    }
    if (this.bushSet.has(key)) {
      this.harvestBush(tileX, tileY);
    }
  }

  private chopTree(col: number, row: number): void {
    const key = `${col},${row}`;
    if (!this.choppableTrees.has(key)) return;

    if (this.inventory.selectedItemId !== 'axe') {
      this.showFloatingText(col, row, 'Equip Axe!', 0xff8800);
      return;
    }
    if (!this.energySystem.spend(3)) {
      this.showFloatingText(col, row, 'Too tired!', 0xff4444);
      return;
    }

    // Unblock tiles
    this.choppableTrees.delete(key);
    this.treeBlockSet.delete(key);
    this.treeBlockSet.delete(`${col},${row - 1}`);

    // Replace trunk + top with stump
    const sprites = this.treeSprites.get(key);
    sprites?.trunk.destroy();
    sprites?.top.destroy();
    this.treeSprites.delete(key);

    const td = TILE_SIZE * SCALE;
    this.add.image(col * td + td / 2, row * td + td / 2, 'stump').setScale(SCALE).setDepth(9);

    // Drop wood
    const amount = Phaser.Math.Between(1, 3);
    this.inventory.addItem('wood', amount);
    this.hotBar.refresh();
    this.showFloatingText(col, row, `+${amount} Wood`, 0xd9a066);
  }

  private harvestBush(col: number, row: number): void {
    const key = `${col},${row}`;
    if (!this.bushSet.has(key)) return;

    this.bushSet.delete(key);
    this.treeBlockSet.delete(key);
    this.bushSprites.get(key)?.destroy();
    this.bushSprites.delete(key);

    const amount = Phaser.Math.Between(2, 4);
    this.inventory.addItem('berry', amount);
    this.hotBar.refresh();
    this.showFloatingText(col, row, `+${amount} Berry`, 0xd95763);
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

  private transitionToFarm(): void {
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
      playerTileX:  14,
      playerTileY:  2,
      currentScene: 'GameScene',
      tutorialStep: this.tutorialSystem.serialize(),
      pets:         this.pets.map(p => ({ id: p.id, petType: p.petType, name: p.name, happiness: p.happiness })),
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

    if (
      !this.transitioning &&
      this.player.tileY >= FROWS - 1 &&
      this.player.tileX >= EXIT_COL_MIN &&
      this.player.tileX <= EXIT_COL_MAX
    ) {
      this.transitionToFarm();
    }
  }
}
