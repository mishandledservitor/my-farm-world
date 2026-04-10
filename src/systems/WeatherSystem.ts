import { EventBus } from '../utils/EventBus';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy';

const WEATHER_WEIGHTS: { type: WeatherType; weight: number }[] = [
  { type: 'sunny',  weight: 40 },
  { type: 'cloudy', weight: 30 },
  { type: 'rainy',  weight: 30 },
];

export class WeatherSystem {
  private current: WeatherType;

  constructor(weather?: WeatherType) {
    this.current = weather ?? WeatherSystem.rollWeather();
  }

  get weather(): WeatherType {
    return this.current;
  }

  get isRainy(): boolean {
    return this.current === 'rainy';
  }

  /** Roll new weather for a new day. */
  advanceDay(): void {
    this.current = WeatherSystem.rollWeather();
    EventBus.emit('weather:changed', { weather: this.current });
  }

  /** Weighted random weather pick. */
  static rollWeather(): WeatherType {
    const total = WEATHER_WEIGHTS.reduce((s, w) => s + w.weight, 0);
    let roll = Math.random() * total;
    for (const w of WEATHER_WEIGHTS) {
      roll -= w.weight;
      if (roll <= 0) return w.type;
    }
    return 'sunny';
  }

  serialize(): string {
    return this.current;
  }
}
