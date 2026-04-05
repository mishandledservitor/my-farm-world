// Full serializable game state — everything needed to resume a session exactly.
// Increment SAVE_VERSION when adding/removing fields; MigrationRegistry handles upgrades.

export const SAVE_VERSION = 1;

export interface AppearanceSave {
  skin: number;
  hair: number;
  shirt: number;
}

export interface SaveFile {
  version: number;
  day: number;
  totalMinutes: number;        // minutes since 00:00 on the current day (0..1439)
  coins: number;
  playerTileX: number;
  playerTileY: number;
  currentScene: string;        // 'GameScene' | 'VillageScene' | 'ForestScene' | 'MineScene'
  appearance: AppearanceSave;
  inventory: InventoryItemSave[];
  crops: CropSave[];
  tileOverrides: TileOverrideSave[];  // tiles changed from default (tilled, watered…)
  energy: number;
  tutorialStep: number;
  unlockedAreas: string[];     // ['forest', 'mine', …]
  animals: AnimalSave[];
  pets: PetSave[];
  processingQueues: ProcessingQueueSave[];
  lifetimeCoinsEarned: number;
  lifetimeItemsSold: number;
}

export interface InventoryItemSave {
  itemId: string;
  quantity: number;
  slotIndex: number;
}

export interface CropSave {
  tileX: number;
  tileY: number;
  cropType: string;
  growthStage: number;   // 0 = planted, 1 = sprouting, 2 = growing, 3 = ready
  wateredToday: boolean;
}

export interface TileOverrideSave {
  tileX: number;
  tileY: number;
  tileId: number;
}

export interface AnimalSave {
  id: string;
  animalType: string;  // 'chicken' | 'cow'
  name: string;
  hunger: number;      // 0 = full, 100 = starving
  produceReady: boolean;
}

export interface PetSave {
  id: string;
  petType: string;     // 'dog' | 'cat'
  name: string;
  happiness: number;   // 0..100
}

export interface ProcessingQueueSave {
  stationType: string;       // 'churn' | 'mill' | 'oven'
  inputItemId: string;
  outputItemId: string;
  startTime: number;         // game minute when processing started
  durationMinutes: number;
}

export function defaultSave(): SaveFile {
  return {
    version: SAVE_VERSION,
    day: 1,
    totalMinutes: 6 * 60,  // 6:00 AM
    coins: 50,
    playerTileX: 14,
    playerTileY: 11,
    currentScene: 'GameScene',
    appearance: { skin: 0xEEC39A, hair: 0x8F563B, shirt: 0x5B6EE1 },
    inventory: [],
    crops: [],
    tileOverrides: [],
    energy: 100,
    tutorialStep: 0,
    unlockedAreas: [],
    animals: [
      { id: 'chicken-1', animalType: 'chicken', name: 'Clucky', hunger: 0, produceReady: false },
    ],
    pets: [],
    processingQueues: [],
    lifetimeCoinsEarned: 0,
    lifetimeItemsSold: 0,
  };
}
