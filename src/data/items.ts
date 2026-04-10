export type ItemCategory = 'tool' | 'seed' | 'crop' | 'processed' | 'resource' | 'misc';

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  basePrice: number;      // sell price in coins
  buyPrice: number;       // shop buy price (0 = not buyable)
  stackable: boolean;
  maxStack: number;
  description: string;
}

export const ITEMS: Record<string, ItemDefinition> = {
  // ── Tools ──────────────────────────────────────────────────────────────────
  hoe: {
    id: 'hoe', name: 'Hoe', category: 'tool',
    basePrice: 0, buyPrice: 0, stackable: false, maxStack: 1,
    description: 'Till the soil to prepare it for planting.',
  },
  watering_can: {
    id: 'watering_can', name: 'Watering Can', category: 'tool',
    basePrice: 0, buyPrice: 0, stackable: false, maxStack: 1,
    description: 'Water your crops so they grow.',
  },
  axe: {
    id: 'axe', name: 'Axe', category: 'tool',
    basePrice: 0, buyPrice: 200, stackable: false, maxStack: 1,
    description: 'Chop trees in the forest.',
  },
  pickaxe: {
    id: 'pickaxe', name: 'Pickaxe', category: 'tool',
    basePrice: 0, buyPrice: 300, stackable: false, maxStack: 1,
    description: 'Mine ore in the mine.',
  },
  scythe: {
    id: 'scythe', name: 'Scythe', category: 'tool',
    basePrice: 0, buyPrice: 150, stackable: false, maxStack: 1,
    description: 'Harvest crops quickly.',
  },
  fishing_rod: {
    id: 'fishing_rod', name: 'Fishing Rod', category: 'tool',
    basePrice: 0, buyPrice: 100, stackable: false, maxStack: 1,
    description: 'Cast into water to catch fish.',
  },

  // ── Seeds ──────────────────────────────────────────────────────────────────
  turnip_seed: {
    id: 'turnip_seed', name: 'Turnip Seed', category: 'seed',
    basePrice: 5, buyPrice: 20, stackable: true, maxStack: 99,
    description: 'Plant in tilled soil. Grows in 3 days.',
  },
  carrot_seed: {
    id: 'carrot_seed', name: 'Carrot Seed', category: 'seed',
    basePrice: 8, buyPrice: 30, stackable: true, maxStack: 99,
    description: 'Plant in tilled soil. Grows in 4 days.',
  },
  wheat_seed: {
    id: 'wheat_seed', name: 'Wheat Seed', category: 'seed',
    basePrice: 6, buyPrice: 25, stackable: true, maxStack: 99,
    description: 'Grows into grain for bread-making. 5 days.',
  },
  pumpkin_seed: {
    id: 'pumpkin_seed', name: 'Pumpkin Seed', category: 'seed',
    basePrice: 20, buyPrice: 60, stackable: true, maxStack: 99,
    description: 'Big and valuable. Grows in 7 days.',
  },
  strawberry_seed: {
    id: 'strawberry_seed', name: 'Strawberry Seed', category: 'seed',
    basePrice: 15, buyPrice: 45, stackable: true, maxStack: 99,
    description: 'Sweet berries. Grows in 4 days.',
  },

  // ── Crops ──────────────────────────────────────────────────────────────────
  turnip: {
    id: 'turnip', name: 'Turnip', category: 'crop',
    basePrice: 35, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'A humble but tasty root vegetable.',
  },
  carrot: {
    id: 'carrot', name: 'Carrot', category: 'crop',
    basePrice: 50, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Crunchy and sweet. Mabel loves these.',
  },
  wheat: {
    id: 'wheat', name: 'Wheat', category: 'crop',
    basePrice: 25, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Can be milled into flour.',
  },
  pumpkin: {
    id: 'pumpkin', name: 'Pumpkin', category: 'crop',
    basePrice: 120, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'A large autumn squash. Very valuable.',
  },
  strawberry: {
    id: 'strawberry', name: 'Strawberry', category: 'crop',
    basePrice: 80, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Delicate and delicious.',
  },

  // ── Animal products ────────────────────────────────────────────────────────
  egg: {
    id: 'egg', name: 'Egg', category: 'crop',
    basePrice: 30, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Fresh from the henhouse.',
  },
  milk: {
    id: 'milk', name: 'Milk', category: 'crop',
    basePrice: 40, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Fresh cow milk.',
  },

  // ── Processed goods ────────────────────────────────────────────────────────
  butter: {
    id: 'butter', name: 'Butter', category: 'processed',
    basePrice: 100, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Churned from fresh milk. Rich and creamy.',
  },
  flour: {
    id: 'flour', name: 'Flour', category: 'processed',
    basePrice: 55, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Milled wheat. Essential for baking.',
  },
  bread: {
    id: 'bread', name: 'Bread', category: 'processed',
    basePrice: 180, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Freshly baked. The whole village loves it.',
  },
  jam: {
    id: 'jam', name: 'Berry Jam', category: 'processed',
    basePrice: 160, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Strawberry jam. Goes great with bread.',
  },
  cheese: {
    id: 'cheese', name: 'Cheese', category: 'processed',
    basePrice: 130, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Aged from milk. Village specialty.',
  },

  // ── Livestock ─────────────────────────────────────────────────────────────
  cow: {
    id: 'cow', name: 'Cow', category: 'misc',
    basePrice: 0, buyPrice: 500, stackable: false, maxStack: 1,
    description: 'A dairy cow. Bring her to the barn to produce milk each day.',
  },

  // ── Resources ──────────────────────────────────────────────────────────────
  wood: {
    id: 'wood', name: 'Wood', category: 'resource',
    basePrice: 15, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Chopped from forest trees.',
  },
  stone: {
    id: 'stone', name: 'Stone', category: 'resource',
    basePrice: 10, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Mined from the mine.',
  },
  iron_ore: {
    id: 'iron_ore', name: 'Iron Ore', category: 'resource',
    basePrice: 40, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Ore from deeper in the mine.',
  },
  gold_ore: {
    id: 'gold_ore', name: 'Gold Ore', category: 'resource',
    basePrice: 120, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Rare ore found deep underground.',
  },
  berry: {
    id: 'berry', name: 'Wild Berry', category: 'resource',
    basePrice: 20, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Foraged from the forest.',
  },
  fish: {
    id: 'fish', name: 'Fish', category: 'resource',
    basePrice: 45, buyPrice: 0, stackable: true, maxStack: 99,
    description: 'Caught from the pond with a fishing rod.',
  },
};

export function getItem(id: string): ItemDefinition {
  const item = ITEMS[id];
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}

/**
 * Seasonal price multipliers for sellable items.
 * Crops sell for a bonus in their native season; processed goods are stable.
 */
export const SEASONAL_PRICE_BONUS: Record<string, Partial<Record<string, number>>> = {
  turnip:     { spring: 1.3 },
  carrot:     { spring: 1.3 },
  strawberry: { summer: 1.4 },
  pumpkin:    { fall:   1.5 },
  egg:        { winter: 1.25 },
  milk:       { winter: 1.25 },
};

/** Returns the effective sell price after seasonal and any other multipliers. */
export function getEffectiveSellPrice(
  itemId: string,
  season: string,
  extraMultiplier = 1.0,
): number {
  const item = getItem(itemId);
  const seasonBonus = SEASONAL_PRICE_BONUS[itemId]?.[season] ?? 1.0;
  return Math.floor(item.basePrice * seasonBonus * extraMultiplier);
}
