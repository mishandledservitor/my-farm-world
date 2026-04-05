import { ProcessingQueueSave } from '../save/SaveSchema';

export interface ProcessingRecipe {
  stationType: string;
  inputItemId: string;
  outputItemId: string;
  durationMinutes: number;
}

export interface ProcessingJob {
  stationType: string;
  inputItemId: string;
  outputItemId: string;
  startTime: number;        // absolute game-minute when started
  durationMinutes: number;
}

/** One recipe per station for v0.6. */
export const RECIPES: ProcessingRecipe[] = [
  { stationType: 'churn', inputItemId: 'milk',  outputItemId: 'butter', durationMinutes: 60  },
  { stationType: 'mill',  inputItemId: 'wheat', outputItemId: 'flour',  durationMinutes: 30  },
  { stationType: 'oven',  inputItemId: 'flour', outputItemId: 'bread',  durationMinutes: 120 },
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
  startJob(stationType: string, inputItemId: string, absoluteMinute: number): ProcessingJob | null {
    if (!this.isIdle(stationType)) return null;
    const recipe = RECIPES.find(
      r => r.stationType === stationType && r.inputItemId === inputItemId,
    );
    if (!recipe) return null;
    const job: ProcessingJob = {
      stationType,
      inputItemId,
      outputItemId:    recipe.outputItemId,
      startTime:       absoluteMinute,
      durationMinutes: recipe.durationMinutes,
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
