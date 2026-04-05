import { EventBus } from '../utils/EventBus';

export interface TutorialStep {
  id: string;
  text: string;
  arrow?: string;       // directional hint character
  arrowHint?: string;   // label next to arrow
  isManual?: boolean;   // player must click OK to advance
  scenes: string[];     // which scene(s) display this step
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    text: 'Welcome to My Farm World!\nYou\'re a brand-new farmer. The land is yours.\nClick [OK] to begin your journey.',
    isManual: true,
    scenes: ['GameScene'],
  },
  {
    id: 'hoe',
    text: 'Step 1 — Till the soil.\nSlot 1 of your HotBar holds the HOE.\nClick a grass tile to create farmland.',
    arrow: '↓', arrowHint: 'HotBar below',
    scenes: ['GameScene'],
  },
  {
    id: 'water',
    text: 'Step 2 — Water the soil.\nSelect the WATERING CAN (slot 2).\nClick the tilled dirt tile to water it.',
    scenes: ['GameScene'],
  },
  {
    id: 'plant',
    text: 'Step 3 — Plant a crop.\nSelect a SEED PACKET from the HotBar.\nClick watered soil to plant.',
    scenes: ['GameScene'],
  },
  {
    id: 'sleep',
    text: 'Step 4 — Sleep to grow crops.\nWalk to the farmhouse and click the BED.\nCrops advance one growth stage per day.',
    arrow: '↓', arrowHint: 'Farmhouse nearby',
    scenes: ['GameScene'],
  },
  {
    id: 'harvest',
    text: 'Step 5 — Harvest your crop!\nWhen it\'s fully grown, click it to collect.\nThe icon turns bright when ready.',
    scenes: ['GameScene'],
  },
  {
    id: 'village',
    text: 'Step 6 — Head to the village.\nWalk to the right edge of the farm (rows 9–12).\nYou\'ll find the village market there.',
    arrow: '→', arrowHint: 'Village gate right',
    scenes: ['GameScene'],
  },
  {
    id: 'sell',
    text: 'Step 7 — Sell your goods!\nTalk to Mabel at the far-right building.\nSell crops and buy more seeds with coins.',
    scenes: ['VillageScene'],
  },
  {
    id: 'complete',
    text: 'Tutorial complete! You\'re a real farmer now.\nRaise animals, craft goods, and explore the land.\nGood luck — your homestead awaits!',
    isManual: true,
    scenes: ['GameScene', 'VillageScene'],
  },
];

export const TUTORIAL_SKIPPED = 999;

export class TutorialSystem {
  private step: number;

  constructor(savedStep = 0) {
    this.step = savedStep;
  }

  isComplete(): boolean {
    return this.step >= TUTORIAL_STEPS.length || this.step === TUTORIAL_SKIPPED;
  }

  getCurrentStep(): TutorialStep | null {
    if (this.isComplete()) return null;
    return TUTORIAL_STEPS[this.step] ?? null;
  }

  getStepIndex(): number  { return this.step; }
  getTotalSteps(): number { return TUTORIAL_STEPS.length; }

  /**
   * Advance to the next step ONLY if the current step matches `stepId`.
   * Returns true when it advances.
   */
  advanceIfAt(stepId: string): boolean {
    if (this.getCurrentStep()?.id !== stepId) return false;
    this.step++;
    EventBus.emit('tutorial:step', { step: this.step });
    return true;
  }

  /** Advance unconditionally (used by manual "OK" button). */
  advance(): void {
    if (!this.isComplete()) {
      this.step++;
      EventBus.emit('tutorial:step', { step: this.step });
    }
  }

  skip(): void {
    this.step = TUTORIAL_SKIPPED;
    EventBus.emit('tutorial:step', { step: this.step });
  }

  serialize(): number { return this.step; }
}
