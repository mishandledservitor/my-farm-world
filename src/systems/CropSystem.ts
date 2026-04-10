import { EventBus } from '../utils/EventBus';
import { CROPS, getCropBySeed } from '../data/crops';
import { CropSave } from '../save/SaveSchema';
import { SeasonName } from '../utils/SeasonUtils';

export interface CropTile {
  tileX: number;
  tileY: number;
  cropType: string;
  growthStage: number;   // 0 = just planted, grows to max stage = ready to harvest
  wateredToday: boolean;
  daysPlanted: number;   // total days since planting
}

export class CropSystem {
  private crops: Map<string, CropTile> = new Map(); // key = "x,y"

  private static key(x: number, y: number): string {
    return `${x},${y}`;
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  getCrop(tileX: number, tileY: number): CropTile | null {
    return this.crops.get(CropSystem.key(tileX, tileY)) ?? null;
  }

  isOccupied(tileX: number, tileY: number): boolean {
    return this.crops.has(CropSystem.key(tileX, tileY));
  }

  getAllCrops(): CropTile[] {
    return Array.from(this.crops.values());
  }

  isReadyToHarvest(tileX: number, tileY: number): boolean {
    const crop = this.getCrop(tileX, tileY);
    if (!crop) return false;
    const def = CROPS[crop.cropType];
    return crop.growthStage >= def.stages;
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  plant(tileX: number, tileY: number, seedItemId: string): boolean {
    const def = getCropBySeed(seedItemId);
    if (!def) return false;
    if (this.isOccupied(tileX, tileY)) return false;

    const crop: CropTile = {
      tileX, tileY,
      cropType: def.id,
      growthStage: 0,
      wateredToday: false,
      daysPlanted: 0,
    };
    this.crops.set(CropSystem.key(tileX, tileY), crop);
    EventBus.emit('crop:planted', { tileX, tileY, cropType: def.id });
    return true;
  }

  water(tileX: number, tileY: number): boolean {
    const crop = this.getCrop(tileX, tileY);
    if (!crop) return false;
    crop.wateredToday = true;
    EventBus.emit('crop:watered', { tileX, tileY });
    return true;
  }

  harvest(tileX: number, tileY: number): string | null {
    const crop = this.getCrop(tileX, tileY);
    if (!crop) return null;
    const def = CROPS[crop.cropType];
    if (crop.growthStage < def.stages) return null;

    const harvestId = def.harvestItemId;

    if (def.regrows) {
      crop.growthStage = def.stages - 1;
      crop.wateredToday = false;
    } else {
      this.crops.delete(CropSystem.key(tileX, tileY));
    }

    EventBus.emit('crop:harvested', { tileX, tileY, cropType: crop.cropType });
    return harvestId;
  }

  /** Advance a crop by one growth stage (fertilizer boost). Returns true if successful. */
  boostGrowth(tileX: number, tileY: number): boolean {
    const crop = this.getCrop(tileX, tileY);
    if (!crop) return false;
    const def = CROPS[crop.cropType];
    if (crop.growthStage >= def.stages) return false;
    crop.growthStage++;
    return true;
  }

  // ── Called once per day (on 'new-day' event) ──────────────────────────────

  /**
   * Advance all crops by one day.
   * @param currentSeason — the season of the NEW day; out-of-season crops wither.
   * @returns array of tile keys ("x,y") for crops that withered (so caller can remove sprites)
   */
  advanceDay(currentSeason?: SeasonName): string[] {
    const withered: string[] = [];
    for (const [key, crop] of this.crops.entries()) {
      const def = CROPS[crop.cropType];

      // Wither check: if season just changed and this crop isn't 'any' and doesn't match
      if (currentSeason && def.season !== 'any' && def.season !== currentSeason) {
        withered.push(key);
        this.crops.delete(key);
        EventBus.emit('crop:withered', { tileX: crop.tileX, tileY: crop.tileY });
        continue;
      }

      if (crop.wateredToday && crop.growthStage < def.stages) {
        crop.growthStage++;
      }
      crop.wateredToday = false;
      crop.daysPlanted++;
    }
    return withered;
  }

  /** True if a seed can be planted in the given season. */
  static canPlantInSeason(seedItemId: string, season: SeasonName): boolean {
    const def = getCropBySeed(seedItemId);
    if (!def) return false;
    return def.season === 'any' || def.season === season;
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): CropSave[] {
    return Array.from(this.crops.values()).map(c => ({
      tileX: c.tileX,
      tileY: c.tileY,
      cropType: c.cropType,
      growthStage: c.growthStage,
      wateredToday: c.wateredToday,
    }));
  }

  deserialize(saves: CropSave[]): void {
    this.crops.clear();
    for (const s of saves) {
      this.crops.set(CropSystem.key(s.tileX, s.tileY), {
        tileX: s.tileX,
        tileY: s.tileY,
        cropType: s.cropType,
        growthStage: s.growthStage,
        wateredToday: s.wateredToday,
        daysPlanted: 0,
      });
    }
  }
}
