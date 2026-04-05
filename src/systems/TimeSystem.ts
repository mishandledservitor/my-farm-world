import { EventBus } from '../utils/EventBus';
import {
  GAME_MINUTES_PER_REAL_SECOND,
  DAY_START_HOUR,
  MINUTES_PER_DAY,
} from '../constants/GameConfig';

export class TimeSystem {
  private totalMinutes: number; // minutes since 00:00 (0..1439)
  private dayCount: number;
  private minutesPerSecond: number;
  private _paused: boolean;
  private lastEmittedHour: number;

  constructor(startDay = 1, startHour = DAY_START_HOUR) {
    this.totalMinutes = startHour * 60;
    this.dayCount = startDay;
    this.minutesPerSecond = GAME_MINUTES_PER_REAL_SECOND;
    this._paused = true; // frozen by default in v0.1
    this.lastEmittedHour = startHour;
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get hour(): number {
    return Math.floor(this.totalMinutes / 60);
  }

  get minute(): number {
    return Math.floor(this.totalMinutes % 60);
  }

  get day(): number {
    return this.dayCount;
  }

  get paused(): boolean {
    return this._paused;
  }

  get minutesElapsed(): number {
    return this.totalMinutes;
  }

  // ── Control ────────────────────────────────────────────────────────────────

  start(): void {
    this._paused = false;
    EventBus.emit('time:resumed', {});
  }

  pause(): void {
    this._paused = true;
    EventBus.emit('time:paused', {});
  }

  /** Speed multiplier — set to >1 for debug fast-forward */
  setSpeed(multiplier: number): void {
    this.minutesPerSecond = GAME_MINUTES_PER_REAL_SECOND * multiplier;
  }

  // ── Update (called each frame from GameScene) ──────────────────────────────

  update(deltaMs: number): void {
    if (this._paused) return;

    const minutesDelta = (deltaMs / 1000) * this.minutesPerSecond;
    this.totalMinutes += minutesDelta;

    // Emit tick every game hour change
    const currentHour = this.hour;
    if (currentHour !== this.lastEmittedHour) {
      this.lastEmittedHour = currentHour;
      EventBus.emit('time:tick', {
        hour: this.hour,
        minute: this.minute,
        totalMinutes: this.totalMinutes,
      });
    }

    // Check for midnight (minute 1440 = 24:00)
    if (this.totalMinutes >= MINUTES_PER_DAY) {
      this.totalMinutes = MINUTES_PER_DAY - 1; // cap, don't overflow
      this._paused = true;
      EventBus.emit('time:midnight', {});
    }
  }

  // ── Day management ─────────────────────────────────────────────────────────

  advanceDay(): void {
    this.dayCount += 1;
    this.totalMinutes = DAY_START_HOUR * 60;
    this.lastEmittedHour = DAY_START_HOUR;
    this._paused = true; // wait for sleep scene to unpause
    EventBus.emit('time:new-day', { day: this.dayCount });
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): { totalMinutes: number; dayCount: number } {
    return { totalMinutes: this.totalMinutes, dayCount: this.dayCount };
  }

  static deserialize(data: { totalMinutes: number; dayCount: number }): TimeSystem {
    const ts = new TimeSystem(data.dayCount);
    ts.totalMinutes = data.totalMinutes;
    ts.lastEmittedHour = Math.floor(data.totalMinutes / 60);
    return ts;
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  /** Returns "6:00 AM", "12:30 PM", "11:59 PM" etc. */
  getTimeString(): string {
    const h = this.hour;
    const m = this.minute;
    const ampm = h < 12 ? 'AM' : 'PM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const mm = String(m).padStart(2, '0');
    return `${displayH}:${mm} ${ampm}`;
  }
}
