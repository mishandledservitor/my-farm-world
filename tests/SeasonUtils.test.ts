import { describe, it, expect } from 'vitest';
import {
  getSeasonFromDay, getDayOfSeason, isLastDayOfSeason,
  seasonLabel, seasonColor,
} from '../src/utils/SeasonUtils';

describe('getSeasonFromDay', () => {
  it('days 1-30 are spring', () => {
    expect(getSeasonFromDay(1)).toBe('spring');
    expect(getSeasonFromDay(15)).toBe('spring');
    expect(getSeasonFromDay(30)).toBe('spring');
  });

  it('days 31-60 are summer', () => {
    expect(getSeasonFromDay(31)).toBe('summer');
    expect(getSeasonFromDay(60)).toBe('summer');
  });

  it('days 61-90 are fall', () => {
    expect(getSeasonFromDay(61)).toBe('fall');
    expect(getSeasonFromDay(90)).toBe('fall');
  });

  it('days 91-120 are winter', () => {
    expect(getSeasonFromDay(91)).toBe('winter');
    expect(getSeasonFromDay(120)).toBe('winter');
  });

  it('cycles correctly after 120 days', () => {
    expect(getSeasonFromDay(121)).toBe('spring');
    expect(getSeasonFromDay(151)).toBe('summer');
  });
});

describe('getDayOfSeason', () => {
  it('first day of each season is 1', () => {
    expect(getDayOfSeason(1)).toBe(1);
    expect(getDayOfSeason(31)).toBe(1);
    expect(getDayOfSeason(61)).toBe(1);
    expect(getDayOfSeason(91)).toBe(1);
  });

  it('last day of each season is 30', () => {
    expect(getDayOfSeason(30)).toBe(30);
    expect(getDayOfSeason(60)).toBe(30);
    expect(getDayOfSeason(90)).toBe(30);
    expect(getDayOfSeason(120)).toBe(30);
  });

  it('cycles after 120', () => {
    expect(getDayOfSeason(121)).toBe(1);
    expect(getDayOfSeason(135)).toBe(15);
  });
});

describe('isLastDayOfSeason', () => {
  it('detects last day of season', () => {
    expect(isLastDayOfSeason(30)).toBe(true);
    expect(isLastDayOfSeason(60)).toBe(true);
    expect(isLastDayOfSeason(90)).toBe(true);
    expect(isLastDayOfSeason(120)).toBe(true);
  });

  it('returns false for non-last days', () => {
    expect(isLastDayOfSeason(1)).toBe(false);
    expect(isLastDayOfSeason(29)).toBe(false);
    expect(isLastDayOfSeason(31)).toBe(false);
  });
});

describe('seasonLabel', () => {
  it('capitalises season names', () => {
    expect(seasonLabel('spring')).toBe('Spring');
    expect(seasonLabel('fall')).toBe('Fall');
    expect(seasonLabel('winter')).toBe('Winter');
  });
});

describe('seasonColor', () => {
  it('returns a hex color string for each season', () => {
    for (const s of ['spring', 'summer', 'fall', 'winter'] as const) {
      expect(seasonColor(s)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
