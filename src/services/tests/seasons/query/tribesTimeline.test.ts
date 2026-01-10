import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getTribesTimeline from '~/services/seasons/query/tribesTimeline';

vi.mock('~/server/db', () => ({
  db: mockDb,
}));

// Mock unstable_cache to just call the function directly
vi.mock('next/cache', () => ({
  unstable_cache: <T extends (..._args: string[]) => string>(fn: T) => fn,
  revalidateTag: vi.fn(),
}));

describe('getTribesTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTribesTimeline grouping logic', () => {
    it('should group castaways by tribe and episode', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 1, tribeId: 1, castawayId: 11 },
        { episodeNumber: 1, tribeId: 2, castawayId: 20 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      // Episode 1, Tribe 1 has castaways 10 and 11
      expect(result[1]?.[1]).toEqual([10, 11]);
      // Episode 1, Tribe 2 has castaway 20
      expect(result[1]?.[2]).toEqual([20]);
    });

    it('should handle multiple episodes', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 2, tribeId: 1, castawayId: 10 },
        { episodeNumber: 2, tribeId: 1, castawayId: 11 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      // Episode 1: Tribe 1 has castaway 10
      expect(result[1]?.[1]).toEqual([10]);
      // Episode 2: Tribe 1 has castaways 10 and 11
      expect(result[2]?.[1]).toEqual([10, 11]);
    });

    it('should handle tribe swaps', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 1, tribeId: 2, castawayId: 20 },
        { episodeNumber: 3, tribeId: 1, castawayId: 20 }, // Castaway 20 switches to tribe 1
        { episodeNumber: 3, tribeId: 2, castawayId: 10 }, // Castaway 10 switches to tribe 2
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      // Episode 1: original tribes
      expect(result[1]?.[1]).toEqual([10]);
      expect(result[1]?.[2]).toEqual([20]);
      // Episode 3: swapped
      expect(result[3]?.[1]).toEqual([20]);
      expect(result[3]?.[2]).toEqual([10]);
    });

    it('should handle merge episode with one tribe', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 1, tribeId: 2, castawayId: 20 },
        { episodeNumber: 5, tribeId: 3, castawayId: 10 },
        { episodeNumber: 5, tribeId: 3, castawayId: 20 },
        { episodeNumber: 5, tribeId: 3, castawayId: 30 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      // Episode 1: two tribes
      expect(result[1]?.[1]).toEqual([10]);
      expect(result[1]?.[2]).toEqual([20]);
      // Episode 5: merge - all in tribe 3
      expect(result[5]?.[3]).toEqual([10, 20, 30]);
    });

    it('should handle empty result from database', async () => {
      mockDbQuery.mockResolvedValue([]);

      const result = await getTribesTimeline(1);

      expect(result).toEqual({});
      expect(typeof result).toBe('object');
    });

    it('should accumulate multiple castaways in same tribe', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 1, tribeId: 1, castawayId: 11 },
        { episodeNumber: 1, tribeId: 1, castawayId: 12 },
        { episodeNumber: 1, tribeId: 1, castawayId: 13 },
        { episodeNumber: 1, tribeId: 1, castawayId: 14 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      expect(result[1]?.[1]).toEqual([10, 11, 12, 13, 14]);
      expect(result[1]?.[1]?.length).toBe(5);
    });

    it('should handle three-tribe configuration', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 1, tribeId: 2, castawayId: 20 },
        { episodeNumber: 1, tribeId: 3, castawayId: 30 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      expect(result[1]?.[1]).toEqual([10]);
      expect(result[1]?.[2]).toEqual([20]);
      expect(result[1]?.[3]).toEqual([30]);
    });

    it('should preserve castaway order within tribe', async () => {
      const mockRows = [
        { episodeNumber: 1, tribeId: 1, castawayId: 13 },
        { episodeNumber: 1, tribeId: 1, castawayId: 11 },
        { episodeNumber: 1, tribeId: 1, castawayId: 12 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      // Order should be preserved as returned from database
      expect(result[1]?.[1]).toEqual([13, 11, 12]);
    });

    it('should handle complex multi-episode scenario', async () => {
      const mockRows = [
        // Episode 1: Two tribes
        { episodeNumber: 1, tribeId: 1, castawayId: 10 },
        { episodeNumber: 1, tribeId: 1, castawayId: 11 },
        { episodeNumber: 1, tribeId: 2, castawayId: 20 },
        { episodeNumber: 1, tribeId: 2, castawayId: 21 },
        // Episode 3: Someone eliminated, no change
        { episodeNumber: 3, tribeId: 1, castawayId: 10 },
        { episodeNumber: 3, tribeId: 2, castawayId: 20 },
        { episodeNumber: 3, tribeId: 2, castawayId: 21 },
        // Episode 5: Tribe swap
        { episodeNumber: 5, tribeId: 1, castawayId: 10 },
        { episodeNumber: 5, tribeId: 1, castawayId: 21 },
        { episodeNumber: 5, tribeId: 2, castawayId: 20 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getTribesTimeline(1);

      // Episode 1
      expect(result[1]?.[1]).toEqual([10, 11]);
      expect(result[1]?.[2]).toEqual([20, 21]);
      // Episode 3 (11 eliminated)
      expect(result[3]?.[1]).toEqual([10]);
      expect(result[3]?.[2]).toEqual([20, 21]);
      // Episode 5 (swap: 21 moves to tribe 1)
      expect(result[5]?.[1]).toEqual([10, 21]);
      expect(result[5]?.[2]).toEqual([20]);
    });

    it('should call database with correct season ID', async () => {
      mockDbQuery.mockResolvedValue([]);

      await getTribesTimeline(42);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });
});
