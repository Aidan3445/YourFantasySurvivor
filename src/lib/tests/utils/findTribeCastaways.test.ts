import { describe, it, expect } from 'vitest';
import { findTribeCastaways } from '~/lib/utils';
import { type Eliminations } from '~/types/events';
import { type TribesTimeline } from '~/types/tribes';

describe('findTribeCastaways', () => {
  const tribesTimeline: TribesTimeline = {
    1: {
      1: [1, 2, 3],  // Tribe 1 starts with castaways 1, 2, 3
      2: [4, 5, 6],  // Tribe 2 starts with castaways 4, 5, 6
    },
    3: {
      1: [7],        // Episode 3: castaway 7 joins tribe 1
      2: [8],        // Episode 3: castaway 8 joins tribe 2
    },
  };

  const eliminations: Eliminations = [
    [],
    [{ castawayId: 2, eventId: 2 }],  // Castaway 2 eliminated in episode 2
    [],
  ];

  it('should return initial tribe castaways for episode 1', () => {
    const result = findTribeCastaways(tribesTimeline, eliminations, 1, 1);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should remove eliminated castaways from tribe', () => {
    const result = findTribeCastaways(tribesTimeline, eliminations, 1, 3);
    // Castaway 2 should be eliminated, castaway 7 should be added
    expect(result.sort()).toEqual([1, 3, 7].sort());
  });

  it('should handle tribe swaps correctly', () => {
    const result = findTribeCastaways(tribesTimeline, eliminations, 2, 3);
    // Tribe 2 should have original members minus eliminated plus new members
    expect(result.sort()).toEqual([4, 5, 6, 8].sort());
  });

  it('should handle empty tribe timeline gracefully', () => {
    const emptyTimeline: TribesTimeline = {};
    const result = findTribeCastaways(emptyTimeline, [], 1, 1);
    expect(result).toEqual([]);
  });

  it('should handle tribe with no castaways', () => {
    const timeline: TribesTimeline = {
      1: {
        1: [],
      },
    };
    const result = findTribeCastaways(timeline, [], 1, 1);
    expect(result).toEqual([]);
  });
});
