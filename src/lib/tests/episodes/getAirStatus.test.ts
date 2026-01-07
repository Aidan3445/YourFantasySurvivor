import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAirStatus } from '~/lib/episodes';

describe('getAirStatus', () => {
  let originalDate: typeof Date;

  beforeEach(() => {
    originalDate = global.Date;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  it('should return "Upcoming" for future episodes', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const result = getAirStatus(futureDate, 60);
    expect(result).toBe('Upcoming');
  });

  it('should return "Airing" for currently airing episodes', () => {
    const now = new Date();
    const airingDate = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 mins ago
    const runtime = 60; // 60 minute runtime

    const result = getAirStatus(airingDate, runtime);
    expect(result).toBe('Airing');
  });

  it('should return "Aired" for past episodes', () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    const result = getAirStatus(pastDate, 60); // 60 minute runtime
    expect(result).toBe('Aired');
  });

  it('should handle exact air date boundary', () => {
    // Mock Date to control "now"
    const mockNow = new Date('2024-01-15T20:00:00Z');
    vi.setSystemTime(mockNow);

    const airDate = new Date('2024-01-15T20:00:00Z');
    const result = getAirStatus(airDate, 60);

    // At exact air time, should be "Airing"
    expect(result).toBe('Airing');

    vi.useRealTimers();
  });

  it('should handle exact end time boundary', () => {
    const mockNow = new Date('2024-01-15T21:00:00Z');
    vi.setSystemTime(mockNow);

    const airDate = new Date('2024-01-15T20:00:00Z');
    const runtime = 60; // Exactly 1 hour
    const result = getAirStatus(airDate, runtime);

    // At exact end time, should be "Aired"
    expect(result).toBe('Aired');

    vi.useRealTimers();
  });

  it('should handle different runtime lengths', () => {
    const mockNow = new Date('2024-01-15T20:30:00Z');
    vi.setSystemTime(mockNow);

    const airDate = new Date('2024-01-15T20:00:00Z');

    // 90 minute runtime - should still be airing at 30 mins
    const result1 = getAirStatus(airDate, 90);
    expect(result1).toBe('Airing');

    // 20 minute runtime - should be aired at 30 mins
    const result2 = getAirStatus(airDate, 20);
    expect(result2).toBe('Aired');

    vi.useRealTimers();
  });

  it('should handle zero runtime', () => {
    const now = new Date();
    const airDate = new Date(now.getTime() - 1000); // 1 second ago

    const result = getAirStatus(airDate, 0);
    expect(result).toBe('Aired');
  });
});
