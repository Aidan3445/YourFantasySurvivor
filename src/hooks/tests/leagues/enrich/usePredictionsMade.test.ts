// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';
import type { Prediction } from '~/types/events';

// Mock all the hooks
vi.mock('~/hooks/leagues/useLeagueMembers', () => ({
  useLeagueMembers: vi.fn(),
}));

vi.mock('~/hooks/leagues/useBasePredictions', () => ({
  useBasePredictions: vi.fn(),
}));

vi.mock('~/hooks/leagues/useCustomEvents', () => ({
  useCustomEvents: vi.fn(),
}));

import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';

const mockUseLeagueMembers = useLeagueMembers as ReturnType<typeof vi.fn>;
const mockUseBasePredictions = useBasePredictions as ReturnType<typeof vi.fn>;
const mockUseCustomEvents = useCustomEvents as ReturnType<typeof vi.fn>;

describe('usePredictionsMade', () => {
  const mockPrediction = (overrides: Partial<Prediction>): Prediction => ({
    predictionId: 1,
    eventSource: 'Base',
    predictionEpisodeNumber: 1,
    eventEpisodeNumber: 1,
    eventName: 'advFound',
    predictionMakerId: 100,
    referenceId: 10,
    referenceType: 'Castaway',
    eventId: 1,
    bet: null,
    hit: true,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUseLeagueMembers.mockReturnValue({ data: null });
    mockUseBasePredictions.mockReturnValue({ data: null });
    mockUseCustomEvents.mockReturnValue({ data: null });
  });

  it('should return empty objects when dependencies are not loaded', () => {
    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade).toEqual({});
    expect(result.current.customPredictionsMade).toEqual({});
  });

  it('should return empty objects when there is no logged-in member and no selectedMemberId', () => {
    mockUseLeagueMembers.mockReturnValue({
      data: { loggedIn: null, members: [] },
    });
    mockUseBasePredictions.mockReturnValue({ data: {} });
    mockUseCustomEvents.mockReturnValue({ data: { predictions: {} } });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade).toEqual({});
    expect(result.current.customPredictionsMade).toEqual({});
  });

  it('should filter base predictions by logged-in member', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockBasePredictions = {
      1: {
        advFound: [
          mockPrediction({ predictionId: 1, predictionMakerId: 100 }),
          mockPrediction({ predictionId: 2, predictionMakerId: 200 }),
        ],
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: mockBasePredictions });
    mockUseCustomEvents.mockReturnValue({ data: { predictions: {} } });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade[1]).toHaveLength(1);
    expect(result.current.basePredictionsMade[1]?.[0]?.predictionMakerId).toBe(100);
  });

  it('should filter base predictions by selectedMemberId parameter', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockBasePredictions = {
      1: {
        advFound: [
          mockPrediction({ predictionId: 1, predictionMakerId: 100 }),
          mockPrediction({ predictionId: 2, predictionMakerId: 200 }),
        ],
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: mockBasePredictions });
    mockUseCustomEvents.mockReturnValue({ data: { predictions: {} } });

    // Override with selectedMemberId=200
    const { result } = renderHook(() => usePredictionsMade(undefined, 200));

    expect(result.current.basePredictionsMade[1]).toHaveLength(1);
    expect(result.current.basePredictionsMade[1]?.[0]?.predictionMakerId).toBe(200);
  });

  it('should group base predictions by episode number', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockBasePredictions = {
      1: {
        advFound: [mockPrediction({ predictionId: 1, predictionMakerId: 100 })],
      },
      2: {
        indivWin: [mockPrediction({ predictionId: 2, predictionMakerId: 100 })],
      },
      3: {
        advFound: [mockPrediction({ predictionId: 3, predictionMakerId: 200 })],
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: mockBasePredictions });
    mockUseCustomEvents.mockReturnValue({ data: { predictions: {} } });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade[1]).toHaveLength(1);
    expect(result.current.basePredictionsMade[2]).toHaveLength(1);
    expect(result.current.basePredictionsMade[3]).toBeUndefined(); // Not member 100's prediction
  });

  it('should collect multiple predictions from same episode', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockBasePredictions = {
      1: {
        advFound: [mockPrediction({ predictionId: 1, predictionMakerId: 100 })],
        indivWin: [mockPrediction({ predictionId: 2, predictionMakerId: 100 })],
        tribe1st: [mockPrediction({ predictionId: 3, predictionMakerId: 100 })],
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: mockBasePredictions });
    mockUseCustomEvents.mockReturnValue({ data: { predictions: {} } });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade[1]).toHaveLength(3);
    expect(result.current.basePredictionsMade[1]?.map(p => p.predictionId)).toEqual([1, 2, 3]);
  });

  it('should handle empty prediction arrays in base predictions', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockBasePredictions = {
      1: {
        advFound: [],
        indivWin: null,
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: mockBasePredictions });
    mockUseCustomEvents.mockReturnValue({ data: { predictions: {} } });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade).toEqual({});
  });

  it('should filter custom event predictions by logged-in member', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockCustomEvents = {
      predictions: {
        1: {
          customEvent1: [
            mockPrediction({ predictionId: 1, predictionMakerId: 100 }),
            mockPrediction({ predictionId: 2, predictionMakerId: 200 }),
          ],
        },
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: {} });
    mockUseCustomEvents.mockReturnValue({ data: mockCustomEvents });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.customPredictionsMade[1]).toHaveLength(1);
    expect(result.current.customPredictionsMade[1]?.[0]?.predictionMakerId).toBe(100);
  });

  it('should group custom predictions by episode number', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockCustomEvents = {
      predictions: {
        1: {
          customEvent1: [mockPrediction({ predictionId: 1, predictionMakerId: 100 })],
        },
        3: {
          customEvent2: [mockPrediction({ predictionId: 2, predictionMakerId: 100 })],
        },
        5: {
          customEvent3: [mockPrediction({ predictionId: 3, predictionMakerId: 200 })],
        },
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: {} });
    mockUseCustomEvents.mockReturnValue({ data: mockCustomEvents });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.customPredictionsMade[1]).toHaveLength(1);
    expect(result.current.customPredictionsMade[3]).toHaveLength(1);
    expect(result.current.customPredictionsMade[5]).toBeUndefined(); // Not member 100's prediction
  });

  it('should handle both base and custom predictions together', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    const mockBasePredictions = {
      1: {
        advFound: [mockPrediction({ predictionId: 1, predictionMakerId: 100 })],
      },
    };

    const mockCustomEvents = {
      predictions: {
        1: {
          customEvent1: [mockPrediction({ predictionId: 2, predictionMakerId: 100 })],
        },
      },
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: mockBasePredictions });
    mockUseCustomEvents.mockReturnValue({ data: mockCustomEvents });

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.basePredictionsMade[1]).toHaveLength(1);
    expect(result.current.customPredictionsMade[1]).toHaveLength(1);
  });

  it('should handle undefined customEvents.predictions', () => {
    const mockLeagueMembers = {
      loggedIn: { memberId: 100 },
      members: [],
    };

    mockUseLeagueMembers.mockReturnValue({ data: mockLeagueMembers });
    mockUseBasePredictions.mockReturnValue({ data: {} });
    mockUseCustomEvents.mockReturnValue({ data: {} }); // No predictions field

    const { result } = renderHook(() => usePredictionsMade());

    expect(result.current.customPredictionsMade).toEqual({});
  });

  it('should pass overrideHash to dependent hooks', () => {
    const testHash = 'test-hash-123';

    mockUseLeagueMembers.mockReturnValue({ data: null });
    mockUseBasePredictions.mockReturnValue({ data: null });
    mockUseCustomEvents.mockReturnValue({ data: null });

    renderHook(() => usePredictionsMade(testHash));

    expect(mockUseLeagueMembers).toHaveBeenCalledWith(testHash);
    expect(mockUseBasePredictions).toHaveBeenCalledWith(testHash);
    expect(mockUseCustomEvents).toHaveBeenCalledWith(testHash);
  });
});
