// Typed pub/sub event bus for cross-scene and cross-system communication.
// No scene should hold direct references to other scenes — use EventBus instead.

export type GameEventMap = {
  // Time events
  'time:tick':       { hour: number; minute: number; totalMinutes: number };
  'time:new-day':    { day: number };
  'time:midnight':   Record<string, never>;
  'time:paused':     Record<string, never>;
  'time:resumed':    Record<string, never>;

  // Player events
  'player:moved':    { tileX: number; tileY: number };
  'player:interact': { targetId: string };

  // Scene transitions
  'scene:go-village':  Record<string, never>;
  'scene:go-farm':     Record<string, never>;
  'scene:go-forest':   Record<string, never>;
  'scene:go-mine':     Record<string, never>;

  // Sleep / day transition
  'sleep:begin':     Record<string, never>;
  'sleep:end':       { day: number };

  // UI events
  'ui:open-inventory':  Record<string, never>;
  'ui:close-inventory': Record<string, never>;
  'ui:open-shop':       Record<string, never>;
  'ui:close-shop':      Record<string, never>;
  'ui:open-crafting':   Record<string, never>;
  'ui:close-crafting':  Record<string, never>;

  // Inventory / economy
  'inventory:changed':  Record<string, never>;
  'coins:changed':      { coins: number };

  // Crop events
  'crop:planted':    { tileX: number; tileY: number; cropType: string };
  'crop:watered':    { tileX: number; tileY: number };
  'crop:harvested':  { tileX: number; tileY: number; cropType: string };
  'crop:withered':   { tileX: number; tileY: number };

  // Weather
  'weather:changed': { weather: 'sunny' | 'cloudy' | 'rainy' };

  // Save
  'save:flush':      Record<string, never>;

  // Tutorial
  'tutorial:step':   { step: number };
};

type Listener<T> = (data: T) => void;

class EventBusClass {
  private listeners: Map<string, Listener<unknown>[]> = new Map();

  on<K extends keyof GameEventMap>(event: K, listener: Listener<GameEventMap[K]>): void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener as Listener<unknown>);
    this.listeners.set(event, list);
  }

  off<K extends keyof GameEventMap>(event: K, listener: Listener<GameEventMap[K]>): void {
    const list = this.listeners.get(event) ?? [];
    const idx = list.indexOf(listener as Listener<unknown>);
    if (idx !== -1) list.splice(idx, 1);
  }

  emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void {
    const list = this.listeners.get(event) ?? [];
    list.forEach(fn => fn(data));
  }

  // Remove all listeners for an event — useful when scenes are destroyed
  clear<K extends keyof GameEventMap>(event: K): void {
    this.listeners.delete(event);
  }

  clearAll(): void {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusClass();
