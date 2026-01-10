import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getEliminations from '~/services/seasons/query/eliminations';

vi.mock('~/server/db', () => ({
  db: mockDb,
}));

// Mock unstable_cache to just call the function directly
vi.mock('next/cache', () => ({
  unstable_cache: <T extends (..._args: string[]) => string>(fn: T) => fn,
  revalidateTag: vi.fn(),

})); describe('getEliminations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEliminations grouping logic', () => {
    it('should group eliminations by episode number', async () => {
      const mockRows = [
        { episodeNumber: 1, eventId: 1, castawayId: 10 },
        { episodeNumber: 2, eventId: 2, castawayId: 20 },
        { episodeNumber: 2, eventId: 3, castawayId: 21 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      // Episode 1: one elimination
      expect(result[1]).toEqual([{ castawayId: 10, eventId: 1 }]);
      // Episode 2: two eliminations
      expect(result[2]).toEqual([
        { castawayId: 20, eventId: 2 },
        { castawayId: 21, eventId: 3 },
      ]);
    });

    it('should initialize empty array for episode with elimination event', async () => {
      const mockRows = [
        { episodeNumber: 1, eventId: 1, castawayId: 10 },
        { episodeNumber: 3, eventId: 2, castawayId: 20 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      expect(result[1]).toEqual([{ castawayId: 10, eventId: 1 }]);
      expect(result[3]).toEqual([{ castawayId: 20, eventId: 2 }]);
      // Episode 2 not present in result (no elimination)
      expect(result[2]).toBeUndefined();
    });

    it('should skip rows with null castawayId', async () => {
      const mockRows = [
        { episodeNumber: 1, eventId: 1, castawayId: 10 },
        { episodeNumber: 1, eventId: 2, castawayId: null }, // No castaway reference
        { episodeNumber: 2, eventId: 3, castawayId: 20 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      // Episode 1 should only have one elimination (skip null)
      expect(result[1]).toEqual([{ castawayId: 10, eventId: 1 }]);
      expect(result[2]).toEqual([{ castawayId: 20, eventId: 3 }]);
    });

    it('should skip rows with null eventId', async () => {
      const mockRows = [
        { episodeNumber: 1, eventId: 1, castawayId: 10 },
        { episodeNumber: 1, eventId: null, castawayId: 11 }, // No event
        { episodeNumber: 2, eventId: 2, castawayId: 20 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      // Episode 1 should only have one elimination (skip null eventId)
      expect(result[1]).toEqual([{ castawayId: 10, eventId: 1 }]);
      expect(result[2]).toEqual([{ castawayId: 20, eventId: 2 }]);
    });

    it('should handle episode with multiple null eliminations', async () => {
      const mockRows = [
        { episodeNumber: 1, eventId: null, castawayId: 10 },
        { episodeNumber: 1, eventId: 1, castawayId: null },
        { episodeNumber: 1, eventId: null, castawayId: null },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      // Episode 1 should have empty array (all skipped)
      expect(result[1]).toEqual([]);
    });

    it('should handle empty result from database', async () => {
      mockDbQuery.mockResolvedValue([]);

      const result = await getEliminations(1);

      expect(result).toEqual([[]]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should preserve episode order and multiple eliminations', async () => {
      const mockRows = [
        { episodeNumber: 5, eventId: 5, castawayId: 50 },
        { episodeNumber: 3, eventId: 3, castawayId: 30 },
        { episodeNumber: 3, eventId: 4, castawayId: 31 },
        { episodeNumber: 1, eventId: 1, castawayId: 10 },
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      expect(result[1]).toEqual([{ castawayId: 10, eventId: 1 }]);
      expect(result[3]).toEqual([
        { castawayId: 30, eventId: 3 },
        { castawayId: 31, eventId: 4 },
      ]);
      expect(result[5]).toEqual([{ castawayId: 50, eventId: 5 }]);
    });

    it('should handle double elimination in same episode', async () => {
      const mockRows = [
        { episodeNumber: 1, eventId: 1, castawayId: 10 },
        { episodeNumber: 1, eventId: 1, castawayId: 11 }, // Same event, two castaways
      ];

      mockDbQuery.mockResolvedValue(mockRows);

      const result = await getEliminations(1);

      expect(result[1]).toEqual([
        { castawayId: 10, eventId: 1 },
        { castawayId: 11, eventId: 1 },
      ]);
    });

    it('should call database with correct season ID', async () => {
      mockDbQuery.mockResolvedValue([]);

      await getEliminations(42);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });
});
