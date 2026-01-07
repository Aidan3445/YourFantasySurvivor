import { describe, it, expect, vi } from 'vitest';
import { getAirStatusPollingInterval } from '~/lib/episodes';

describe('getAirStatusPollingInterval', () => {
  const MIN_INTERVAL = 15 * 1000; // 15 seconds
  const MAX_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  it('should return null for empty episodes array', () => {
    const result = getAirStatusPollingInterval([]);
    expect(result).toBeNull();
  });

  it('should return null for undefined episodes', () => {
    const result = getAirStatusPollingInterval(undefined);
    expect(result).toBeNull();
  });

  it('should return null when no upcoming status changes', () => {
    const pastEpisode = {
      airDate: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      runtime: 60, // 60 minutes
    };

    const result = getAirStatusPollingInterval([pastEpisode]);
    expect(result).toBeNull();
  });

  it('should return half the time until next status change', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const episode = {
      airDate: futureDate,
      runtime: 60,
    };

    const result = getAirStatusPollingInterval([episode]);

    // Should be approximately 1 hour (half of 2 hours)
    expect(result).toBeGreaterThan(59 * 60 * 1000); // At least 59 minutes
    expect(result).toBeLessThan(61 * 60 * 1000); // At most 61 minutes
  });

  it('should respect minimum interval of 15 seconds', () => {
    const soonDate = new Date(Date.now() + 10 * 1000); // 10 seconds from now
    const episode = {
      airDate: soonDate,
      runtime: 60,
    };

    const result = getAirStatusPollingInterval([episode]);

    // Should be minimum 15 seconds
    expect(result).toBe(MIN_INTERVAL);
  });

  it('should respect maximum interval of 24 hours', () => {
    const farFutureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    const episode = {
      airDate: farFutureDate,
      runtime: 60,
    };

    const result = getAirStatusPollingInterval([episode]);

    // Should be maximum 24 hours
    expect(result).toBe(MAX_INTERVAL);
  });

  it('should choose the soonest status change from multiple episodes', () => {
    const mockNow = new Date('2024-01-15T20:00:00Z');
    vi.setSystemTime(mockNow);

    const episodes = [
      {
        airDate: new Date('2024-01-15T22:00:00Z'), // 2 hours from now
        runtime: 60,
      },
      {
        airDate: new Date('2024-01-15T20:30:00Z'), // 30 minutes from now (soonest)
        runtime: 60,
      },
      {
        airDate: new Date('2024-01-16T20:00:00Z'), // 24 hours from now
        runtime: 60,
      },
    ];

    const result = getAirStatusPollingInterval(episodes);

    // Should be half of 30 minutes = 15 minutes
    expect(result).toBeGreaterThan(14 * 60 * 1000);
    expect(result).toBeLessThan(16 * 60 * 1000);

    vi.useRealTimers();
  });

  it('should consider end time for currently airing episodes', () => {
    const mockNow = new Date('2024-01-15T20:30:00Z');
    vi.setSystemTime(mockNow);

    const airingEpisode = {
      airDate: new Date('2024-01-15T20:00:00Z'), // Started 30 mins ago
      runtime: 60, // Will end in 30 minutes
    };

    const result = getAirStatusPollingInterval([airingEpisode]);

    // Should be half of 30 minutes = 15 minutes
    expect(result).toBeGreaterThan(14 * 60 * 1000);
    expect(result).toBeLessThan(16 * 60 * 1000);

    vi.useRealTimers();
  });

  it('should prefer airing episode end time over future episode start when sooner', () => {
    const mockNow = new Date('2024-01-15T20:30:00Z');
    vi.setSystemTime(mockNow);

    const episodes = [
      {
        airDate: new Date('2024-01-15T22:00:00Z'), // Starts in 90 minutes (processed first)
        runtime: 60,
      },
      {
        airDate: new Date('2024-01-15T20:00:00Z'), // Started 30 mins ago
        runtime: 60, // Will end in 30 minutes (soonest - should override)
      },
    ];

    const result = getAirStatusPollingInterval(episodes);

    // Should be half of 30 minutes = 15 minutes (not half of 90 minutes)
    expect(result).toBeGreaterThan(14 * 60 * 1000);
    expect(result).toBeLessThan(16 * 60 * 1000);

    vi.useRealTimers();
  });

  it('should return integer milliseconds (no decimals)', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000 + 333); // 2 hours + 333ms
    const episode = {
      airDate: futureDate,
      runtime: 60,
    };

    const result = getAirStatusPollingInterval([episode]);

    // Should be floored to integer
    expect(Number.isInteger(result)).toBe(true);
  });
});
