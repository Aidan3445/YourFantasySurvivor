import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getUsedColors from '~/services/leagues/query/colors';
import { db } from '~/server/db';

vi.mock('~/server/db', () => ({
  db: mockDb,
}));

describe('getUsedColors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return array of used colors', async () => {
    mockDbQuery.mockReturnValue([
      { color: 'red' },
      { color: 'blue' },
      { color: 'green' },
    ]);

    const result = await getUsedColors('league-123');

    expect(result).toEqual(['red', 'blue', 'green']);
    expect(db.select).toHaveBeenCalled();
  });


  it('should return empty array when no members exist', async () => {
    mockDbQuery.mockResolvedValue([]);

    const result = await getUsedColors('empty');

    expect(result).toEqual([]);
  });

  it('should handle single color', async () => {
    mockDbQuery.mockResolvedValue([{ color: 'purple' }]);

    const result = await getUsedColors('single');

    expect(result).toEqual(['purple']);
  });

  it('should handle database errors', async () => {
    mockDbQuery.mockRejectedValue(new Error('Database error'));

    await expect(getUsedColors('error')).rejects.toThrow('Database error');
  });
});
