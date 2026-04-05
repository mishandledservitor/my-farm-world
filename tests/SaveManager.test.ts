import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveManager } from '../src/save/SaveManager';
import { defaultSave } from '../src/save/SaveSchema';

// Mock localStorage for vitest (jsdom not needed — just a simple mock)
const store: Record<string, string> = {};
const localStorageMock = {
  getItem:    (key: string) => store[key] ?? null,
  setItem:    (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear:      () => { Object.keys(store).forEach(k => delete store[k]); },
};

vi.stubGlobal('localStorage', localStorageMock);

describe('SaveManager', () => {
  beforeEach(() => localStorageMock.clear());

  it('returns null when no save exists', () => {
    expect(SaveManager.load()).toBeNull();
  });

  it('round-trips a save file', () => {
    const save = { ...defaultSave(), day: 5, coins: 250 };
    SaveManager.save(save);
    const loaded = SaveManager.load();
    expect(loaded?.day).toBe(5);
    expect(loaded?.coins).toBe(250);
  });

  it('preserves pets array', () => {
    const save = {
      ...defaultSave(),
      pets: [{ id: 'dog-1', petType: 'dog', name: 'Buddy', happiness: 75 }],
    };
    SaveManager.save(save);
    const loaded = SaveManager.load();
    expect(loaded?.pets).toHaveLength(1);
    expect(loaded?.pets[0].name).toBe('Buddy');
  });

  it('preserves inventory', () => {
    const save = {
      ...defaultSave(),
      inventory: [{ itemId: 'axe', quantity: 1, slotIndex: 0 }],
    };
    SaveManager.save(save);
    expect(SaveManager.load()?.inventory[0].itemId).toBe('axe');
  });
});
