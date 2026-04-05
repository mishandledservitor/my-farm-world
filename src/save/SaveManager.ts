import { SaveFile, SAVE_VERSION, defaultSave } from './SaveSchema';

const SAVE_KEY = 'my-farm-world-save';

export class SaveManager {
  static save(data: SaveFile): void {
    try {
      data.version = SAVE_VERSION;
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[SaveManager] Failed to save:', e);
    }
  }

  static load(): SaveFile | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveFile;
      return this.migrate(data);
    } catch (e) {
      console.warn('[SaveManager] Failed to load save:', e);
      return null;
    }
  }

  static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  static getSummary(): { day: number; coins: number; scene: string } | null {
    const save = this.load();
    if (!save) return null;
    return { day: save.day, coins: save.coins, scene: save.currentScene };
  }

  private static migrate(data: SaveFile): SaveFile {
    // Future migrations: if (data.version < 2) { ... data.version = 2; }
    // Fill any missing fields from the default
    const def = defaultSave();
    return { ...def, ...data, version: SAVE_VERSION };
  }
}
