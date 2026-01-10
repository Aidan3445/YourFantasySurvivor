import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useActionDetails';
import type { Castaway } from '~/types/castaways';
import type { Tribe } from '~/types/tribes';
import type { LeagueMember } from '~/types/leagueMembers';
import type { Eliminations } from '~/types/events';

// Mock all the hooks
vi.mock('~/hooks/seasons/enrich/useEnrichedTribeMembers', () => ({
  useEnrichedTribeMembers: vi.fn(),
}));

vi.mock('~/hooks/leagues/useRules', () => ({
  useLeagueRules: vi.fn(),
}));

vi.mock('~/hooks/leagues/useLeague', () => ({
  useLeague: vi.fn(),
}));

vi.mock('~/hooks/seasons/useKeyEpisodes', () => ({
  useKeyEpisodes: vi.fn(),
}));

vi.mock('~/hooks/leagues/usePredictionTiming', () => ({
  usePredictionTiming: vi.fn(),
}));

vi.mock('~/hooks/leagues/useSelectionTimeline', () => ({
  useSelectionTimeline: vi.fn(),
}));

vi.mock('~/hooks/leagues/useLeagueMembers', () => ({
  useLeagueMembers: vi.fn(),
}));

vi.mock('~/hooks/seasons/useEliminations', () => ({
  useEliminations: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('~/hooks/leagues/useLeagueSettings', () => ({
  useLeagueSettings: vi.fn(),
}));

vi.mock('~/hooks/leagues/enrich/usePredictionsMade', () => ({
  usePredictionsMade: vi.fn(),
}));

vi.mock('~/hooks/seasons/useCastaways', () => ({
  useCastaways: vi.fn(),
}));

import { useEnrichedTribeMembers } from '~/hooks/seasons/enrich/useEnrichedTribeMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { usePredictionTiming } from '~/hooks/leagues/usePredictionTiming';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { useRouter } from 'next/navigation';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';
import { useCastaways } from '~/hooks/seasons/useCastaways';

const mockUseEnrichedTribeMembers = useEnrichedTribeMembers as ReturnType<typeof vi.fn>;
const mockUseLeagueRules = useLeagueRules as ReturnType<typeof vi.fn>;
const mockUseLeague = useLeague as ReturnType<typeof vi.fn>;
const mockUseKeyEpisodes = useKeyEpisodes as ReturnType<typeof vi.fn>;
const mockUsePredictionTiming = usePredictionTiming as ReturnType<typeof vi.fn>;
const mockUseSelectionTimeline = useSelectionTimeline as ReturnType<typeof vi.fn>;
const mockUseLeagueMembers = useLeagueMembers as ReturnType<typeof vi.fn>;
const mockUseEliminations = useEliminations as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
const mockUseLeagueSettings = useLeagueSettings as ReturnType<typeof vi.fn>;
const mockUsePredictionsMade = usePredictionsMade as ReturnType<typeof vi.fn>;
const mockUseCastaways = useCastaways as ReturnType<typeof vi.fn>;

describe('useLeagueActionDetails', () => {
  const mockCastaway: Castaway = {
    castawayId: 10,
    fullName: 'John Doe',
    shortName: 'John',
    age: 30,
    hometown: 'New York',
    residence: 'USA',
    occupation: 'Teacher',
    seasonId: 1,
    imageUrl: 'http://example.com/image.jpg',
    previouslyOn: null
  };

  const mockTribe: Tribe = {
    tribeId: 1,
    tribeName: 'Red Tribe',
    tribeColor: '#FF0000',
    seasonId: 1,
  };

  const mockMember: LeagueMember = {
    memberId: 100,
    displayName: 'Player1',
    color: '#0000FF',
    role: 'Member',
    draftOrder: 1,
    loggedIn: false,
  };

  const mockLeague = {
    leagueId: 1,
    seasonId: 1,
    hash: 'test-hash',
    status: 'Draft',
  };

  const mockRules = {
    basePrediction: {
      advFound: { enabled: true, points: 5, timing: ['Weekly'] },
      indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
      tribe1st: { enabled: false, points: 8, timing: ['Weekly'] },
    },
    custom: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUseEnrichedTribeMembers.mockReturnValue(null);
    mockUseLeagueRules.mockReturnValue({ data: null });
    mockUseLeague.mockReturnValue({ data: null });
    mockUseKeyEpisodes.mockReturnValue({ data: null });
    mockUsePredictionTiming.mockReturnValue({ data: null });
    mockUseSelectionTimeline.mockReturnValue({ data: null });
    mockUseLeagueMembers.mockReturnValue({ data: null });
    mockUseEliminations.mockReturnValue({ data: null });
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockUseLeagueSettings.mockReturnValue({ data: null });
    mockUsePredictionsMade.mockReturnValue({ basePredictionsMade: {}, customPredictionsMade: {} });
    mockUseCastaways.mockReturnValue({ data: null });
  });

  it('should return undefined actionDetails when dependencies are not loaded', () => {
    const { result } = renderHook(() => useLeagueActionDetails());

    expect(result.current.actionDetails).toBeUndefined();
  });

  it('should build elimination lookup map correctly', () => {
    const mockEliminations: Eliminations = [
      [],
      [{ castawayId: 10, eventId: 1 }],
      [],
      [{ castawayId: 20, eventId: 2 }, { castawayId: 30, eventId: 3 }],
    ];

    mockUseLeague.mockReturnValue({ data: mockLeague });
    mockUseLeagueRules.mockReturnValue({ data: mockRules });
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 5 } }
    });
    mockUseLeagueMembers.mockReturnValue({
      data: { members: [mockMember], loggedIn: mockMember }
    });
    mockUseSelectionTimeline.mockReturnValue({
      data: {
        memberCastaways: { 100: [null, 10] },
        castawayMembers: { 10: [null, 100] }
      }
    });
    mockUseEnrichedTribeMembers.mockReturnValue({
      1: {
        tribe: mockTribe,
        castaways: [mockCastaway]
      }
    });
    mockUseEliminations.mockReturnValue({ data: mockEliminations });
    mockUseCastaways.mockReturnValue({ data: [mockCastaway] });

    const { result } = renderHook(() => useLeagueActionDetails());

    // Check that actionDetails includes elimination info
    expect(result.current.actionDetails).toBeDefined();
    // Castaway 10 eliminated in episode 2 (index 1 + 1)
    expect(result.current.actionDetails?.[1]?.castaways[0]?.castaway.eliminatedEpisode).toBe(2);
  });

  it('should identify onTheClock member correctly', () => {
    const member1: LeagueMember = { ...mockMember, memberId: 100, draftOrder: 1 };
    const member2: LeagueMember = { ...mockMember, memberId: 200, draftOrder: 2 };

    mockUseLeague.mockReturnValue({ data: mockLeague });
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 5 } }
    });
    mockUseLeagueMembers.mockReturnValue({
      data: { members: [member1, member2], loggedIn: member1 }
    });
    mockUseSelectionTimeline.mockReturnValue({
      data: {
        memberCastaways: {
          100: [null, 10, 10, 10, 10], // Has selection for ep 1-4, missing ep 5
          200: [null, 20, 20, 20, 20, 20] // Has selection for all episodes
        },
        castawayMembers: {}
      }
    });

    const { result } = renderHook(() => useLeagueActionDetails());

    expect(result.current.onTheClock?.memberId).toBe(100);
    expect(result.current.onTheClock?.loggedIn).toBe(true);
    expect(result.current.onDeck?.memberId).toBe(200);
  });

  it('should identify onDeck member correctly', () => {
    const member1: LeagueMember = { ...mockMember, memberId: 100, draftOrder: 1 };
    const member2: LeagueMember = { ...mockMember, memberId: 200, draftOrder: 2 };
    const member3: LeagueMember = { ...mockMember, memberId: 300, draftOrder: 3 };

    mockUseLeague.mockReturnValue({ data: mockLeague });
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 5 } }
    });
    mockUseLeagueMembers.mockReturnValue({
      data: { members: [member1, member2, member3], loggedIn: member2 }
    });
    mockUseSelectionTimeline.mockReturnValue({
      data: {
        memberCastaways: {
          100: [null, 10, 10, 10, 10, 10], // Has all selections
          200: [null, 20, 20, 20, 20], // Missing ep 5 (on the clock)
          300: [null, 30, 30, 30, 30] // Missing ep 5 (on deck)
        },
        castawayMembers: {}
      }
    });

    const { result } = renderHook(() => useLeagueActionDetails());

    expect(result.current.onTheClock?.memberId).toBe(200);
    expect(result.current.onDeck?.memberId).toBe(300);
    expect(result.current.onDeck?.loggedIn).toBe(false);
  });

  it('should count enabled prediction rules correctly', () => {
    mockUseLeagueRules.mockReturnValue({
      data: {
        basePrediction: {
          advFound: { enabled: true, points: 5, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
          tribe1st: { enabled: false, points: 8, timing: ['Weekly'] },
          eliminated: { enabled: true, points: 3, timing: ['Weekly'] },
        },
        custom: [
          { eventName: 'custom1', points: 5 },
          { eventName: 'custom2', points: 10 },
        ],
      }
    });

    const { result } = renderHook(() => useLeagueActionDetails());

    // 3 enabled base + 2 custom = 5 total
    expect(result.current.predictionRuleCount).toBe(5);
  });

  it('should combine base and custom predictions made for next episode', () => {
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 3 } }
    });

    mockUsePredictionsMade.mockReturnValue({
      basePredictionsMade: {
        3: [
          { predictionId: 1, eventName: 'advFound' },
          { predictionId: 2, eventName: 'indivWin' },
        ]
      },
      customPredictionsMade: {
        3: [
          { predictionId: 3, eventName: 'custom1' },
        ]
      }
    });

    const { result } = renderHook(() => useLeagueActionDetails());

    expect(result.current.predictionsMade).toHaveLength(3);
    expect(result.current.predictionsMade.map((p) => p.predictionId)).toEqual([1, 2, 3]);
  });

  it('should filter rules based on prediction timing', () => {
    mockUseLeagueRules.mockReturnValue({
      data: {
        basePrediction: {
          advFound: { enabled: true, points: 5, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Merge'] },
          tribe1st: { enabled: true, points: 8, timing: ['Weekly', 'Merge'] },
        },
        custom: [
          { eventName: 'custom1', eventType: 'Scoring', points: 5, timing: ['Weekly'] },
          { eventName: 'custom2', eventType: 'Scoring', points: 10, timing: ['Finale'] },
          { eventName: 'custom3', eventType: 'Direct', points: 15, timing: ['Finale'] },
        ],
      }
    });

    // Only Weekly timing is available
    mockUsePredictionTiming.mockReturnValue({ data: ['Weekly'] });

    const { result } = renderHook(() => useLeagueActionDetails());

    // advFound: enabled (has Weekly)
    // indivWin: disabled (only has Merge, not available)
    // tribe1st: enabled (has Weekly)
    expect(result.current.rules?.basePrediction?.advFound?.enabled).toBe(true);
    expect(result.current.rules?.basePrediction?.indivWin?.enabled).toBe(false);
    expect(result.current.rules?.basePrediction?.tribe1st?.enabled).toBe(true);

    // custom1: included (has Weekly)
    // custom2: excluded (only has Finale)
    // custom3: included (Direct type always included)
    expect(result.current.rules?.custom).toHaveLength(2);
    expect(result.current.rules?.custom?.map((c) => c.eventName)).toEqual(['custom1', 'custom3']);
  });

  it('should handle null eliminations gracefully', () => {
    mockUseLeague.mockReturnValue({ data: mockLeague });
    mockUseLeagueRules.mockReturnValue({ data: mockRules });
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 5 } }
    });
    mockUseLeagueMembers.mockReturnValue({
      data: { members: [mockMember], loggedIn: mockMember }
    });
    mockUseSelectionTimeline.mockReturnValue({
      data: {
        memberCastaways: { 100: [null, 10] },
        castawayMembers: { 10: [null, 100] }
      }
    });
    mockUseEnrichedTribeMembers.mockReturnValue({
      1: {
        tribe: mockTribe,
        castaways: [mockCastaway]
      }
    });
    mockUseEliminations.mockReturnValue({ data: null });
    mockUseCastaways.mockReturnValue({ data: [mockCastaway] });

    const { result } = renderHook(() => useLeagueActionDetails());

    // Should still build actionDetails with null elimination info
    expect(result.current.actionDetails).toBeDefined();
    expect(result.current.actionDetails?.[1]?.castaways[0]?.castaway.eliminatedEpisode).toBeNull();
  });

  it('should return null for onTheClock when all members have selections', () => {
    const member1: LeagueMember = { ...mockMember, memberId: 100, draftOrder: 1 };
    const member2: LeagueMember = { ...mockMember, memberId: 200, draftOrder: 2 };

    mockUseLeague.mockReturnValue({ data: mockLeague });
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 5 } }
    });
    mockUseLeagueMembers.mockReturnValue({
      data: { members: [member1, member2], loggedIn: member1 }
    });
    mockUseSelectionTimeline.mockReturnValue({
      data: {
        memberCastaways: {
          100: [null, 10, 10, 10, 10, 10, 10], // Has all selections (indices 0-6)
          200: [null, 20, 20, 20, 20, 20, 20] // Has all selections (indices 0-6)
        },
        castawayMembers: {}
      }
    });

    const { result } = renderHook(() => useLeagueActionDetails());

    // When all members have selections, findIndex returns -1
    // onTheClock = members[-1] = undefined → null
    // onDeck = members[0] = first member
    expect(result.current.onTheClock).toBeNull();
    expect(result.current.onDeck?.memberId).toBe(100); // First member
  });

  it('should build actionDetails with tribe grouping', () => {
    const castaway1: Castaway = { ...mockCastaway, castawayId: 10, fullName: 'John Doe' };
    const castaway2: Castaway = { ...mockCastaway, castawayId: 20, fullName: 'Jane Smith' };

    const tribe1: Tribe = { tribeId: 1, tribeName: 'Red Tribe', tribeColor: '#FF0000', seasonId: 1 };
    const tribe2: Tribe = { tribeId: 2, tribeName: 'Blue Tribe', tribeColor: '#0000FF', seasonId: 1 };

    mockUseLeague.mockReturnValue({ data: mockLeague });
    mockUseLeagueRules.mockReturnValue({ data: mockRules });
    mockUseKeyEpisodes.mockReturnValue({
      data: { nextEpisode: { episodeNumber: 2 } }
    });
    mockUseLeagueMembers.mockReturnValue({
      data: { members: [mockMember], loggedIn: mockMember }
    });
    mockUseSelectionTimeline.mockReturnValue({
      data: {
        memberCastaways: { 100: [null, 10] },
        castawayMembers: { 10: [null, 100], 20: [null, null] }
      }
    });
    mockUseEnrichedTribeMembers.mockReturnValue({
      1: { tribe: tribe1, castaways: [castaway1] },
      2: { tribe: tribe2, castaways: [castaway2] }
    });
    mockUseEliminations.mockReturnValue({ data: [] });
    mockUseCastaways.mockReturnValue({ data: [castaway1, castaway2] });

    const { result } = renderHook(() => useLeagueActionDetails());

    expect(result.current.actionDetails).toBeDefined();
    expect(result.current.actionDetails?.[1]?.tribe).toEqual(tribe1);
    expect(result.current.actionDetails?.[1]?.castaways).toHaveLength(1);
    expect(result.current.actionDetails?.[1]?.castaways[0]?.castaway.fullName).toBe('John Doe');
    expect(result.current.actionDetails?.[1]?.castaways[0]?.member?.memberId).toBe(100);

    expect(result.current.actionDetails?.[2]?.tribe).toEqual(tribe2);
    expect(result.current.actionDetails?.[2]?.castaways).toHaveLength(1);
    expect(result.current.actionDetails?.[2]?.castaways[0]?.castaway.fullName).toBe('Jane Smith');
    expect(result.current.actionDetails?.[2]?.castaways[0]?.member).toBeNull();
  });

  it('should handle empty predictionsMade when nextEpisode is null', () => {
    mockUseKeyEpisodes.mockReturnValue({ data: { nextEpisode: null } });
    mockUsePredictionsMade.mockReturnValue({
      basePredictionsMade: { 3: [{ predictionId: 1 }] },
      customPredictionsMade: { 3: [{ predictionId: 2 }] }
    });

    const { result } = renderHook(() => useLeagueActionDetails());

    expect(result.current.predictionsMade).toEqual([]);
  });
});
