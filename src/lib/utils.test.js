import { describe, expect, it } from 'vitest';
import { calculateStreak, calculateWarmupSets, epley1RM, fmtClock } from './utils';

describe('utils', () => {
  it('formats short and long clocks', () => {
    expect(fmtClock(75)).toBe('1:15');
    expect(fmtClock(3661)).toBe('1:01:01');
  });

  it('computes epley 1RM', () => {
    expect(epley1RM(225, 5)).toBe(262.5);
  });

  it('returns a sensible warmup ladder', () => {
    expect(calculateWarmupSets(225, 45)).toEqual([
      { weight: 45, reps: 10, label: 'Bar' },
      { weight: 90, reps: 10, label: '40%' },
      { weight: 135, reps: 8, label: '60%' },
      { weight: 180, reps: 5, label: '80%' },
    ]);
  });

  it('counts consecutive workout days once per day', () => {
    const now = new Date('2026-04-09T12:00:00.000Z');
    const originalNow = Date.now;
    Date.now = () => now.getTime();

    const workouts = [
      { completedAt: '2026-04-09T08:00:00.000Z' },
      { completedAt: '2026-04-08T08:00:00.000Z' },
      { completedAt: '2026-04-08T10:00:00.000Z' },
      { completedAt: '2026-04-07T08:00:00.000Z' },
    ];

    expect(calculateStreak(workouts)).toBe(3);
    Date.now = originalNow;
  });
});
