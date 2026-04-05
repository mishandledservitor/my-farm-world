import { SaveFile } from '../save/SaveSchema';

/** Static helpers that evaluate area-unlock conditions from a SaveFile snapshot. */
export class UnlockSystem {
  /** Forest unlocks on Day 7 once the player owns an axe. */
  static isForestUnlocked(save: SaveFile): boolean {
    return save.day >= 7 && save.inventory.some(slot => slot.itemId === 'axe');
  }

  /** Mine unlocks after 1 000 lifetime coins earned through selling. */
  static isMineUnlocked(save: SaveFile): boolean {
    return save.lifetimeCoinsEarned >= 1000;
  }
}
