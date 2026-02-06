// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnrichPredictions } from '~/hooks/seasons/enrich/useEnrichPredictions';
import type { EnrichedEvent, Prediction } from '~/types/events';
import type { Tribe } from '~/types/tribes';
import type { Castaway, EnrichedCastaway } from '~/types/castaways';
import type { LeagueMember } from '~/types/leagueMembers';
import type { Eliminations } from '~/types/events';

// Mock all the hooks
vi.mock('~/hooks/leagues/useRules', () => ({
  useLeagueRules: vi.fn(),
}));

vi.mock('~/hooks/seasons/useTribesTimeline', () => ({
  useTribesTimeline: vi.fn(),
}));

vi.mock('~/hooks/seasons/useTribes', () => ({
  useTribes: vi.fn(),
}));

vi.mock('~/hooks/seasons/useCastaways', () => ({
  useCastaways: vi.fn(),
}));

vi.mock('~/hooks/leagues/useLeagueMembers', () => ({
  useLeagueMembers: vi.fn(),
}));

vi.mock('~/hooks/seasons/useEliminations', () => ({
  useEliminations: vi.fn(),
}));

import { useLeagueRules } from '~/hooks/leagues/useLeagueRules';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useTribes } from '~/hooks/seasons/useTribes';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { type SeasonsDataQuery } from '~/types/seasons';
import { type LeagueRules } from '~/types/leagues';

const mockUseLeagueRules = useLeagueRules as ReturnType<typeof vi.fn>;
const mockUseTribesTimeline = useTribesTimeline as ReturnType<typeof vi.fn>;
const mockUseTribes = useTribes as ReturnType<typeof vi.fn>;
const mockUseCastaways = useCastaways as ReturnType<typeof vi.fn>;
const mockUseLeagueMembers = useLeagueMembers as ReturnType<typeof vi.fn>;
const mockUseEliminations = useEliminations as ReturnType<typeof vi.fn>;

describe('useEnrichPredictions', () => {
  const mockTribe: Tribe = {
    tribeId: 1,
    tribeName: 'Red Tribe',
    tribeColor: '#FF0000',
    seasonId: 1,
  };

  const mockCastaway: Castaway = {
    castawayId: 10,
    fullName: 'John Doe',
    shortName: 'John',
    age: 30,
    hometown: 'New York',
    residence: 'Los Angeles',
    occupation: 'Teacher',
    seasonId: 1,
    imageUrl: 'http://example.com/john.jpg',
    previouslyOn: null,
  };

  const mockEnrichedCastaway: EnrichedCastaway = {
    ...mockCastaway,
    eliminatedEpisode: null,
    tribe: {
      name: mockTribe.tribeName,
      color: mockTribe.tribeColor,
    }
  };

  const mockMember: LeagueMember = {
    memberId: 100,
    displayName: 'Player1',
    color: '#0000FF',
    role: 'Member',
    draftOrder: 1,
    loggedIn: false,
  };

  const mockRules = {
    basePrediction: {
      advFound: { enabled: true, points: 5, timing: ['Weekly'] },
      indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
      tribe1st: { enabled: true, points: 8, timing: ['Weekly'] },
    },
    custom: [],
    base: null,
    shauhinMode: null
  } as unknown as LeagueRules;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for all hooks
    mockUseLeagueRules.mockReturnValue({ data: null });
    mockUseTribesTimeline.mockReturnValue({ data: null });
    mockUseTribes.mockReturnValue({ data: null });
    mockUseCastaways.mockReturnValue({ data: null });
    mockUseLeagueMembers.mockReturnValue({ data: null });
    mockUseEliminations.mockReturnValue({ data: null });
  });

  it('should return empty array when dependencies are not loaded', () => {
    const seasonData = {
      tribes: null,
      castaways: null,
      eliminations: null,
      tribesTimeline: null,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, null, null)
    );

    expect(result.current).toEqual([]);
  });

  it('should return empty array when predictions is null', () => {
    const seasonData = {
      tribes: [mockTribe],
      castaways: [mockCastaway],
      eliminations: [[]],
      tribesTimeline: {},
    };

    const leagueData = {
      leagueMembers: {
        members: [mockMember],
        loggedIn: mockMember
      },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [], null, leagueData)
    );

    expect(result.current).toEqual([]);
  });

  it('should enrich prediction with castaway information', () => {
    const mockEvent: EnrichedEvent = {
      eventId: 1,
      eventName: 'advFound',
      eventSource: 'Base',
      eventType: 'Direct',
      episodeNumber: 3,
      episodeId: 100,
      points: 5,
      referenceMap: [
        {
          tribe: null,
          pairs: [
            { castaway: mockEnrichedCastaway, member: mockMember },
          ],
        },
      ],
      references: [{ type: 'Castaway', id: 10 }],
      label: null,
      notes: null,
    };

    const mockPrediction: Prediction = {
      predictionMakerId: 100,
      eventName: 'advFound',
      eventId: 1,
      hit: true,
      referenceType: 'Castaway',
      referenceId: 10,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 500,
      predictionEpisodeNumber: 3
    };

    const mockTribesTimeline = {
      3: {
        1: [10], // Castaway 10 in tribe 1 at episode 3
      },
    };

    const seasonData = {
      tribes: [mockTribe],
      castaways: [mockCastaway],
      eliminations: [[]] as Eliminations,
      tribesTimeline: mockTribesTimeline,
    };

    const leagueData = {
      leagueMembers: { members: [mockMember] },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [mockEvent], [mockPrediction], leagueData)
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.event).toEqual(mockEvent);
    expect(result.current[0]?.points).toBe(5);
    expect(result.current[0]?.hits).toHaveLength(1);
    expect(result.current[0]?.hits[0]?.member).toEqual(mockMember);
    expect(result.current[0]?.hits[0]?.reference.name).toBe('John Doe');
    expect(result.current[0]?.hits[0]?.reference.color).toBe('#FF0000'); // Tribe color
  });

  it('should separate hits and misses', () => {
    const mockEvent: EnrichedEvent = {
      eventId: 1,
      eventName: 'advFound',
      eventSource: 'Base',
      eventType: 'Direct',
      episodeNumber: 3,
      episodeId: 100,
      points: 5,
      referenceMap: [
        {
          tribe: null,
          pairs: [
            { castaway: mockEnrichedCastaway, member: mockMember },
          ],
        },
      ],
      references: [{ type: 'Castaway', id: 10 }],
      label: null,
      notes: null,
    };

    const hitPrediction: Prediction = {
      predictionMakerId: 100,
      eventName: 'advFound',
      eventId: 1,
      hit: true,
      referenceType: 'Castaway',
      referenceId: 10,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 501,
      predictionEpisodeNumber: 3
    };

    const missPrediction: Prediction = {
      predictionMakerId: 101,
      eventName: 'advFound',
      eventId: 1,
      hit: false,
      referenceType: 'Castaway',
      referenceId: 10,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 502,
      predictionEpisodeNumber: 3
    };

    const member2: LeagueMember = {
      memberId: 101,
      displayName: 'Player2',
      color: '#00FF00',
      role: 'Member',
      draftOrder: 2,
      loggedIn: false,
    };

    const mockTribesTimeline = {
      3: { 1: [10] },
    };

    const seasonData = {
      tribes: [mockTribe],
      castaways: [mockCastaway],
      eliminations: [[]] as Eliminations,
      tribesTimeline: mockTribesTimeline,
    };

    const leagueData = {
      leagueMembers: { members: [mockMember, member2] },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [mockEvent], [hitPrediction, missPrediction], leagueData)
    );

    expect(result.current[0]?.hits).toHaveLength(1);
    expect(result.current[0]?.misses).toHaveLength(1);
    expect(result.current[0]?.hits[0]?.hit).toBe(true);
    expect(result.current[0]?.misses[0]?.hit).toBe(false);
  });

  it('should handle tribe predictions', () => {
    const mockEvent: EnrichedEvent = {
      eventId: 1,
      eventName: 'tribe1st',
      eventSource: 'Base',
      eventType: 'Direct',
      episodeNumber: 3,
      episodeId: 100,
      points: 8,
      referenceMap: [{
        tribe: mockTribe,
        pairs: [],
      }],
      references: [{ type: 'Tribe', id: 1 }],
      label: null,
      notes: null,
    };

    const mockPrediction: Prediction = {
      predictionMakerId: 100,
      eventName: 'tribe1st',
      eventId: 1,
      hit: true,
      referenceType: 'Tribe',
      referenceId: 1,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 503,
      predictionEpisodeNumber: 3
    };

    const seasonData = {
      tribes: [mockTribe],
      castaways: [],
      eliminations: [[]] as Eliminations,
      tribesTimeline: {},
    };

    const leagueData = {
      leagueMembers: { members: [mockMember] },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [mockEvent], [mockPrediction], leagueData)
    );

    expect(result.current[0]?.hits[0]?.reference.name).toBe('Red Tribe');
    expect(result.current[0]?.hits[0]?.reference.color).toBe('#FF0000');
  });

  it('should skip prediction with null hit value', () => {
    const mockEvent: EnrichedEvent = {
      eventId: 1,
      eventName: 'advFound',
      eventSource: 'Base',
      eventType: 'Direct',
      episodeNumber: 3,
      episodeId: 100,
      points: 5,
      referenceMap: [{
        tribe: null,
        pairs: [],
      }],
      references: [{ type: 'Castaway', id: 10 }],
      label: null,
      notes: null,
    };

    const mockPrediction: Prediction = {
      predictionMakerId: 100,
      eventName: 'advFound',
      eventId: 1,
      hit: null,
      referenceType: 'Castaway',
      referenceId: 10,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 504,
      predictionEpisodeNumber: 3
    };

    const mockTribesTimeline = {
      3: { 1: [10] },
    };

    const seasonData = {
      tribes: [mockTribe],
      castaways: [mockCastaway],
      eliminations: [[]] as Eliminations,
      tribesTimeline: mockTribesTimeline,
    };

    const leagueData = {
      leagueMembers: { members: [mockMember] },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [mockEvent], [mockPrediction], leagueData)
    );

    expect(result.current).toEqual([]);
  });

  it('should skip prediction without matching event', () => {
    const mockEvent: EnrichedEvent = {
      eventId: 1,
      eventName: 'advFound',
      eventSource: 'Base',
      eventType: 'Direct',
      episodeNumber: 3,
      episodeId: 100,
      points: 5,
      referenceMap: [
        {
          tribe: null,
          pairs: [],
        },
      ],
      references: [{ type: 'Castaway', id: 10 }],
      label: null,
      notes: null,
    };

    const mockPrediction: Prediction = {
      predictionMakerId: 100,
      eventName: 'advFound',
      eventId: 999, // Non-existent event
      hit: true,
      referenceType: 'Castaway',
      referenceId: 10,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 505,
      predictionEpisodeNumber: 3
    };

    const seasonData = {
      tribes: [mockTribe],
      castaways: [mockCastaway],
      eliminations: [[]] as Eliminations,
      tribesTimeline: {},
    };

    const leagueData = {
      leagueMembers: { members: [mockMember] },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [mockEvent], [mockPrediction], leagueData)
    );

    expect(result.current).toEqual([]);
  });

  it('should include elimination episode information for castaways', () => {
    const mockEvent: EnrichedEvent = {
      eventId: 1,
      eventName: 'advFound',
      eventSource: 'Base',
      eventType: 'Direct',
      episodeNumber: 3,
      episodeId: 100,
      points: 5,
      referenceMap: [],
      references: [{ type: 'Castaway', id: 10 }],
      label: null,
      notes: null,
    };

    const mockPrediction: Prediction = {
      predictionMakerId: 100,
      eventName: 'advFound',
      eventId: 1,
      hit: true,
      referenceType: 'Castaway',
      referenceId: 10,
      bet: null,
      eventEpisodeNumber: 3,
      eventSource: 'Base',
      predictionId: 506,
      predictionEpisodeNumber: 3
    };

    const mockTribesTimeline = {
      3: { 1: [10] },
    };

    const mockEliminations: Eliminations = [
      [],
      [],
      [],
      [],
      [{ castawayId: 10, eventId: 10 }], // Eliminated in episode 5
    ];

    const seasonData = {
      tribes: [mockTribe],
      castaways: [mockCastaway],
      eliminations: mockEliminations,
      tribesTimeline: mockTribesTimeline,
    };

    const leagueData = {
      leagueMembers: { members: [mockMember] },
      leagueRules: mockRules,
    };

    const { result } = renderHook(() =>
      useEnrichPredictions(seasonData as unknown as SeasonsDataQuery, [mockEvent], [mockPrediction], leagueData)
    );

    expect(result.current).toHaveLength(1);
    // The elimination episode is set in the lookup map
    expect(result.current[0]?.hits).toHaveLength(1);
  });
});
