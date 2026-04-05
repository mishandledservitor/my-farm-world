import { describe, it, expect } from 'vitest';
import { UnlockSystem } from '../src/systems/UnlockSystem';
import { defaultSave } from '../src/save/SaveSchema';

describe('UnlockSystem.isForestUnlocked', () => {
  it('locked before day 7', () => {
    const save = { ...defaultSave(), day: 5, inventory: [{ itemId: 'axe', quantity: 1, slotIndex: 0 }] };
    expect(UnlockSystem.isForestUnlocked(save)).toBe(false);
  });

  it('locked on day 7 without axe', () => {
    const save = { ...defaultSave(), day: 7, inventory: [] };
    expect(UnlockSystem.isForestUnlocked(save)).toBe(false);
  });

  it('unlocked on day 7 with axe', () => {
    const save = {
      ...defaultSave(),
      day: 7,
      inventory: [{ itemId: 'axe', quantity: 1, slotIndex: 0 }],
    };
    expect(UnlockSystem.isForestUnlocked(save)).toBe(true);
  });

  it('unlocked after day 7 with axe', () => {
    const save = {
      ...defaultSave(),
      day: 20,
      inventory: [{ itemId: 'axe', quantity: 1, slotIndex: 0 }],
    };
    expect(UnlockSystem.isForestUnlocked(save)).toBe(true);
  });
});

describe('UnlockSystem.isMineUnlocked', () => {
  it('locked below 1000 coins', () => {
    const save = { ...defaultSave(), lifetimeCoinsEarned: 999 };
    expect(UnlockSystem.isMineUnlocked(save)).toBe(false);
  });

  it('unlocked at exactly 1000 coins', () => {
    const save = { ...defaultSave(), lifetimeCoinsEarned: 1000 };
    expect(UnlockSystem.isMineUnlocked(save)).toBe(true);
  });

  it('unlocked above 1000 coins', () => {
    const save = { ...defaultSave(), lifetimeCoinsEarned: 5000 };
    expect(UnlockSystem.isMineUnlocked(save)).toBe(true);
  });
});
