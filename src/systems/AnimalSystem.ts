import { AnimalSave, IncubatingEggSave } from '../save/SaveSchema';

export interface Animal {
  id: string;
  animalType: 'chicken' | 'cow';
  name: string;
  hunger: number;       // 0 = full, 100 = starving
  produceReady: boolean;
}

export interface IncubatingEgg {
  id: string;
  daysRemaining: number;
}

const PRODUCE_ITEM: Record<string, string> = {
  chicken: 'egg',
  cow:     'milk',
};

const INCUBATION_DAYS = 3;
const CHICKEN_NAMES = ['Clucky', 'Henrietta', 'Peck', 'Noodle', 'Sunny', 'Omelette'];

export class AnimalSystem {
  private animals: Animal[] = [];
  private incubating: IncubatingEgg[] = [];

  getAll(): Animal[] { return this.animals; }

  getAnimal(id: string): Animal | undefined {
    return this.animals.find(a => a.id === id);
  }

  addAnimal(animalType: 'chicken' | 'cow', name: string): void {
    const id = `${animalType}-${Date.now()}`;
    this.animals.push({ id, animalType, name, hunger: 0, produceReady: false });
  }

  feed(animalId: string): void {
    const animal = this.getAnimal(animalId);
    if (animal) animal.hunger = 0;
  }

  rename(animalId: string, newName: string): void {
    const animal = this.getAnimal(animalId);
    if (animal) animal.name = newName;
  }

  feedAll(): void {
    for (const a of this.animals) a.hunger = 0;
  }

  /** Collect produce from one animal; returns item ID or null. */
  collectProduce(animalId: string): string | null {
    const animal = this.getAnimal(animalId);
    if (!animal || !animal.produceReady) return null;
    animal.produceReady = false;
    return PRODUCE_ITEM[animal.animalType] ?? null;
  }

  /** Called once per day (from sleep:end handler in GameScene). */
  advanceDay(): void {
    for (const a of this.animals) {
      // Produce if not starving (hunger < 60 before today's increase)
      if (a.hunger < 60) a.produceReady = true;
      a.hunger = Math.min(100, a.hunger + 30);
    }
    // Advance incubating eggs and hatch any that are ready.
    const stillIncubating: IncubatingEgg[] = [];
    for (const egg of this.incubating) {
      const next = egg.daysRemaining - 1;
      if (next <= 0) {
        const name = CHICKEN_NAMES[Math.floor(Math.random() * CHICKEN_NAMES.length)];
        this.addAnimal('chicken', name);
      } else {
        stillIncubating.push({ ...egg, daysRemaining: next });
      }
    }
    this.incubating = stillIncubating;
  }

  // ── Incubation ────────────────────────────────────────────────────────────

  getIncubating(): IncubatingEgg[] { return this.incubating; }

  startIncubation(): void {
    this.incubating.push({
      id: `egg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      daysRemaining: INCUBATION_DAYS,
    });
  }

  serialize(): AnimalSave[] {
    return this.animals.map(a => ({ ...a }));
  }

  serializeIncubating(): IncubatingEggSave[] {
    return this.incubating.map(e => ({ ...e }));
  }

  deserialize(saves: AnimalSave[]): void {
    this.animals = saves.map(s => ({
      id:           s.id,
      animalType:   s.animalType as 'chicken' | 'cow',
      name:         s.name,
      hunger:       s.hunger,
      produceReady: s.produceReady,
    }));
  }

  deserializeIncubating(saves: IncubatingEggSave[] | undefined): void {
    this.incubating = (saves ?? []).map(s => ({ id: s.id, daysRemaining: s.daysRemaining }));
  }
}
