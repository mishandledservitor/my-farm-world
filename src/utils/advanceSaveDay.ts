/**
 * Pure function that advances a SaveFile by one day.
 *
 * Mirrors the logic in GameScene.handleNewDay but operates solely on
 * serialised save data so it can be called from any scene (e.g. FarmhouseScene)
 * without needing the live Phaser game state.
 */

import { CropSave, SaveFile, TileOverrideSave, TileUntendedSave } from '../save/SaveSchema';
import { CROPS } from '../data/crops';
import { WeatherSystem, WeatherType } from '../systems/WeatherSystem';

// Mirror of GameScene TILE constants — kept local to avoid a cross-scene import.
const TILE_DIRT         = 1;
const TILE_WATERED_DIRT = 2;

export function advanceSaveDay(save: SaveFile): SaveFile {
  // 1. Roll new weather for the coming day.
  const newWeather: WeatherType = WeatherSystem.rollWeather();

  // 2. Advance crops: watered crops grow by one stage; reset wateredToday.
  //    (Season-wither check is intentionally skipped here, matching GameScene.)
  const cropMap = new Map<string, CropSave>();
  for (const c of save.crops) {
    const def = CROPS[c.cropType];
    const grew = c.wateredToday && c.growthStage < (def?.stages ?? 3);
    cropMap.set(`${c.tileX},${c.tileY}`, {
      ...c,
      growthStage: grew ? c.growthStage + 1 : c.growthStage,
      wateredToday: false,
    });
  }

  // 3. Build mutable tile map from tileOverrides.
  const tileMap = new Map<string, number>();
  for (const t of save.tileOverrides) {
    tileMap.set(`${t.tileX},${t.tileY}`, t.tileId);
  }

  // 4. Dry out watered tiles: WATERED_DIRT → DIRT.
  for (const [key, id] of tileMap) {
    if (id === TILE_WATERED_DIRT) tileMap.set(key, TILE_DIRT);
  }

  // 5. Rain auto-watering: all DIRT tiles become WATERED_DIRT and their crops
  //    are marked wateredToday so they grow the following night.
  if (newWeather === 'rainy') {
    for (const [key, id] of tileMap) {
      if (id === TILE_DIRT) {
        tileMap.set(key, TILE_WATERED_DIRT);
        const crop = cropMap.get(key);
        if (crop) crop.wateredToday = true;
      }
    }
  }

  // 6. Sprinkler auto-watering: each sprinkler waters a 5x5 area centered on itself.
  for (const sp of save.sprinklers) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nk = `${sp.tileX + dx},${sp.tileY + dy}`;
        if (tileMap.get(nk) === TILE_DIRT) {
          tileMap.set(nk, TILE_WATERED_DIRT);
          const crop = cropMap.get(nk);
          if (crop) crop.wateredToday = true;
        }
      }
    }
  }

  // 7. Track untended tilled tiles; revert to grass after 3 un-cropped days.
  const occupiedTiles = new Set(cropMap.keys());
  const untendedMap = new Map<string, number>();
  for (const u of save.tileUntendedDays) {
    untendedMap.set(`${u.tileX},${u.tileY}`, u.days);
  }

  for (const [key, id] of tileMap) {
    if (id === TILE_DIRT && !occupiedTiles.has(key)) {
      const days = (untendedMap.get(key) ?? 0) + 1;
      if (days >= 3) {
        tileMap.delete(key);       // revert to default grass
        untendedMap.delete(key);
      } else {
        untendedMap.set(key, days);
      }
    } else {
      untendedMap.delete(key);
    }
  }

  // Rebuild serialised arrays.
  const newTileOverrides: TileOverrideSave[] = [];
  for (const [key, id] of tileMap) {
    const [tileX, tileY] = key.split(',').map(Number);
    newTileOverrides.push({ tileX, tileY, tileId: id });
  }

  const newTileUntendedDays: TileUntendedSave[] = [];
  for (const [key, days] of untendedMap) {
    const [tileX, tileY] = key.split(',').map(Number);
    newTileUntendedDays.push({ tileX, tileY, days });
  }

  return {
    ...save,
    weather:          newWeather,
    crops:            Array.from(cropMap.values()),
    tileOverrides:    newTileOverrides,
    tileUntendedDays: newTileUntendedDays,
  };
}
