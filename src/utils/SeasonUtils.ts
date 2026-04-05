/** Seasons cycle every 30 days. Spring = days 1-30, Summer 31-60, etc. */

export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export type SeasonName = typeof SEASONS[number];

export const DAYS_PER_SEASON = 30;
export const TOTAL_CYCLE_DAYS = DAYS_PER_SEASON * SEASONS.length;  // 120

/** Return the season for a given game day (1-indexed). */
export function getSeasonFromDay(day: number): SeasonName {
  const idx = Math.floor(((day - 1) % TOTAL_CYCLE_DAYS) / DAYS_PER_SEASON);
  return SEASONS[idx];
}

/** Return 1-based day within the current season (1..30). */
export function getDayOfSeason(day: number): number {
  return ((day - 1) % DAYS_PER_SEASON) + 1;
}

/** True when today is the last day of its season (day % 30 === 0). */
export function isLastDayOfSeason(day: number): boolean {
  return day % DAYS_PER_SEASON === 0;
}

/** Human-readable season name (capitalised). */
export function seasonLabel(season: SeasonName): string {
  return season.charAt(0).toUpperCase() + season.slice(1);
}

/** Seasonal tint color for the UI clock/header. */
export function seasonColor(season: SeasonName): string {
  switch (season) {
    case 'spring': return '#99e550';
    case 'summer': return '#fbf236';
    case 'fall':   return '#df7126';
    case 'winter': return '#9badb7';
  }
}
