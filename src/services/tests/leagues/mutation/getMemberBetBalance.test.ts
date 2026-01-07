import { mockDb, mockDbQuery } from '~/services/__mocks__/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VerifiedLeagueMemberAuth } from '~/types/api';

// Mock dependencies
vi.mock('~/server/db', () => ({
  db: mockDb,
}));

vi.mock('~/services/seasons/query/seasonsData', () => ({
  getSeasonData: vi.fn(),
}));

vi.mock('~/services/leagues/query/selectionTimeline', () => ({
  default: vi.fn(),
}));

vi.mock('~/services/leagues/query/customEvents', () => ({
  default: vi.fn(),
}));

vi.mock('~/services/leagues/query/basePredictions', () => ({
  default: vi.fn(),
}));

vi.mock('~/services/leagues/query/rules', () => ({
  default: vi.fn(),
}));

vi.mock('~/services/leagues/query/settings', () => ({
  default: vi.fn(),
}));

vi.mock('~/lib/scores', () => ({
  compileScores: vi.fn(),
}));

import { getSeasonData } from '~/services/seasons/query/seasonsData';
import getSelectionTimeline from '~/services/leagues/query/selectionTimeline';
import getCustomEventsAndPredictions from '~/services/leagues/query/customEvents';
import getBasePredictions from '~/services/leagues/query/basePredictions';
import getLeagueRules from '~/services/leagues/query/rules';
import getLeagueSettings from '~/services/leagues/query/settings';
import { compileScores } from '~/lib/scores';

const mockGetSeasonData = getSeasonData as ReturnType<typeof vi.fn>;
const mockGetSelectionTimeline = getSelectionTimeline as ReturnType<typeof vi.fn>;
const mockGetCustomEventsAndPredictions = getCustomEventsAndPredictions as ReturnType<typeof vi.fn>;
const mockGetBasePredictions = getBasePredictions as ReturnType<typeof vi.fn>;
const mockGetLeagueRules = getLeagueRules as ReturnType<typeof vi.fn>;
const mockGetLeagueSettings = getLeagueSettings as ReturnType<typeof vi.fn>;
const mockCompileScores = compileScores as ReturnType<typeof vi.fn>;

// Import makePredictionLogic to access getMemberBetBalance through it
import makePredictionLogic from '~/services/leagues/mutation/makePrediction';

describe('getMemberBetBalance', () => {
  const mockAuth: VerifiedLeagueMemberAuth = {
    userId: 'user-123',
    leagueId: 1,
    memberId: 100,
    seasonId: 1,
    role: 'Member',
    status: 'Active',
  };

  const mockSeasonData = {
    baseEvents: [],
    eliminations: [],
    tribesTimeline: {},
    keyEpisodes: { nextEpisode: { episodeNumber: 3, episodeId: 3 } },
  };

  const mockSelectionTimeline = {
    memberCastaways: {},
    castawayMembers: {},
  };

  const mockCustomEvents = {
    predictions: {},
  };

  const mockBasePredictions = {};

  const mockLeagueRules = {
    basePrediction: {
      advFound: { enabled: true, points: 5, timing: ['Weekly'] },
    },
    custom: [],
  };

  const mockLeagueSettings = {
    survivalCap: 10,
    preserveStreak: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockGetSeasonData.mockResolvedValue(mockSeasonData);
    mockGetSelectionTimeline.mockResolvedValue(mockSelectionTimeline);
    mockGetCustomEventsAndPredictions.mockResolvedValue(mockCustomEvents);
    mockGetBasePredictions.mockResolvedValue(mockBasePredictions);
    mockGetLeagueRules.mockResolvedValue(mockLeagueRules);
    mockGetLeagueSettings.mockResolvedValue(mockLeagueSettings);
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 10, 25, 40], // Member 100 has scores across episodes
        },
      },
    });
  });

  it('should calculate balance with positive score and no bets', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 10, 25, 40], // Latest score is 40
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [], // No predictions for episode 3
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {}, // No predictions for episode 3
      },
    });

    // We need to trigger the function indirectly through makePredictionLogic
    // But getMemberBetBalance is not exported. Let me test through makePredictionLogic
    // Actually, we'll test the balance check by trying to make a prediction with a bet

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    mockDbQuery.mockResolvedValue([
      { createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Try to make prediction with bet=40 (should succeed since balance is 40)
    const result = await makePredictionLogic(mockAuth, {
      eventSource: 'Base',
      eventName: 'advFound',
      referenceType: 'Castaway',
      referenceId: 10,
      bet: 40,
    });

    expect(result.success).toBe(true);
  });

  it('should calculate balance with score and existing bets', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 10, 25, 50], // Latest score is 50
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [
          { predictionMakerId: 100, bet: 10 },
          { predictionMakerId: 100, bet: 15 },
        ],
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {
          custom1: [
            { predictionMakerId: 100, bet: 5 },
          ],
        },
      },
    });

    // Total bets: 10 + 15 + 5 = 30
    // Balance: 50 - 30 = 20

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    mockDbQuery.mockResolvedValue([
      { createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Try to make prediction with bet=20 (should succeed)
    const result = await makePredictionLogic(mockAuth, {
      eventSource: 'Base',
      eventName: 'advFound',
      referenceType: 'Castaway',
      referenceId: 10,
      bet: 20,
    });

    expect(result.success).toBe(true);
  });

  it('should reject bet when insufficient balance', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 10, 25, 30], // Latest score is 30
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [
          { predictionMakerId: 100, bet: 20 }, // Already bet 20
        ],
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {},
      },
    });

    // Balance: 30 - 20 = 10
    // Trying to bet 15 should fail

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    await expect(
      makePredictionLogic(mockAuth, {
        eventSource: 'Base',
        eventName: 'advFound',
        referenceType: 'Castaway',
        referenceId: 10,
        bet: 15,
      })
    ).rejects.toThrow('Insufficient points to make this prediction');
  });

  it('should handle zero score', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 0, 0], // Score is 0
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [],
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {},
      },
    });

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    mockDbQuery.mockResolvedValue([
      { createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Should succeed with bet=0
    const result = await makePredictionLogic(mockAuth, {
      eventSource: 'Base',
      eventName: 'advFound',
      referenceType: 'Castaway',
      referenceId: 10,
      bet: 0,
    });

    expect(result.success).toBe(true);

    // Should fail with bet > 0
    await expect(
      makePredictionLogic(mockAuth, {
        eventSource: 'Base',
        eventName: 'advFound',
        referenceType: 'Castaway',
        referenceId: 10,
        bet: 1,
      })
    ).rejects.toThrow('Insufficient points to make this prediction');
  });

  it('should ignore bets from other members', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 10, 25, 50], // Latest score is 50
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [
          { predictionMakerId: 100, bet: 10 }, // This member's bet
          { predictionMakerId: 200, bet: 999 }, // Other member's bet (should be ignored)
        ],
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {},
      },
    });

    // Balance should be 50 - 10 = 40 (not 50 - 10 - 999)

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    mockDbQuery.mockResolvedValue([
      { createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Should succeed with bet=40
    const result = await makePredictionLogic(mockAuth, {
      eventSource: 'Base',
      eventName: 'advFound',
      referenceType: 'Castaway',
      referenceId: 10,
      bet: 40,
    });

    expect(result.success).toBe(true);
  });

  it('should ignore predictions without bets', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          100: [0, 10, 25, 50], // Latest score is 50
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [
          { predictionMakerId: 100, bet: null }, // No bet
          { predictionMakerId: 100, bet: 0 }, // Zero bet
          { predictionMakerId: 100, bet: 10 }, // Real bet
        ],
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {},
      },
    });

    // Balance should be 50 - 10 = 40 (only counting non-null, non-zero bets)

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    mockDbQuery.mockResolvedValue([
      { createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Should succeed with bet=40
    const result = await makePredictionLogic(mockAuth, {
      eventSource: 'Base',
      eventName: 'advFound',
      referenceType: 'Castaway',
      referenceId: 10,
      bet: 40,
    });

    expect(result.success).toBe(true);
  });

  it('should handle member with no score history', async () => {
    mockCompileScores.mockReturnValue({
      scores: {
        Member: {
          // Member 100 not in scores
          200: [10, 20, 30],
        },
      },
    });

    mockGetBasePredictions.mockResolvedValue({
      3: {
        advFound: [],
      },
    });

    mockGetCustomEventsAndPredictions.mockResolvedValue({
      predictions: {
        3: {},
      },
    });

    // Balance should be 0 (no score history)

    vi.mock('~/services/leagues/query/predictionTimings', () => ({
      default: vi.fn().mockResolvedValue(['Weekly']),
    }));

    vi.mock('~/services/seasons/query/getKeyEpisodes', () => ({
      default: vi.fn().mockResolvedValue({
        nextEpisode: { episodeNumber: 3, episodeId: 3 },
      }),
    }));

    await expect(
      makePredictionLogic(mockAuth, {
        eventSource: 'Base',
        eventName: 'advFound',
        referenceType: 'Castaway',
        referenceId: 10,
        bet: 1,
      })
    ).rejects.toThrow('Insufficient points to make this prediction');
  });
});
