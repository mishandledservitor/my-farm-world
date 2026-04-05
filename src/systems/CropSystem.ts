import { EventBus } from '../utils/EventBus';
import { CROPS, getCropBySeed } from '../data/crops';
import { CropSave } from '../save/SaveSchema';

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

  // ── Called once per day (on 'new-day' event) ──────────────────────────────

  advanceDay(): void {
    for (const crop of this.crops.values()) {
      if (crop.wateredToday) {
        const def = CROPS[crop.cropType];
        if (crop.growthStage < def.stages) {
          crop.growthStage++;
          if (crop.growthStage >= def.stages) {
            // Emit "dog alert" in v0.9 — for now just log
          }
        }
      }
      crop.wateredToday = false;
      crop.daysPlanted++;
    }
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
