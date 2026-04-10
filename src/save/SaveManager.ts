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

  /** Download the current save as a JSON file to the user's machine. */
  static exportToFile(): void {
    const save = this.load();
    if (!save) return;
    const json = JSON.stringify(save, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-farm-world-day${save.day}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Import a save file from the user's machine. Returns a Promise that resolves when done. */
  static importFromFile(): Promise<boolean> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { resolve(false); return; }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string) as SaveFile;
            if (typeof data.day !== 'number' || typeof data.coins !== 'number') {
              console.warn('[SaveManager] Invalid save file format');
              resolve(false);
              return;
            }
            const migrated = SaveManager.migrate(data);
            SaveManager.save(migrated);
            resolve(true);
          } catch (e) {
            console.warn('[SaveManager] Failed to parse save file:', e);
            resolve(false);
          }
        };
        reader.onerror = () => resolve(false);
        reader.readAsText(file);
      };
      input.click();
    });
  }

  private static migrate(data: SaveFile): SaveFile {
    // Future migrations: if (data.version < 2) { ... data.version = 2; }
    // Fill any missing fields from the default
    const def = defaultSave();
    return { ...def, ...data, version: SAVE_VERSION };
  }
}
