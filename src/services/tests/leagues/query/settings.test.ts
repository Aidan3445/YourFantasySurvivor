import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getLeagueSettings from '~/services/leagues/query/settings';
import type { VerifiedLeagueMemberAuth } from '~/types/api';
import { db } from '~/server/db';

vi.mock('~/server/db', () => ({
  db: mockDb,
}));

describe('getLeagueSettings', () => {
  const mockAuth: VerifiedLeagueMemberAuth = {
    userId: 'user-123',
    leagueId: 1,
    memberId: 10,
    seasonId: 2,
    role: 'Member',
    status: 'Active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return league settings with parsed date', async () => {
    mockDbQuery.mockResolvedValue([
      {
        leagueId: 1,
        isProtected: true,
        draftDate: '2024-03-15T20:00:00',
        survivalCap: 5,
        preserveStreak: true,
      },
    ]);

    const result = await getLeagueSettings(mockAuth);

    expect(result.leagueId).toBe(1);
    expect(result.isProtected).toBe(true);
    expect(result.draftDate).toBeInstanceOf(Date);
    expect(result.survivalCap).toBe(5);
    expect(result.preserveStreak).toBe(true);
  });

  it('should handle null draft date', async () => {
    mockDbQuery.mockResolvedValue([
      {
        leagueId: 1,
        isProtected: false,
        draftDate: null,
        survivalCap: 3,
        preserveStreak: false,
      },
    ]);

    const result = await getLeagueSettings(mockAuth);

    expect(result.draftDate).toBeNull();
  });

  it('should query with correct league ID', async () => {
    mockDbQuery.mockResolvedValue([
      {
        leagueId: 1,
        isProtected: true,
        draftDate: null,
        survivalCap: 5,
        preserveStreak: true,
      },
    ]);

    await getLeagueSettings(mockAuth);

    expect(db.select).toHaveBeenCalled();
  });

  it('should handle empty result gracefully', async () => {
    mockDbQuery.mockResolvedValue([]);

    const result = await getLeagueSettings(mockAuth);

    expect(result.draftDate).toBeNull();
  });
});
