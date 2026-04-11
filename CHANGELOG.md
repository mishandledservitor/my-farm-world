# Changelog

All notable changes to My Farm World are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v1.6.0] — 2026-04-11

### Added
- **Egg incubation** (`src/systems/AnimalSystem.ts`, `src/ui/AnimalPanel.ts`): Place an egg in the
  barn to incubate it. After 3 days it hatches into a new chicken with a random name. The
  `[+ INCUBATE EGG (3 days)]` button appears in the AnimalPanel when the player has eggs in
  inventory. Incubating eggs are persisted via `SaveFile.incubatingEggs` and displayed in the barn
  panel with a countdown. The `IncubatingEggSave` interface and `incubatingEggs` field were added to
  `SaveSchema.ts`.

- **Jam Sandwich** (`src/data/items.ts`, `src/systems/ProcessingSystem.ts`): New multi-input recipe
  — Bread + Jam → Jam Sandwich (oven, 30 min, sells for 400g). The `ProcessingSystem` now supports
  `extraInputItemId` on recipes for two-ingredient crafting. The `CraftingPanel` renders both input
  icons with a `+` separator and checks that both ingredients are available before enabling
  `[START]`.

- **Animal renaming** (`src/systems/AnimalSystem.ts`, `src/ui/AnimalPanel.ts`): Click an animal's
  name in the barn panel to rename it via a browser prompt (max 20 characters).

- **Farmhouse oven** (`src/scenes/FarmhouseScene.ts`): The oven has been moved from the outdoor farm
  into the farmhouse interior (top-left corner). Clicking it opens the crafting panel for oven
  recipes. The farmhouse scene now loads `ProcessingSystem` state from the save and persists it on
  exit and sleep.

- **Visible barn animals** (`src/scenes/GameScene.ts`): Animals are now rendered as small sprites
  near the base of the barn on the farm map. The display refreshes after each new day and when the
  animal panel is closed.

- **Jam Sandwich icon** (`src/sprites/ItemSprites.ts`): New 12×12 pixel-art icon showing bread
  slices with a red jam filling.

### Changed
- **Sprinklers cover a 5×5 area** (`src/scenes/GameScene.ts`, `src/utils/advanceSaveDay.ts`):
  Sprinklers now water all tiles in a 5×5 grid centred on themselves each morning, up from the
  previous 4 cardinal-adjacent tiles. Both the live game and `advanceSaveDay()` were updated.

- **Sprinklers are retrievable** (`src/scenes/GameScene.ts`): Clicking a placed sprinkler picks it
  back up into the player's inventory with a `+Sprinkler` floating text confirmation.

- **Tools and sprinklers are now sellable** (`src/data/items.ts`, `src/ui/ShopPanel.ts`): All tools
  now have sell prices — hoe (25g), watering can (25g), axe (100g), pickaxe (150g), scythe (75g),
  fishing rod (50g), sprinkler (100g). The shop's sellable-category filter was expanded to include
  `tool` and `misc` items, with a guard against zero-price items.

- **Player walk speed reduced** (`src/constants/GameConfig.ts`): `PLAYER_SPEED_TILES_PER_SECOND`
  lowered from 4 to 2.5 for a more relaxed pace.

- **Barn enlarged** (`src/scenes/GameScene.ts`): Barn footprint expanded from 2×3 (cols 3–4,
  rows 10–12) to 4×3 (cols 2–5, rows 9–11) with a 2.5× visual scale. Feed trough moved to tile
  (6, 11). Oven removed from outdoor processing stations.

- **Cats stay home** (`src/scenes/ForestScene.ts`, `src/scenes/VillageScene.ts`,
  `src/scenes/MineScene.ts`, `src/scenes/FarmhouseScene.ts`): Only dogs follow the player to the
  forest, village, and mine. Cats now appear exclusively in the farmhouse interior.

- **Pet collision avoidance** (`src/entities/PetEntity.ts`): Pets no longer stack on the same tile.
  An `isOccupiedByPet` callback was added to `PetEntity.update()`. Pets check for other pets when
  choosing a movement target or teleport destination, and shuffle sideways when stacked.

- **Click-to-dismiss on all panels** (`src/ui/ShopPanel.ts`, `src/ui/CraftingPanel.ts`,
  `src/ui/InventoryPanel.ts`, `src/ui/AnimalPanel.ts`): Clicking the dim background behind any
  panel now closes it. The panel body is set interactive to prevent click-through to the dimmer.

- **Dialog click-anywhere to advance** (`src/ui/DialogBox.ts`): The NPC dialog click-blocker is now
  full-screen instead of just covering the dialog area. Clicking anywhere advances or closes the
  dialog.

- **Coin display synced across scenes** (`src/scenes/GameScene.ts`, `src/scenes/FarmhouseScene.ts`,
  `src/scenes/ForestScene.ts`, `src/scenes/MineScene.ts`, `src/scenes/UIScene.ts`): All world
  scenes now emit `coins:changed` on creation so the HUD coin counter stays accurate after scene
  transitions. UIScene also initialises the coin text from the save file.

- **Crafting panel shows item icons** (`src/ui/CraftingPanel.ts`): Each recipe row now displays
  input and output item icons alongside the text label instead of text-only.

---

## [v1.5.0] — 2026-04-11

### Added
- **In-game save file export** (`src/scenes/UIScene.ts`): `[ SAVE FILE ]` button in the bottom-right
  of the game HUD. Clicking it flushes the current scene state to localStorage via a `save:flush`
  EventBus event, then exports the save as a downloadable JSON file using `SaveManager.exportToFile()`.
  Previously, save export was only available from the main menu.

- **`advanceSaveDay()` utility** (`src/utils/advanceSaveDay.ts`): Pure function that advances a
  `SaveFile` by one day — crops grow, weather rolls, watered tiles dry, rain/sprinkler auto-watering
  fires, and untended dirt tiles revert to grass after 3 days. Operates entirely on serialised save
  data so it can be called from any scene without Phaser dependencies. Used by FarmhouseScene to
  ensure farmhouse sleep is fully equivalent to farm sleep.

### Fixed
- **Sleeping in the farmhouse did not advance game state** (`src/scenes/FarmhouseScene.ts`): When the
  player slept in the farmhouse bed, the `onSleepEnd` handler only advanced the time system. It did
  not restore energy, advance animals, grow crops, roll weather, dry/water tiles, or track untended
  soil. This was because GameScene (which handles all those systems in its `handleNewDay` method)
  is stopped while FarmhouseScene is active, so its `time:new-day` listener never fires.

  **Fix:** FarmhouseScene now maintains its own `AnimalSystem` loaded from the save. The `onSleepEnd`
  handler calls `energySystem.fullRestore()` and `animalSystem.advanceDay()`. The `buildSave(day)`
  method calls `advanceSaveDay()` to advance crops, weather, tiles, and untended tracking in the
  save data before writing to disk. This ensures the save written during the sleep transition
  contains the fully-advanced new-day state.

- **Chicken never laid eggs** (`src/scenes/FarmhouseScene.ts`): `AnimalSystem.advanceDay()` (which
  sets `produceReady = true` for fed animals) was only called from `GameScene.onSleepEnd`. Since
  GameScene is stopped when sleeping in the farmhouse, the chicken's produce was never flagged as
  ready. Fixed as part of the farmhouse sleep parity fix above.

- **Animal hunger, crop growth, and weather not persisting across reloads**
  (`src/scenes/GameScene.ts`): `GameScene.buildSave(nextDay)` was called by `SleepTransitionScene`
  *before* `onSleepEnd` and `handleNewDay` ran. The save written to disk contained pre-advance state
  (old hunger, old crop stages, old weather). On any reload after sleeping, all overnight progress
  was lost.

  **Fix:** Added `SaveManager.save(this.buildSave())` at the end of `handleNewDay()` so the fully-
  advanced state is always persisted immediately after the day advances.

- **Missing crop sprites for harvest-ready crops** (`src/scenes/GameScene.ts`): Crops at their final
  growth stage (e.g. `growthStage === 3` for turnip with `stages: 3`) requested texture key
  `crop-turnip-3`, but only stages 0–2 have sprites. This caused Phaser's green-and-black missing
  texture placeholder to render for all fully-grown crops.

  **Fix:** `spawnCropSprite()` and `updateCropSprite()` now clamp the sprite stage to
  `Math.min(stage, def.stages - 1)`, ensuring the last defined sprite is used for harvest-ready
  crops.

### Changed
- `save:flush` event added to `EventBus` — listened by GameScene and FarmhouseScene to persist
  current state to localStorage on demand (used by the new in-game save button).
- FarmhouseScene now serialises its `AnimalSystem` state in `buildSave()` and `exitToFarm()`,
  keeping animal data consistent across scene transitions.

---

## [v1.4.0] — 2026-04-10

### Added
- **Weather system** (`src/systems/WeatherSystem.ts`): Random daily weather — sunny (40%), cloudy (30%),
  rainy (30%). Rolled each morning via weighted random. Rain auto-waters all tilled soil and crops,
  saving the player energy on rainy days. Weather icon and label displayed in the UIScene clock panel.
  Rain particle effects overlay the farm when active.

- **Sprinklers** — Buy from Rosa's shop for 200g and place on the farm. Each sprinkler automatically
  waters the 4 cardinal-adjacent tiles every morning, before crop growth is processed. Sprinkler
  positions are persisted in save data (`SaveFile.sprinklers`).

- **Compost bin & fertilizer** — New processing station placed next to the oven on the farm. Compost
  any crop item (turnip, carrot, wheat, pumpkin, strawberry, wild berry) into fertilizer. Apply
  fertilizer to a growing crop to instantly advance it one growth stage.

- **Farmhouse interior** (`src/scenes/FarmhouseScene.ts`): The farmhouse is now an enterable building.
  Click the farmhouse on the farm to enter an 8×6 interior room with a bed. Sleeping now requires
  entering the farmhouse and clicking the bed (or waiting until midnight triggers auto-sleep).
  Exit via the door at the bottom center.

- **Inventory panel** (`src/ui/InventoryPanel.ts`): Full 24-slot backpack panel accessible via the
  BAG button in the HotBar. Shows all slots (hotbar 1–8 + backpack 9–24) with item icons, quantities,
  and names. Click-to-swap mechanic for rearranging items between slots.

- **Save/Load to file** (`src/save/SaveManager.ts`): Export saves as downloadable JSON files and
  import from file on the main menu. LOAD FILE button added alongside NEW GAME / CONTINUE.

- **Fishing** — Fishing rod tool (buy from Rosa) to catch fish from the farm pond. Fish item added
  as a sellable resource.

- **Pastel art style** (`src/utils/PixelArtUtils.ts`): All sprites now go through a `pastelizeSprite()`
  post-processing pass at boot time that applies: (1) pastel colour mapping for softer tones,
  (2) 1px black outlines on all non-terrain sprites, (3) subtle drop shadow to the bottom-right.
  Terrain tiles are excluded to preserve seamless tiling.

- **Missing item icons**: Added icons for wheat, pumpkin, strawberry, jam, cheese, sprinkler,
  fertilizer, compost bin, and fish.

- **`weather:changed` event** added to `EventBus` type map.

### Changed
- Soil dries overnight — watered dirt reverts to regular dirt each morning before rain/sprinkler
  watering is applied.
- Tilled ground reverts to grass after 3 consecutive days without a crop planted on it.
- Plants no longer wither on season change (season-restriction only applies at planting time).
- No tool selected by default when entering any scene (prevents accidental tilling).
- Darker mine rock sprites to better distinguish from stone floor background.
- All text labels increased in size for better readability across scenes.

### Fixed
- **Game freeze after a few seconds** (`src/systems/InventorySystem.ts`): `selectedItemId`,
  `selected`, and `consumeSelectedItem` accessed `this.slots[-1]` when `selectedSlot` was set
  to -1 (by `deselectAll()` or `selectSlot(-1)`). The resulting `TypeError` crashed inside Phaser's
  update loop, freezing all input processing. Fixed by adding bounds checks that return safe defaults
  when `selectedSlot` is out of range.

- **Stuck in bedroom after sleeping in farmhouse** (`src/scenes/GameScene.ts`,
  `src/scenes/FarmhouseScene.ts`, `src/utils/EventBus.ts`): Stale EventBus listeners from
  GameScene's `setupSleepListeners()` and `setupCropListeners()` continued firing after the scene
  was shut down. When sleeping in the farmhouse, the `sleep:end` event triggered GameScene's stale
  listener which called `this.timeSystem.advanceDay()` on a destroyed scene, emitting `time:new-day`,
  which in turn triggered the stale crop listener calling `this.setTile()` — crashing with
  `Cannot read properties of undefined (reading 'sys')`.

  **Fix:** Converted all EventBus listeners in both GameScene and FarmhouseScene from anonymous
  closures to bound class properties (`onMidnight`, `onSleepEnd`, `onNewDay`). Added
  `EventBus.off()` calls for each listener in both scenes' `shutdown` event handlers, ensuring
  listeners are cleaned up when a scene is stopped.

---

## [v1.3.2] — 2026-04-06

### Fixed
- **HotBar click-through** (`src/systems/InteractionSystem.ts`): Clicking hotbar slots (tools, seeds,
  items) also moved the player to the tile underneath the slot. The v1.3.1 `isBlocked` callback only
  checked for *open panels* — the HotBar is always visible and was never considered a blocking condition.

  **Fix:** `InteractionSystem.bindInput()` now inspects the `currentlyOver` array passed by Phaser's
  `pointerdown` event. If any hit game object has `scrollFactorX === 0` (i.e. it is a fixed-position
  UI element rather than a world object), the handler returns early. This catches all UI elements that
  use `setScrollFactor(0)`: HotBar slots, DialogBox blocker, TutorialPopup background, panel overlays.

- **Tutorial popup rendered behind world objects** (`src/ui/TutorialPopup.ts`): Same container-depth
  bug fixed in v1.3.1 for panels — the TutorialPopup container had no depth set, defaulting to 0.
  Buildings (depth 10) and NPCs (depth 20) rendered on top of the tutorial text.

  **Fix:**
  - Set `.setDepth(150)` on the TutorialPopup container.
  - Made the popup's background rectangle interactive (`.setInteractive()`) so the `scrollFactorX`
    check in InteractionSystem blocks clicks on the tutorial area from moving the player.

---

## [v1.3.1] — 2026-04-06

### Fixed
- **Click-through on UI panels** (`src/systems/InteractionSystem.ts`, all world scenes): Clicking buttons
  inside ShopPanel, AnimalPanel, or CraftingPanel also moved the player to the tile underneath the UI
  element. The scene-level `pointerdown` listener in `InteractionSystem` had no awareness of open panels,
  so every left-click triggered player movement regardless of whether a menu was on screen.

  **Fix:** Added an `isBlocked` callback property to `InteractionSystem`. Each world scene sets it to
  check whether any panel, dialog, or transition is currently active. When the callback returns `true`,
  the `pointerdown` handler returns early — no click indicator, no movement, no interaction.

  Scenes and their block conditions:
  - **GameScene**: `sleepingIn || transitioning || animalPanel.isVisible() || craftingPanel.isVisible()`
  - **VillageScene**: `transitioning || dialogBox.isVisible() || shopPanel.isVisible()`
  - **ForestScene**: `transitioning`
  - **MineScene**: `transitioning`

- **Panel z-ordering — menus rendered behind world objects** (`src/ui/ShopPanel.ts`,
  `src/ui/AnimalPanel.ts`, `src/ui/CraftingPanel.ts`, `src/scenes/VillageScene.ts`,
  `src/scenes/ForestScene.ts`): Shop, animal, crafting panels, and pet-adoption modals rendered behind
  buildings, NPCs, and trees. In Phaser 3, adding game objects to a `Container` removes them from the
  scene's display list — the container's own depth then controls render order for all children, overriding
  their individual depth values. All panel containers were created with `this.scene.add.container(0, 0, objs)`
  but never assigned a depth, defaulting to 0. World objects at depth 10–50 drew on top.

  **Fix:** Set `.setDepth(200)` on every panel container immediately after creation:
  - `ShopPanel.rebuild()` container
  - `AnimalPanel.rebuild()` container
  - `CraftingPanel.rebuild()` container
  - VillageScene cat-offer modal container
  - ForestScene dog-offer modal container

---

## [v1.3] — 2026-04-06

### Fixed
- **Black screen on village/scene transitions** (`src/ui/HotBar.ts`, all world scenes): After transitioning
  from one world scene to another, the destination scene rendered completely black. Root cause: `HotBar`
  registered its `inventory:changed` EventBus listener using an anonymous arrow function in `bindEvents()`,
  then tried to remove a *different* arrow function instance in `destroy()` — so the listener was never
  actually removed. The stale listener from the previous scene's HotBar continued to fire during the new
  scene's `create()`, calling `setTexture()` on already-destroyed `Phaser.GameObjects.Image` objects.
  Phaser silently swallowed the resulting `TypeError` inside `create()`, leaving the scene partially
  initialised (no camera set up, UIScene not launched) and rendering black.

  **Fix:**
  - `HotBar`: store listener as a named class field (`private readonly onInventoryChanged`) so the same
    reference is used for both `EventBus.on` and `EventBus.off`, guaranteeing the listener is removed.
  - All four world scenes (GameScene, VillageScene, ForestScene, MineScene): added `this.hotBar.destroy()`
    to the `shutdown` event handler so the listener is cleaned up whenever a scene is stopped.
  - All four world scenes: added `cameras.main.fadeIn(300)` to `setupCamera()` so each scene fades in
    smoothly on arrival.
  - All four world scenes: removed `scene.stop('UIScene')` calls from transition fade callbacks — stopping
    UIScene is unnecessary and caused it to fail to relaunch in Phaser 3.90.
  - All four world scenes: wrapped `scene.start()` calls inside `time.delayedCall(0, …)` to defer the
    scene switch out of the camera-event callback, preventing a Phaser timing edge-case.

---

## [v1.2] — 2026-04-06

### Added
- **Seasonal sell price bonuses** (`src/data/items.ts`): In-season crops sell for a premium at Mabel's shop.
  - Spring: Turnip ×1.3, Carrot ×1.3
  - Summer: Strawberry ×1.4
  - Fall: Pumpkin ×1.5
  - Winter: Egg ×1.25, Milk ×1.25
  The bonus stacks with the cat's +10% multiplier.
- `getEffectiveSellPrice(itemId, season, extraMultiplier)` helper in `items.ts`.
- `SEASONAL_PRICE_BONUS` lookup table in `items.ts`.
- `ShopPanel.seasonalPrices` flag; when set, the sell column header shows "SELL ✦ seasonal prices".
- `ShopPanel` constructor now accepts an optional `PriceModFn` callback for per-item price overrides.
- **New Game confirmation dialog**: Clicking "NEW GAME" when a save exists now shows a "Your save will be lost — [YES] / [CANCEL]" modal before proceeding. The old save is explicitly deleted on confirmation.
- **Contextual Finn dialog** (`src/data/dialogs.ts`): `getFinnDialog(day, hasAxe, forestUnlocked, mineUnlocked)` returns one of five context-sensitive dialog sets:
  - Early game (default): hints about the village and axe.
  - Day 7+ without axe: encourages buying an axe from Rosa for the forest.
  - Forest unlocked: tips about jam-making and wood selling.
  - Day 15+ mine locked: hints about earning 1000 coins for mine access.
  - Mine unlocked: tips about gold ore and pickaxe usage.
  VillageScene calls `getFinnDialog` on each NPC interaction to pick the right lines.

### Changed
- `ShopPanel.open()` now uses `priceModFn(itemId, basePrice)` for sell-price display and transaction math, replacing the previous fixed `item.basePrice` calculation.

---

## [v1.1] — 2026-04-06

### Added
- **Crafting recipes**: Churn now offers `milk → cheese` (180 min). Oven now offers `strawberry → jam` and `wild berry → jam` (90 min each).
- **Crafting panel improvement**: Recipe list and active-job display now shows proper item names (e.g. "Milk" instead of "milk").
- `ProcessingSystem.startJob` accepts optional `outputItemId` to disambiguate multiple recipes with the same input ingredient.

### Fixed
- `lifetimeItemsSold` in VillageScene now counts actual stack size sold (e.g. selling 10 turnips at once counts as 10 toward the cat-adoption threshold, not 1).
- Buy transactions no longer accidentally increment the sold-items counter.

---

## [v1.0] — 2026-04-06

### Added
- **Season system** (`src/utils/SeasonUtils.ts`): 30-day seasons cycling Spring → Summer → Fall → Winter → repeat. Helper functions: `getSeasonFromDay`, `getDayOfSeason`, `isLastDayOfSeason`, `seasonLabel`, `seasonColor`.
- **Season display in HUD**: Clock panel now shows season name + day-of-season (e.g. "Day 15  (Spring 15)") in a season-tinted colour.
- **Season-complete card**: `SleepTransitionScene` shows "Spring Complete!" / "Summer Complete!" etc. when a season ends instead of the normal "Day N" card.
- **Season-restricted planting**: Attempting to plant a crop in the wrong season shows a floating message (e.g. "Fall only!"). `CropSystem.canPlantInSeason()` static helper.
- **Crop withering**: `CropSystem.advanceDay(season)` now removes crops whose season doesn't match the new day's season and returns the tile keys so the caller can remove sprites and show "Withered!" floating text.
- **Hover highlights**: `addHoverHighlight()` in `PixelArtUtils` applies a blue-white tint on pointer-over. Applied to: bed, barn, feed trough, churn, mill, oven (GameScene); cave entrance (VillageScene).
- **NPC idle animation**: NPCs in VillageScene now have a gentle up-down bob tween with randomised timing.
- **Correct save-scene routing**: Main Menu "Continue" now starts the exact scene the player saved in (GameScene, VillageScene, ForestScene, or MineScene).
- **Unit tests** (38 tests via Vitest): `SeasonUtils`, `CropSystem`, `UnlockSystem`, `SaveManager`.
- `crop:withered` event added to `EventBus` type map.
- Version string updated to `v1.0` in Main Menu and HUD.

### Changed
- `CropSystem.advanceDay()` signature changed to accept an optional `SeasonName` parameter.

---

## [v0.9] — 2026-04-05

### Added
- **Pet sprites** (`src/sprites/PetSprites.ts`): 16×16 pixel-art dog (brown) and cat (grey, green eyes).
- **PetEntity** (`src/entities/PetEntity.ts`): tile-based follow movement with 600 ms step interval; teleports to player if distance > 5 tiles; click-to-pet spawns floating hearts and increments happiness.
- **Dog adoption**: ForestScene cutscene on Day 10 (if no dog yet) — "A dog is whimpering nearby!" modal with [ADOPT] / [LEAVE] buttons. Dog is named "Buddy".
- **Dog crop-ready alert**: On each new-day event, if the player owns a dog and any crops are harvest-ready, a floating "Dog: N crops ready!" notification appears.
- **Cat adoption**: VillageScene offers a cat after 50 total items sold — "Mabel: This stray keeps visiting..." modal. Cat is named "Luna".
- **Cat sell bonus**: When Luna is in the player's party, all sell transactions in ShopPanel apply `sellMultiplier = 1.1` (+10% sell price).
- **Pet following in all scenes**: GameScene, ForestScene, VillageScene, MineScene all spawn saved pets on load and update them each frame.
- `ShopPanel.sellMultiplier` property (default 1.0) applied to both sell-price display and actual transaction.
- Pets are serialised through `SaveFile.pets` on every scene transition.

---

## [v0.8] — 2026-04-05

### Added
- **UnlockSystem** (`src/systems/UnlockSystem.ts`): static helpers `isForestUnlocked` (Day ≥ 7 + axe) and `isMineUnlocked` (lifetimeCoinsEarned ≥ 1000).
- **ForestScene** (`src/scenes/ForestScene.ts`): 20×15 map; 18 choppable trees (axe required, costs 3 energy, drops 1–3 wood); 6 harvestable berry bushes; south exit returns to farm; scene header "WHISPERING FOREST".
- **MineScene** (`src/scenes/MineScene.ts`): 20×15 map; 5 floors; rocks increase per floor; loot table (stone / iron ore / gold ore) biased by floor depth; ladder UP/DOWN navigation; pickaxe required to mine (costs 2 energy).
- **Items**: `axe` (200g from Rosa), `pickaxe` (300g from Rosa), `wood`, `stone`, `iron_ore`, `gold_ore`, `berry` items.
- **Environment sprites** (`src/sprites/EnvironmentSprites.ts`): `SPRITE_BERRY_BUSH`, `SPRITE_CAVE_ENTRANCE`, `SPRITE_MINE_ROCK`, `SPRITE_STUMP`; icon sprites for wood, berry, stone, iron ore, gold ore.
- **Axe and pickaxe icons** added to `ItemSprites.ts` / `ITEM_ICONS`.
- **Forest gate** in GameScene: north end of stone path; locked until Day 7 + axe; locked message "Day 7 + Axe needed" if attempted early.
- **Mine entrance** in VillageScene at tile (17,7): cave-entrance sprite; locked until 1000 lifetime coins; shows "Earn N more coins" if locked.
- `lifetimeCoinsEarned` and `lifetimeItemsSold` tracked and persisted in VillageScene / SaveFile.
- GameScene full north–south stone path (cols 14–15, rows 1–22).
- `SaveFile.unlockedAreas` field (was already in schema).
- ForestScene and MineScene registered in `main.ts`.

---

## [v0.7] — 2026-04-04

### Added
- **TutorialSystem** (`src/systems/TutorialSystem.ts`): state-machine with ~15 named steps advancing via `advanceIfAt(stepName)`.
- **TutorialPopup** (`src/ui/TutorialPopup.ts`): floating arrow + text overlay rendered in-scene; skippable via [SKIP] button; subscribes to scene-specific step names.
- Tutorial steps wired into GameScene (hoe, water, plant, sleep, harvest, village) and VillageScene (sell).
- Tutorial state persisted to `SaveFile.tutorialStep` across all scenes.

---

## [v0.6] — 2026-04-03

### Added
- **AnimalSystem** (`src/systems/AnimalSystem.ts`): chickens and cows; hunger (0–100); `advanceDay` produces egg/milk if hunger < 80; `feedAll()` resets hunger.
- **AnimalPanel** (`src/ui/AnimalPanel.ts`): lists all animals with hunger bar; [FEED] and [COLLECT] buttons.
- Barn + trough + processing stations placed in GameScene.
- Default save includes one chicken ("Clucky").
- **ProcessingSystem** (`src/systems/ProcessingSystem.ts`): 3 stations (churn, mill, oven); one active job per station; progress bar.
- **CraftingPanel** (`src/ui/CraftingPanel.ts`): shows available recipes and active-job progress; [START] / [COLLECT] buttons.
- Recipes: `milk → butter` (60 min), `wheat → flour` (30 min), `flour → bread` (120 min).
- Items: egg, milk, butter, flour, bread, jam, cheese, cow.
- `SaveFile.processingQueues` field; `getAbsoluteMinutes()` in GameScene.

---

## [v0.5] — 2026-04-02

### Added
- **VillageScene** (`src/scenes/VillageScene.ts`): 20×15 map; stone road; three NPCs (Mabel, Finn, Rosa); buildings.
- **DialogBox** (`src/ui/DialogBox.ts`): multi-line NPC dialog, click-to-advance.
- **ShopPanel** (`src/ui/ShopPanel.ts`): sell crops/resources; buy seeds/tools; coin tracking.
- `NPC_DIALOGS`, `NPC_HAS_SHOP`, `NPC_SHOP_STOCK` in `src/data/dialogs.ts`.
- Coin display in HUD (via `coins:changed` event).
- GameScene east-border transition to VillageScene; VillageScene west-gate return.
- `SaveFile.coins`, `SaveFile.lifetimeCoinsEarned`, `SaveFile.lifetimeItemsSold` fields.

---

## [v0.4] — 2026-04-01

### Added
- **MainMenuScene**: New Game / Continue buttons; save summary.
- **CharacterCustomScene**: 5 skin tones, 8 hair colours, 8 shirt colours; appearance stored in save.
- Palette-swap system: player sprite regenerated with chosen colours on load.
- `AppearanceSave` in SaveSchema; `refreshPlayerTextures` / `registerNPCTextures` in `PlayerTextureUtils`.

---

## [v0.3] — 2026-03-31

### Added
- **InventoryPanel** (24 slots) + **HotBar** (8 hotbar slots) with slot highlights and item icons.
- Hoe tool: click grass → dirt (costs 2 energy).
- Watering can: click dirt/crop → watered (costs 1 energy).
- Seed items (turnip, carrot, wheat, pumpkin, strawberry); plant on tilled/watered soil.
- **CropSystem** (`src/systems/CropSystem.ts`): growth stages; advance-on-new-day; harvest on click.
- **EnergySystem** (`src/systems/EnergySystem.ts`): 100-point bar; full restore on sleep.
- Energy bar in HotBar; Too-tired floating text.
- Crop sprites (per-type, per-stage) rendered in GameScene.
- `SaveFile.crops`, `SaveFile.tileOverrides`, `SaveFile.energy` fields.
- Farm plot (dirt tiles), pond (water), fence posts placed in GameScene.

---

## [v0.2] — 2026-03-30

### Added
- **TimeSystem** active: 1 real second = 1 game minute by default.
- Clock display in UIScene (6 AM → midnight); turns red after 9 PM.
- Midnight forced-sleep trigger via `time:midnight` event.
- Bed object in GameScene (click to sleep early).
- **SleepTransitionScene**: fade to black → "Day N" title card → `sleep:end` event.
- Autosave to `localStorage` on every sleep.
- `SaveFile.day`, `SaveFile.totalMinutes` persisted and restored on load.

---

## [v0.1] — 2026-03-29

### Added
- Vite 5 + TypeScript 5 strict + Phaser 3 project scaffold.
- `BootScene`: registers all pixel-art textures programmatically via `RenderTexture`.
- `GameScene`: 30×24 grass tile map; stone border; farmhouse; decorative trees; fence posts; village path.
- `Player` entity: 16×16 sprite with walk (4-frame) and idle animations in 4 directions.
- `MovementSystem`: A* pathfinding (`AStarPathfinder.ts`); smooth pixel-lerp between tiles; `PLAYER_SPEED_TILES_PER_SECOND` constant.
- `InteractionSystem`: left-click → move or interact; click-ring visual indicator.
- `UIScene` (parallel): day counter, tile coordinates (debug), version watermark.
- Camera lerp-follow with deadzone.
- `EventBus` typed pub/sub (`src/utils/EventBus.ts`).
- `ColorPalette` (DB32 subset) in `src/utils/ColorPalette.ts`.
- All terrain and UI sprites defined as `number[][]` pixel grids.
- `SaveManager` + `SaveSchema` (localStorage JSON).
