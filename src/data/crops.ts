export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'any';

export interface CropDefinition {
  id: string;
  seedItemId: string;
  harvestItemId: string;
  harvestCount: number;    // items yielded on harvest
  growthDays: number;      // days to full growth (each day = 1 sleep)
  stages: number;          // visible growth stages (usually 3-4)
  season: Season;
  regrows: boolean;        // does it regrow after harvest without replanting?
  regrowDays: number;      // days between regrows (0 if not regrows)
  energyCost: number;      // energy to plant
}

export const CROPS: Record<string, CropDefinition> = {
  turnip: {
    id: 'turnip', seedItemId: 'turnip_seed', harvestItemId: 'turnip',
    harvestCount: 1, growthDays: 3, stages: 3,
    season: 'spring', regrows: false, regrowDays: 0, energyCost: 3,
  },
  carrot: {
    id: 'carrot', seedItemId: 'carrot_seed', harvestItemId: 'carrot',
    harvestCount: 1, growthDays: 4, stages: 4,
    season: 'spring', regrows: false, regrowDays: 0, energyCost: 3,
  },
  wheat: {
    id: 'wheat', seedItemId: 'wheat_seed', harvestItemId: 'wheat',
    harvestCount: 2, growthDays: 5, stages: 4,
    season: 'any', regrows: false, regrowDays: 0, energyCost: 3,
  },
  pumpkin: {
    id: 'pumpkin', seedItemId: 'pumpkin_seed', harvestItemId: 'pumpkin',
    harvestCount: 1, growthDays: 7, stages: 4,
    season: 'fall', regrows: false, regrowDays: 0, energyCost: 4,
  },
  strawberry: {
    id: 'strawberry', seedItemId: 'strawberry_seed', harvestItemId: 'strawberry',
    harvestCount: 2, growthDays: 4, stages: 3,
    season: 'summer', regrows: true, regrowDays: 2, energyCost: 3,
  },
};

export function getCropBySeed(seedItemId: string): CropDefinition | null {
  return Object.values(CROPS).find(c => c.seedItemId === seedItemId) ?? null;
}
