import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getLeagueName from '~/services/leagues/query/name';
import { db } from '~/server/db';

vi.mock('~/server/db', () => ({
  db: mockDb
}));

describe('getLeagueName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return league name for valid hash', async () => {
    mockDbQuery.mockResolvedValue([{ leagueName: 'Test League' }]);

    const result = await getLeagueName('abc123');

    expect(result).toBe('Test League');
    expect(db.select).toHaveBeenCalled();
  });

  it('should return undefined for non-existent hash', async () => {
    mockDbQuery.mockResolvedValue([]);

    const result = await getLeagueName('nonexistent');

    expect(result).toBeUndefined();
  });

  it('should return undefined when query returns empty array', async () => {
    mockDbQuery.mockResolvedValue([]);

    const result = await getLeagueName('empty');

    expect(result).toBeUndefined();
  });

  it('should handle database errors gracefully', async () => {
    mockDbQuery.mockRejectedValue(new Error('Database connection failed'));

    await expect(getLeagueName('error')).rejects.toThrow('Database connection failed');
  });
});
