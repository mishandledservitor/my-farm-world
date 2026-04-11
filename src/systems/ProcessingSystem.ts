import { ProcessingQueueSave } from '../save/SaveSchema';

export interface ProcessingRecipe {
  stationType: string;
  inputItemId: string;
  /** Optional second ingredient required by multi-input recipes (e.g. jam sandwich). */
  extraInputItemId?: string;
  outputItemId: string;
  durationMinutes: number;
}

export interface ProcessingJob {
  stationType: string;
  inputItemId: string;
  /** Set when the recipe that started this job had a second ingredient. */
  extraInputItemId?: string;
  outputItemId: string;
  startTime: number;        // absolute game-minute when started
  durationMinutes: number;
}

export const RECIPES: ProcessingRecipe[] = [
  // Churn
  { stationType: 'churn', inputItemId: 'milk',       outputItemId: 'butter',     durationMinutes: 60  },
  { stationType: 'churn', inputItemId: 'milk',       outputItemId: 'cheese',     durationMinutes: 180 },
  // Mill
  { stationType: 'mill',  inputItemId: 'wheat',      outputItemId: 'flour',      durationMinutes: 30  },
  // Oven
  { stationType: 'oven',  inputItemId: 'flour',      outputItemId: 'bread',      durationMinutes: 120 },
  { stationType: 'oven',  inputItemId: 'strawberry', outputItemId: 'jam',        durationMinutes: 90  },
  { stationType: 'oven',  inputItemId: 'berry',      outputItemId: 'jam',        durationMinutes: 90  },
  { stationType: 'oven',  inputItemId: 'bread',      extraInputItemId: 'jam',   outputItemId: 'jam_sandwich', durationMinutes: 30 },
  // Compost bin
  { stationType: 'compost', inputItemId: 'turnip',     outputItemId: 'fertilizer', durationMinutes: 60  },
  { stationType: 'compost', inputItemId: 'carrot',     outputItemId: 'fertilizer', durationMinutes: 60  },
  { stationType: 'compost', inputItemId: 'wheat',      outputItemId: 'fertilizer', durationMinutes: 60  },
  { stationType: 'compost', inputItemId: 'pumpkin',    outputItemId: 'fertilizer', durationMinutes: 60  },
  { stationType: 'compost', inputItemId: 'strawberry', outputItemId: 'fertilizer', durationMinutes: 60  },
  { stationType: 'compost', inputItemId: 'berry',      outputItemId: 'fertilizer', durationMinutes: 45  },
];

export class ProcessingSystem {
  /** One active job per station type. */
  private jobs: Map<string, ProcessingJob> = new Map();

  getRecipesForStation(stationType: string): ProcessingRecipe[] {
    return RECIPES.filter(r => r.stationType === stationType);
  }

  getJob(stationType: string): ProcessingJob | undefined {
    return this.jobs.get(stationType);
  }

  isIdle(stationType: string): boolean {
    return !this.jobs.has(stationType);
  }

  /** Start a new job; returns the job or null if station busy or recipe unknown. */
  startJob(stationType: string, inputItemId: string, absoluteMinute: number, outputItemId?: string): ProcessingJob | null {
    if (!this.isIdle(stationType)) return null;
    const recipe = RECIPES.find(r =>
      r.stationType === stationType &&
      r.inputItemId === inputItemId &&
      (outputItemId === undefined || r.outputItemId === outputItemId),
    );
    if (!recipe) return null;
    const job: ProcessingJob = {
      stationType,
      inputItemId,
      extraInputItemId: recipe.extraInputItemId,
      outputItemId:     recipe.outputItemId,
      startTime:        absoluteMinute,
      durationMinutes:  recipe.durationMinutes,
    };
    this.jobs.set(stationType, job);
    return job;
  }

  isComplete(stationType: string, currentAbsoluteMinute: number): boolean {
    const job = this.jobs.get(stationType);
    if (!job) return false;
    return (currentAbsoluteMinute - job.startTime) >= job.durationMinutes;
  }

  /** Remove job and return the output item ID (or null if no job). */
  collectOutput(stationType: string): string | null {
    const job = this.jobs.get(stationType);
    if (!job) return null;
    this.jobs.delete(stationType);
    return job.outputItemId;
  }

  /** 0..1 fraction of completion. */
  getProgressFraction(stationType: string, currentAbsoluteMinute: number): number {
    const job = this.jobs.get(stationType);
    if (!job) return 0;
    const elapsed = currentAbsoluteMinute - job.startTime;
    return Math.min(1, elapsed / job.durationMinutes);
  }

  serialize(): ProcessingQueueSave[] {
    const result: ProcessingQueueSave[] = [];
    for (const job of this.jobs.values()) {
      result.push({ ...job });
    }
    return result;
  }

  deserialize(saves: ProcessingQueueSave[]): void {
    this.jobs.clear();
    for (const s of saves) {
      this.jobs.set(s.stationType, { ...s });
    }
  }
}
