import { EventBus } from '../utils/EventBus';

export const MAX_ENERGY = 100;

export class EnergySystem {
  private energy: number;

  constructor(startEnergy = MAX_ENERGY) {
    this.energy = startEnergy;
  }

  get current(): number { return this.energy; }
  get max(): number { return MAX_ENERGY; }
  get fraction(): number { return this.energy / MAX_ENERGY; }
  get isExhausted(): boolean { return this.energy <= 0; }

  spend(amount: number): boolean {
    if (this.energy < amount) return false;
    this.energy = Math.max(0, this.energy - amount);
    EventBus.emit('inventory:changed', {}); // triggers UI refresh
    return true;
  }

  restore(amount = MAX_ENERGY): void {
    this.energy = Math.min(MAX_ENERGY, this.energy + amount);
  }

  fullRestore(): void {
    this.energy = MAX_ENERGY;
  }

  serialize(): number { return this.energy; }

  static deserialize(val: number): EnergySystem {
    return new EnergySystem(val);
  }
}
