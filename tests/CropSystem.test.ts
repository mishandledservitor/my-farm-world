import { describe, it, expect, beforeEach } from 'vitest';
import { CropSystem } from '../src/systems/CropSystem';

describe('CropSystem', () => {
  let sys: CropSystem;

  beforeEach(() => {
    sys = new CropSystem();
  });

  // ── planting ────────────────────────────────────────────────────────────────

  it('plants a crop at tile', () => {
    const ok = sys.plant(5, 5, 'turnip_seed');
    expect(ok).toBe(true);
    expect(sys.isOccupied(5, 5)).toBe(true);
  });

  it('cannot plant on occupied tile', () => {
    sys.plant(5, 5, 'turnip_seed');
    const ok = sys.plant(5, 5, 'carrot_seed');
    expect(ok).toBe(false);
  });

  // ── watering & growth ───────────────────────────────────────────────────────

  it('crop grows by 1 stage when watered and day advances', () => {
    sys.plant(5, 5, 'turnip_seed');
    sys.water(5, 5);
    sys.advanceDay('spring');
    const crop = sys.getCrop(5, 5);
    expect(crop?.growthStage).toBe(1);
  });

  it('crop does not grow if not watered', () => {
    sys.plant(5, 5, 'turnip_seed');
    sys.advanceDay('spring');
    expect(sys.getCrop(5, 5)?.growthStage).toBe(0);
  });

  it('marks crop ready after enough watered days', () => {
    sys.plant(5, 5, 'turnip_seed'); // 3 growth days
    for (let d = 0; d < 3; d++) {
      sys.water(5, 5);
      sys.advanceDay('spring');
    }
    expect(sys.isReadyToHarvest(5, 5)).toBe(true);
  });

  // ── harvest ─────────────────────────────────────────────────────────────────

  it('harvest returns item id and removes non-regrow crop', () => {
    sys.plant(5, 5, 'turnip_seed');
    for (let d = 0; d < 3; d++) { sys.water(5, 5); sys.advanceDay('spring'); }
    const result = sys.harvest(5, 5);
    expect(result).toBe('turnip');
    expect(sys.isOccupied(5, 5)).toBe(false);
  });

  it('harvest returns null if crop not ready', () => {
    sys.plant(5, 5, 'turnip_seed');
    expect(sys.harvest(5, 5)).toBeNull();
  });

  // ── season withering ────────────────────────────────────────────────────────

  it('spring crop withers when summer arrives', () => {
    sys.plant(5, 5, 'turnip_seed'); // spring crop
    const withered = sys.advanceDay('summer');
    expect(withered).toContain('5,5');
    expect(sys.isOccupied(5, 5)).toBe(false);
  });

  it('any-season crop does NOT wither in summer', () => {
    sys.plant(5, 5, 'wheat_seed'); // season: any
    const withered = sys.advanceDay('summer');
    expect(withered).not.toContain('5,5');
    expect(sys.isOccupied(5, 5)).toBe(true);
  });

  it('fall crop withers in spring', () => {
    sys.plant(5, 5, 'pumpkin_seed'); // fall crop
    const withered = sys.advanceDay('spring');
    expect(withered).toContain('5,5');
  });

  // ── canPlantInSeason ────────────────────────────────────────────────────────

  it('allows planting spring seed in spring', () => {
    expect(CropSystem.canPlantInSeason('turnip_seed', 'spring')).toBe(true);
  });

  it('disallows planting spring seed in summer', () => {
    expect(CropSystem.canPlantInSeason('turnip_seed', 'summer')).toBe(false);
  });

  it('allows planting any-season seed in any season', () => {
    for (const s of ['spring', 'summer', 'fall', 'winter'] as const) {
      expect(CropSystem.canPlantInSeason('wheat_seed', s)).toBe(true);
    }
  });

  it('returns false for unknown seed', () => {
    expect(CropSystem.canPlantInSeason('unknown_seed', 'spring')).toBe(false);
  });

  // ── serialization ────────────────────────────────────────────────────────────

  it('round-trips through serialize/deserialize', () => {
    sys.plant(1, 2, 'turnip_seed');
    sys.water(1, 2);
    sys.advanceDay('spring');

    const saved = sys.serialize();
    const sys2  = new CropSystem();
    sys2.deserialize(saved);

    const crop = sys2.getCrop(1, 2);
    expect(crop?.growthStage).toBe(1);
    expect(crop?.cropType).toBe('turnip');
  });
});
