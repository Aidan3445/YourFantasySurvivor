import { describe, it, expect } from 'vitest';
import { getTribeTimeline } from '~/lib/utils';
import type { TribesTimeline, Tribe } from '~/types/tribes';

describe('getTribeTimeline', () => {
  const tribes: Tribe[] = [
    { tribeId: 1, tribeName: 'Red Tribe', tribeColor: '#FF0000', seasonId: 1 },
    { tribeId: 2, tribeName: 'Blue Tribe', tribeColor: '#0000FF', seasonId: 1 },
    { tribeId: 3, tribeName: 'Green Tribe', tribeColor: '#00FF00', seasonId: 1 },
  ];

  const tribesTimeline: TribesTimeline = {
    1: {
      1: [1, 2, 3],
      2: [4, 5, 6],
    },
    3: {
      1: [1, 4],  // Castaway 1 moves/stays in tribe 1
      2: [2, 5],  // Castaway 2 moves/stays in tribe 2
    },
    5: {
      3: [1, 2, 4, 5],  // Merge - castaways join tribe 3
    },
  };

  it('should return timeline for a castaway across all episodes', () => {
    const result = getTribeTimeline(1, tribesTimeline, tribes);

    expect(result).toEqual([
      { episode: 1, tribe: tribes[0] },
      { episode: 3, tribe: tribes[0] },
      { episode: 5, tribe: tribes[2] },
    ]);
  });

  it('should return timeline sorted by episode number', () => {
    const result = getTribeTimeline(2, tribesTimeline, tribes);

    expect(result[0]?.episode).toBeLessThan(result[1]?.episode ?? 0);
    if (result[2]) {
      expect(result[1]?.episode).toBeLessThan(result[2].episode);
    }
  });

  it('should return empty array for non-existent castaway', () => {
    const result = getTribeTimeline(999, tribesTimeline, tribes);
    expect(result).toEqual([]);
  });

  it('should handle empty timeline', () => {
    const emptyTimeline: TribesTimeline = {};
    const result = getTribeTimeline(1, emptyTimeline, tribes);
    expect(result).toEqual([]);
  });

  it('should return timeline entries in sorted order', () => {
    const result = getTribeTimeline(1, tribesTimeline, tribes);

    // Should have episodes for castaway 1
    expect(result.length).toBeGreaterThan(0);

    // Should be sorted by episode number
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.episode).toBeGreaterThan(result[i - 1]!.episode);
    }
  });
});
