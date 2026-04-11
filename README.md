# My Farm World

A peaceful farming life simulation built with Phaser 3 and TypeScript — inspired by Stardew Valley. Grow crops, raise animals, craft goods, explore the forest and mine, and befriend the village.

**No external assets.** All graphics are drawn programmatically via pixel-art arrays at boot time.

---

## Features

- **Farming** — Till, water, plant, and harvest crops across four seasons.
- **Weather** — Random daily weather (sunny, cloudy, rainy). Rain auto-waters all tilled soil.
- **Sprinklers** — Buy and place sprinklers to auto-water a 5×5 area every morning. Click to pick up.
- **Compost & fertilizer** — Compost crops into fertilizer; apply to instantly advance crop growth.
- **Animals** — A chicken in your barn from Day 1; buy a cow from Mabel. Incubate eggs to hatch new chickens. Rename your animals.
- **Processing** — Churn butter and cheese, mill flour, bake bread, make jam and jam sandwiches in the farmhouse oven.
- **Village** — Sell goods to Mabel (with seasonal price bonuses), buy tools from Rosa, chat with Finn.
- **Fishing** — Buy a fishing rod from Rosa and catch fish from the farm pond.
- **Unlockable areas** — Whispering Forest (Day 7 + axe) and the Mine (1 000 lifetime coins earned).
- **Pets** — Adopt Buddy the dog (Forest, Day 10) and Luna the cat (50 items sold). Dogs follow you everywhere; cats stay home in the farmhouse. Both grant passive bonuses.
- **Farmhouse** — Enter your farmhouse to sleep and cook at the oven; interior room with bed, oven, and exit.
- **Seasons** — 30-day seasons cycling Spring → Summer → Fall → Winter with a season-complete card each cycle.
- **Inventory** — 24-slot backpack panel to view and rearrange all items.
- **Save / load** — Auto-saves on every sleep; export/import saves as JSON files; in-game `[ SAVE FILE ]` button for quick export.
- **Pastel art style** — Soft pastel colours, black outlines, and drop shadows on all sprites.
- **Tutorial** — Step-by-step guidance on the first playthrough.
- **Point-and-click only** — No keyboard required.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node)

### Install & run (one command)

```bash
./install-and-run.sh
```

This installs dependencies and starts the development server. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Or step by step

```bash
npm install
npm run dev
```

### macOS launcher (after first install)

Double-click **`Launch My Farm World.command`** in Finder to start the dev server and open the game in your browser automatically.

---

## Controls

| Action | Input |
|---|---|
| Move player | Left-click anywhere |
| Interact / harvest / chop / mine / fish | Left-click on object |
| Enter/exit farmhouse | Click farmhouse / walk to EXIT door |
| Open inventory | Click BAG icon (HUD) |
| Open crafting | Click anvil icon (HUD) |
| Pet your pet | Left-click on pet |
| Advance dialog | Left-click |
| Sleep | Enter farmhouse, click the bed |

---

## Development

```bash
npm run dev       # start dev server with hot-reload (port 3000)
npm run build     # production build → dist/
npm run preview   # preview production build locally
npm test          # run unit tests (Vitest)
```

### Project layout

```
src/
  constants/      game config (tile size, canvas dimensions, scale)
  data/           items, crops, animals, recipes, dialogs
  entities/       Player, Crop, Animal, Pet, NPC, ProcessingStation
  save/           SaveSchema, SaveManager, MigrationRegistry
  scenes/         BootScene, MainMenuScene, CharacterCustomScene,
                  GameScene, FarmhouseScene, VillageScene, ForestScene,
                  MineScene, UIScene, SleepTransitionScene
  sprites/        pixel-art arrays for every game object
  systems/        TimeSystem, CropSystem, AnimalSystem, ProcessingSystem,
                  InventorySystem, WeatherSystem, UnlockSystem, TutorialSystem
  ui/             ShopPanel, CraftingPanel, InventoryPanel, DialogBox,
                  HotBar, TutorialPopup
  utils/          AStarPathfinder, EventBus, SeasonUtils, PixelArtUtils
tests/            Vitest unit tests (38 tests)
```

See [DESIGN.md](DESIGN.md) for full architecture documentation and [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Crop & price reference

| Crop | Season | Grow time | Base sell | Season bonus |
|---|---|---|---|---|
| Turnip | Spring | 3 days | 35g | Spring ×1.3 |
| Carrot | Spring | 4 days | 50g | Spring ×1.3 |
| Wheat | Any | 5 days | 25g | — |
| Strawberry | Summer | 4 days | 80g | Summer ×1.4 |
| Pumpkin | Fall | 7 days | 120g | Fall ×1.5 |

| Animal product | Source | Base sell |
|---|---|---|
| Egg | Chicken (daily) | 30g |
| Milk | Cow (daily) | 40g |

| Processed good | Recipe | Base sell |
|---|---|---|
| Butter | Milk → Churn (1hr) | 100g |
| Cheese | Milk → Churn (3hr) | 130g |
| Flour | Wheat → Mill (30 min) | 55g |
| Bread | Flour → Oven (2hr) | 180g |
| Berry Jam | Strawberry or Berry → Oven (90 min) | 160g |
| Jam Sandwich | Bread + Jam → Oven (30 min) | 400g |

**Cat bonus:** +10% to all sell prices when Luna is your pet.
**Tools are sellable:** Hoe 25g, Watering Can 25g, Fishing Rod 50g, Scythe 75g, Axe 100g, Pickaxe 150g, Sprinkler 100g.

---

## Deployment

The game is a fully static site — no server required.

- **Netlify**: Push to GitHub and connect via Netlify. The included `netlify.toml` handles build settings automatically. See [DEPLOY.md](DEPLOY.md) for step-by-step instructions.
- **Any static host**: Run `npm run build` and serve the `dist/` folder.

---

## Version

Current release: **v1.6.0** — see [CHANGELOG.md](CHANGELOG.md) for full history.
