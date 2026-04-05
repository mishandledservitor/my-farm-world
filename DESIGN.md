# My Farm World — Design Document

A slow-paced, Stardew Valley-inspired farming simulation game built entirely in the browser using Phaser 3 and TypeScript. No external art assets — every sprite is drawn programmatically from pixel-colour arrays.

---

## Core Design Principles

| Principle | Implementation |
|---|---|
| **Point-and-click only** | All interaction is left-click. No keyboard shortcuts, no right-click context menus. |
| **Pixel-art, no assets** | Every sprite is a `number[][]` array of DB32 palette colours; `BootScene` converts them to Phaser textures at startup via `RenderTexture`. |
| **Slow-paced** | One real second = one game minute. Day ends at midnight (24 game-hours). Mandatory sleep enforces a day cycle. |
| **Mandatory rest** | The player cannot skip sleeping. At midnight the game forces a sleep transition. Energy depletes with tool use; sleep restores it fully. |
| **Seasons** | 30 days per season (Spring → Summer → Fall → Winter → repeat). Season-restricted crops, seasonal messages on season change. |

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Game framework | **Phaser 3.80** | Scene manager, pointer input, animation, RenderTexture |
| Bundler | **Vite 5** | Fast HMR, zero-config TypeScript |
| Language | **TypeScript 5 strict** | Full type safety across all systems |
| Tests | **Vitest 1** | Same Vite config, no DOM required for logic tests |
| Persistence | **localStorage** | JSON save file, ~5–15 KB |

---

## Project Layout

```
src/
  main.ts                    Phaser.Game config; all scenes registered here
  constants/
    GameConfig.ts            TILE_SIZE=16, SCALE=3, canvas 960×720, time speeds
  sprites/                   Pixel art arrays (number[][])
    TerrainSprites.ts        Grass, dirt, watered-dirt, stone, water, wood-floor
    UISprites.ts             Click-ring, slot, heart, bed, farmhouse, tree, fence
    CropSprites.ts           Per-crop, per-stage sprites
    ItemSprites.ts           12×12 item icons + ITEM_ICONS lookup
    AnimalSprites.ts         Chicken, cow, barn, trough, churn, mill, oven
    EnvironmentSprites.ts    Berry bush, cave entrance, mine rock, stump + resource icons
    PetSprites.ts            Dog (brown), cat (grey + green eyes)
    NPCSprites.ts            Mabel, Finn, Rosa (16×16 each)
    PlayerSprites.ts         Player walk/idle sprite sheet (4 dirs × 4 frames)
  scenes/
    BootScene.ts             Registers all textures; must succeed before any world scene
    MainMenuScene.ts         New Game / Continue; routes to correct saved scene
    CharacterCustomScene.ts  Skin/hair/shirt customisation; palette-swap
    GameScene.ts             Farm (30×24); crops, animals, sleep, forest/village transitions
    VillageScene.ts          Village (20×15); NPCs, shop, mine entrance
    ForestScene.ts           Forest (20×15); trees, bushes, dog cutscene
    MineScene.ts             Mine (20×15, 5 floors); ore, ladders
    UIScene.ts               Parallel HUD: clock, season, coins, debug coords
    SleepTransitionScene.ts  Fade + "Day N" / "Season Complete!" card
    DialogScene.ts           (reserved; dialog is currently inline in VillageScene)
  systems/
    TimeSystem.ts            Delta-based clock; emits time:tick, time:midnight, time:new-day
    MovementSystem.ts        A* pathfinding; smooth tile-to-tile lerp; animation control
    InteractionSystem.ts     Left-click handler; click-ring indicator; A* callback dispatch
    CropSystem.ts            Plant/water/grow/harvest; season check; serialize/deserialize
    AnimalSystem.ts          Hunger, produce, advanceDay; serialize/deserialize
    ProcessingSystem.ts      Station jobs (churn/mill/oven); progress tracking
    EnergySystem.ts          100-point energy; spend/restore; serialize
    InventorySystem.ts       24-slot inventory + 8-slot hotbar; selectedItem
    TutorialSystem.ts        Named-step state machine; advanceIfAt(stepName)
    UnlockSystem.ts          Forest (Day 7 + axe) and Mine (1000 coins) gate checks
  entities/
    Player.ts                Sprite + tile position; 4-direction walk/idle animations
    PetEntity.ts             Follow logic (600 ms/step, teleport >5 tiles); click hearts
  data/
    crops.ts                 CropDefinition: growthDays, stages, season, regrows
    items.ts                 ItemDefinition: basePrice, buyPrice, category, stackable
    dialogs.ts               NPC_DIALOGS, NPC_HAS_SHOP, NPC_SHOP_STOCK
    animals.ts               (inlined in AnimalSystem)
  ui/
    HotBar.ts                8-slot hotbar; selected-item highlight; energy bar
    InventoryPanel.ts        24-slot grid panel
    ShopPanel.ts             Sell column + buy column; sellMultiplier for cat bonus
    CraftingPanel.ts         Per-station recipe list or active-job progress bar
    AnimalPanel.ts           Animal list with hunger bars; feed/collect
    DialogBox.ts             Click-to-advance NPC dialog
    TutorialPopup.ts         Arrow + text overlay; [SKIP] button
  save/
    SaveSchema.ts            Full SaveFile interface; defaultSave(); PetSave, CropSave, etc.
    SaveManager.ts           localStorage save/load/delete; forward-migration stub
  utils/
    AStarPathfinder.ts       Manhattan heuristic A*; non-walkable targets use nearest neighbour
    ColorPalette.ts          DB32-subset colour constants (TRANSPARENT = -1)
    EventBus.ts              Typed pub/sub; GameEventMap; all cross-scene comms go here
    PixelArtUtils.ts         registerPixelTexture, registerSpriteSheet, applyPaletteSwap, addHoverHighlight
    PlayerTextureUtils.ts    refreshPlayerTextures (palette-swap), registerNPCTextures
    SeasonUtils.ts           getSeasonFromDay, getDayOfSeason, isLastDayOfSeason, seasonLabel, seasonColor
tests/
  SeasonUtils.test.ts        12 tests
  CropSystem.test.ts         15 tests
  UnlockSystem.test.ts       7 tests
  SaveManager.test.ts        4 tests
```

---

## Scene Architecture

```
                ┌─────────────────────┐
                │     BootScene       │  registers all textures → starts MainMenuScene
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │   MainMenuScene     │  New Game → CharacterCustomScene
                └──────────┬──────────┘  Continue → saved scene
                           │
          ┌────────────────┼────────────────┐
          │                │                │
  ┌───────▼──────┐ ┌───────▼──────┐ ┌──────▼───────┐
  │  GameScene   │ │VillageScene  │ │ ForestScene  │
  │  (farm 30×24)│ │(village 20×15│ │(forest 20×15)│
  └───────┬──────┘ └───────┬──────┘ └──────────────┘
          │                │
    SleepTransition  ┌─────▼──────┐
                     │ MineScene  │
                     │(mine 20×15)│
                     └────────────┘

UIScene ─── always parallel on top (never scrolls)
```

**Rule**: world scenes are mutually exclusive. UIScene is always active alongside one world scene. SleepTransitionScene is launched on top of GameScene (not as a replacement) and removes itself on completion.

---

## Core Loop

```
Wake up (6 AM)
  → Till soil (hoe, -2 energy)
  → Water crops (watering can, -1 energy per tile)
  → Plant seeds (select seed in hotbar, click watered dirt, -3 energy)
  → Visit barn → feed animals, collect produce
  → Process produce (churn/mill/oven)
  → Walk east → VillageScene → sell to Mabel → buy seeds
  → Return home
  → Sleep (click bed or wait for midnight)
  → new-day advances crop stages, animal hunger, restores energy
```

---

## Seasons

| Season | Days | Season-exclusive crops |
|---|---|---|
| Spring | 1–30 | Turnip, Carrot |
| Summer | 31–60 | Strawberry |
| Fall | 61–90 | Pumpkin |
| Winter | 91–120 | _(none — only Wheat grows year-round)_ |

Crops planted in the wrong season are blocked at planting time. Crops in the field when a season ends **wither** (removed from CropSystem, sprite destroyed, "Withered!" notification).

---

## Unlock Gates

| Area | Condition |
|---|---|
| Whispering Forest (north of farm) | Day ≥ 7 AND axe in inventory |
| The Mine (east of village) | lifetimeCoinsEarned ≥ 1000 |

---

## Pets

| Pet | How to obtain | Passive bonus |
|---|---|---|
| Dog ("Buddy") | Forest cutscene on Day ≥ 10 | Alerts player when crops are harvest-ready each morning |
| Cat ("Luna") | Mabel's offer after 50 total items sold | +10% sell price in all shop transactions |

Pets follow the player using simple directional movement (one step per 600 ms), teleporting to the player's side if the distance exceeds 5 tiles.

---

## Save System

- **Format**: JSON stored under key `my-farm-world-save` in `localStorage`.
- **Triggered**: On every sleep via `SleepTransitionScene`; on every scene transition.
- **Schema version**: `SAVE_VERSION = 1`. `SaveManager.migrate()` fills missing fields from `defaultSave()` for forward compatibility.
- **Size**: ~5–15 KB depending on crop count and tile overrides.

### SaveFile fields (summary)

| Field | Type | Description |
|---|---|---|
| `version` | `number` | Schema version for migration |
| `day` | `number` | Current game day (1-indexed) |
| `totalMinutes` | `number` | Minutes since 00:00 today (0–1439) |
| `coins` | `number` | Current coin balance |
| `playerTileX/Y` | `number` | Last tile position |
| `currentScene` | `string` | Scene to resume on Continue |
| `appearance` | `AppearanceSave` | Skin, hair, shirt palette values |
| `inventory` | `InventoryItemSave[]` | Slot index, item ID, quantity |
| `crops` | `CropSave[]` | Position, type, growth stage, watered |
| `tileOverrides` | `TileOverrideSave[]` | Tilled/watered tiles |
| `energy` | `number` | Current energy (0–100) |
| `tutorialStep` | `number` | Tutorial state machine step |
| `animals` | `AnimalSave[]` | ID, type, name, hunger, produceReady |
| `pets` | `PetSave[]` | ID, type, name, happiness |
| `processingQueues` | `ProcessingQueueSave[]` | Active processing jobs |
| `lifetimeCoinsEarned` | `number` | Cumulative sell earnings |
| `lifetimeItemsSold` | `number` | Cumulative items sold (by quantity) |
| `unlockedAreas` | `string[]` | Reserved for future area tracking |

---

## Event Bus

All cross-scene / cross-system communication goes through `EventBus` (typed pub/sub). Direct scene references are never held.

| Event | Payload | Emitted by |
|---|---|---|
| `time:tick` | `{ hour, minute, totalMinutes }` | TimeSystem (hourly) |
| `time:new-day` | `{ day }` | TimeSystem.advanceDay() |
| `time:midnight` | — | TimeSystem |
| `sleep:end` | `{ day }` | SleepTransitionScene |
| `player:moved` | `{ tileX, tileY }` | MovementSystem |
| `coins:changed` | `{ coins }` | ShopPanel |
| `crop:planted/watered/harvested/withered` | `{ tileX, tileY }` | CropSystem |

---

## Pixel Art Pipeline

1. Define sprite as `number[][]` using `C.XXX` palette constants (`C.TRANSPARENT = -1` skips the pixel).
2. `BootScene.registerAllTextures()` calls `registerPixelTexture(scene, key, grid, pixelSize=1)`.
3. `registerPixelTexture` draws each cell with `Graphics.fillRect` into a `RenderTexture`, calls `rt.saveTexture(key)`, then destroys the temporary objects.
4. The named texture is available globally in Phaser's `TextureManager` from this point.
5. Player and NPC sprites use `registerSpriteSheet` to create multi-frame textures; frame data is registered manually so Phaser animations can reference them by index.
6. Character customisation: `refreshPlayerTextures(scene, appearance)` applies `applyPaletteSwap` to the base sprite grids, replacing mask colours with the player's chosen skin/hair/shirt.

---

## Crafting Recipes

| Station | Input | Output | Duration |
|---|---|---|---|
| Churn | Milk | Butter | 60 min |
| Churn | Milk | Cheese | 180 min |
| Mill | Wheat | Flour | 30 min |
| Oven | Flour | Bread | 120 min |
| Oven | Strawberry | Jam | 90 min |
| Oven | Wild Berry | Jam | 90 min |

---

## Item Price Reference

| Item | Sell price | Buy price | Source |
|---|---|---|---|
| Turnip | 35g (46g spring) | — | Harvest (spring) |
| Carrot | 50g (65g spring) | — | Harvest (spring) |
| Wheat | 25g | — | Harvest (any season) |
| Pumpkin | 120g (180g fall) | — | Harvest (fall) |
| Strawberry | 80g (112g summer) | — | Harvest (summer, regrows) |
| Egg | 30g (37g winter) | — | Chicken daily |
| Milk | 40g (50g winter) | — | Cow daily |
| Butter | 100g | — | Churn |
| Cheese | 130g | — | Churn |
| Flour | 55g | — | Mill |
| Bread | 180g | — | Oven |
| Jam | 160g | — | Oven |
| Stone | 10g | — | Mine floor 1 |
| Iron Ore | 40g | — | Mine floor 2–5 |
| Gold Ore | 120g | — | Mine floor 4–5 |
| Wood | 15g | — | Forest trees |
| Wild Berry | 20g | — | Forest bushes |

Seeds and tools are buy-only (no sell value). Cow costs 500g from Mabel.

---

## Git Branching Convention

```
main              tagged stable releases (v0.1 … v1.1)
feature/vX.Y-name one branch per version, merged back via --no-ff merge commit
```

Commit prefix convention: `feat(scope):`, `fix(scope):`, `test(scope):`, `docs:`.
