import { describe, it, expect } from 'vitest';
import { compileScores } from '~/lib/scores';
import { defaultBaseRules, defaultBasePredictionRules } from '~/lib/leagues';
import type { Events, Eliminations, Predictions, EventWithReferences, CustomEvents } from '~/types/events';
import type { SelectionTimelines, LeagueRules } from '~/types/leagues';
import type { KeyEpisodes } from '~/types/episodes';
import { type TribesTimeline } from '~/types/tribes';

describe('compileScores', () => {
  const basicTribesTimeline: TribesTimeline = {
    1: {
      3: [2, 4, 6],
      4: [1, 3, 5],
    },
    3: {
      3: [1, 2, 3],
      4: [4, 5, 6],
    },
    7: {
      5: [1, 3, 4, 5, 6],
    },
  };

  const initialTribesEvents: Record<number, EventWithReferences> = {
    100: {
      eventId: 100,
      eventName: 'tribeUpdate',
      references: [
        { type: 'Tribe', id: 3 },
        { type: 'Castaway', id: 2 },
        { type: 'Castaway', id: 4 },
        { type: 'Castaway', id: 6 },
      ],
      eventSource: 'Base',
      episodeId: 1,
      episodeNumber: 1,
      eventType: 'Direct',
      label: null,
      notes: null,
    },
    101: {
      eventId: 101,
      eventName: 'tribeUpdate',
      references: [
        { type: 'Tribe', id: 4 },
        { type: 'Castaway', id: 1 },
        { type: 'Castaway', id: 3 },
        { type: 'Castaway', id: 5 },
      ],
      eventSource: 'Base',
      episodeId: 1,
      episodeNumber: 1,
      eventType: 'Direct',
      label: null,
      notes: null,
    },
  };

  const basicEliminations: Eliminations = [
    [],
    [],
    [],
    [],
    [{ castawayId: 2, eventId: 19 }],
  ];

  const basicKeyEpisodes: KeyEpisodes = {
    nextEpisode: null,
    mergeEpisode: null,
    previousEpisode: null,
  };

  describe('Base Event Scoring', () => {
    it('should score castaway for base events', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        15: {
          7: {
            eventId: 7,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 9,
            episodeNumber: 15,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes
      );

      // All tribes and castaways should have been initialized to 0 points
      expect(scores.Tribe[3]?.[1]).toBe(0);
      expect(scores.Tribe[4]?.[1]).toBe(0);
      expect(scores.Castaway[1]?.[1]).toBe(0);
      expect(scores.Castaway[2]?.[1]).toBe(0);
      expect(scores.Castaway[3]?.[1]).toBe(0);
      expect(scores.Castaway[4]?.[1]).toBe(0);
      expect(scores.Castaway[5]?.[1]).toBe(0);
      expect(scores.Castaway[6]?.[1]).toBe(0);

      // Castaway 3 should have 5 points (default for advFound)
      expect(scores.Castaway[3]?.[15]).toBe(5);

      // Other castaways should have 0 points
      expect(scores.Castaway[1]?.[15]).toBe(0);
      expect(scores.Castaway[2]?.[15]).toBe(0);
      expect(scores.Castaway[4]?.[15]).toBe(0);
      expect(scores.Castaway[5]?.[15]).toBe(0);
      expect(scores.Castaway[6]?.[15]).toBe(0);

      // Tribes should have 0 points
      expect(scores.Tribe[3]?.[15]).toBe(0);
      expect(scores.Tribe[4]?.[15]).toBe(0);
    });

    it('should score tribe events for all tribe members', () => {
      const baseEvents: Events = {
        1: {
          ...initialTribesEvents,
          2: {
            eventId: 2,
            eventName: 'tribe2nd',
            references: [{ type: 'Tribe', id: 4 }],
            eventSource: 'Base',
            episodeId: 10,
            episodeNumber: 1,
            eventType: 'Direct',
            label: null,
            notes: null,
          }
        },
        4: {
          7: {
            eventId: 7,
            eventName: 'tribe1st',
            references: [{ type: 'Tribe', id: 3 }],
            eventSource: 'Base',
            episodeId: 11,
            episodeNumber: 4,
            eventType: 'Direct',
            label: null,
            notes: null,

          },
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes
      );

      // All tribes and castaways should have been initialized to 0 points
      expect(scores.Tribe[3]?.[0]).toBe(0);
      expect(scores.Tribe[4]?.[0]).toBe(0);
      expect(scores.Castaway[1]?.[0]).toBe(0);
      expect(scores.Castaway[2]?.[0]).toBe(0);
      expect(scores.Castaway[3]?.[0]).toBe(0);
      expect(scores.Castaway[4]?.[0]).toBe(0);
      expect(scores.Castaway[5]?.[0]).toBe(0);
      expect(scores.Castaway[6]?.[0]).toBe(0);

      // Tribe 1 should have points for episode 1
      expect(scores.Tribe[4]?.[1]).toBe(1); // Default for tribe2nd
      // Tribe 3 should have points for episode 4
      expect(scores.Tribe[3]?.[4]).toBe(2); // Default for tribe1st

      // Castaway 1, 3, 5 should have points for episode 1
      expect(scores.Castaway[1]?.[1]).toBe(1);
      expect(scores.Castaway[3]?.[1]).toBe(1);
      expect(scores.Castaway[5]?.[1]).toBe(1);
      // Castaway 2, 4, 6 should have no points for episode 1
      expect(scores.Castaway[2]?.[1]).toBe(0);
      expect(scores.Castaway[4]?.[1]).toBe(0);
      expect(scores.Castaway[6]?.[1]).toBe(0);

      // Castaway 1, 2, 3 should have +2 points for episode 4
      expect(scores.Castaway[1]?.[4]).toBe(3);
      expect(scores.Castaway[2]?.[4]).toBe(2);
      expect(scores.Castaway[3]?.[4]).toBe(3);
      // Castaway 5 should still have 1 point from episode 1
      expect(scores.Castaway[5]?.[4]).toBe(1);
      // Castaway 4, 6 should have no points for episode 4
      expect(scores.Castaway[4]?.[4]).toBe(0);
      expect(scores.Castaway[6]?.[4]).toBe(0);
    });

    it('should apply custom scoring rules', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        4: {
          9: {
            eventId: 9,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 4,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const customRules: LeagueRules = {
        base: { ...defaultBaseRules, advFound: 12 }, // Custom 10 points
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: []
        },
        custom: [],
        secondaryPick: null
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        { castawayMembers: {}, memberCastaways: {} },
        { events: [], predictions: [] },
        {},
        customRules
      );

      // All tribes and castaways should have been initialized to 0 points
      expect(scores.Tribe[3]?.[0]).toBe(0);
      expect(scores.Tribe[4]?.[0]).toBe(0);
      expect(scores.Castaway[1]?.[0]).toBe(0);
      expect(scores.Castaway[2]?.[0]).toBe(0);
      expect(scores.Castaway[3]?.[0]).toBe(0);
      expect(scores.Castaway[4]?.[0]).toBe(0);
      expect(scores.Castaway[5]?.[0]).toBe(0);
      expect(scores.Castaway[6]?.[0]).toBe(0);

      // Castaway 3 should have 12 points (custom for advFound)
      expect(scores.Castaway[3]?.[4]).toBe(12);

      // Other tribes and castaways should have 0 points
      expect(scores.Castaway[1]?.[4]).toBe(0);
      expect(scores.Castaway[2]?.[4]).toBe(0);
      expect(scores.Castaway[4]?.[4]).toBe(0);
      expect(scores.Castaway[5]?.[4]).toBe(0);
      expect(scores.Castaway[6]?.[4]).toBe(0);
      expect(scores.Tribe[3]?.[4]).toBe(0);
      expect(scores.Tribe[4]?.[4]).toBe(0);
    });

    it('should handle negative points', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        11: {
          6: {
            eventId: 6,
            eventName: 'badAdvPlay',
            references: [{ type: 'Castaway', id: 4 }],
            eventSource: 'Base',
            episodeId: 9,
            episodeNumber: 11,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes
      );

      // All tribes and castaways should have been initialized to 0 points
      expect(scores.Tribe[3]?.[0]).toBe(0);
      expect(scores.Tribe[4]?.[0]).toBe(0);
      expect(scores.Castaway[1]?.[0]).toBe(0);
      expect(scores.Castaway[2]?.[0]).toBe(0);
      expect(scores.Castaway[3]?.[0]).toBe(0);
      expect(scores.Castaway[4]?.[0]).toBe(0);
      expect(scores.Castaway[5]?.[0]).toBe(0);
      expect(scores.Castaway[6]?.[0]).toBe(0);

      // Castaway 4 should have -5 points (default for badAdvPlay)
      expect(scores.Castaway[4]?.[11]).toBe(-5);

      // Other tribes castaways should have 0 points
      expect(scores.Castaway[1]?.[11]).toBe(0);
      expect(scores.Castaway[2]?.[11]).toBe(0);
      expect(scores.Castaway[3]?.[11]).toBe(0);
      expect(scores.Castaway[5]?.[11]).toBe(0);
      expect(scores.Castaway[6]?.[11]).toBe(0);
      expect(scores.Tribe[3]?.[11]).toBe(0);
      expect(scores.Tribe[4]?.[11]).toBe(0);
    });
  });

  describe('Member Scoring', () => {
    it('should score members based on their castaway selections', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          3: {
            eventId: 3,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 5,
            episodeNumber: 19,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10], // Member 10 has castaway 1 starting episode 1
          4: [null, 20], // Member 20 has castaway 2 starting episode 1
        },
        memberCastaways: {
          10: [null, 3], // Member 10's selections
          20: [null, 4], // Member 20's selections
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines
      );

      // All members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);

      // Member 10 should have 5 points for castaway 3's event (advFound)
      expect(scores.Member[10]?.[3]).toBe(5);

      // Other members should have 0 points
      expect(scores.Member[20]?.[3]).toBe(0);
    });

    it('should not score members for unselected castaways', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          7: {
            eventId: 7,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 5 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 15,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
          3: [null, 20], // Member 20 has castaway 4 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
          20: [null, 3], // Member 20's selections
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines
      );

      // All members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);

      // No members should have points for unselected castaway's event
      expect(scores.Member[10]?.[3]).toBe(0);
      expect(scores.Member[20]?.[3]).toBe(0);

      // Castaway 5 should have points for the event
      expect(scores.Castaway[5]?.[3]).toBe(5);
    });
  });

  describe('Base Predictions', () => {
    // Note predictions trust valid data in sync with events, 
    // we do not need to align them here for testing scoring logic
    it('should score correct predictions', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 3,
              bet: null,
              eventSource: 'Base',
              eventEpisodeNumber: 15,
              predictionId: 7,
              predictionEpisodeNumber: 15,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
          2: [null, 20], // Member 20 has castaway 4 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
          20: [null, 2], // Member 20's selections
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
        },
        shauhinMode: { enabled: false, maxBet: 102, maxBetsPerWeek: 5, startWeek: 'After Merge', customStartWeek: 8, enabledBets: [] },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);
      // Tribes and castaways should have been initialized to empty
      expect(scores.Tribe[3]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[6]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[4]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[2]?.filter(v => v !== 0)).toStrictEqual([]);

      // Member 12 should have 7 points for correct advFound prediction
      expect(scores.Member[10]?.[3]).toBe(7);

      // Other members should have 0 points
      expect(scores.Member[20]?.[3]).toBe(0);
    });

    it('should not score incorrect predictions', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: false,
              eventId: 3,
              bet: null,
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
          2: [null, 20], // Member 20 has castaway 4 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
          20: [null, 2], // Member 20's selections
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
        },
        shauhinMode: { enabled: false, maxBet: 102, maxBetsPerWeek: 5, startWeek: 'After Merge', customStartWeek: 8, enabledBets: [] },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);
      // Tribes and castaways should have been initialized to empty
      expect(scores.Tribe[3]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[6]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[4]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[2]?.filter(v => v !== 0)).toStrictEqual([]);

      // All members should have 0 points
      expect(scores.Member[10]?.[3]).toBe(0);
      expect(scores.Member[20]?.[3]).toBe(0);
    });

    it('should not score disabled prediction rules', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 3,
              bet: null,
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
          2: [null, 20], // Member 20 has castaway 4 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
          20: [null, 2], // Member 20's selections
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: false, points: 7, timing: ['Weekly'] },
        },
        shauhinMode: { enabled: false, maxBet: 102, maxBetsPerWeek: 5, startWeek: 'After Merge', customStartWeek: 8, enabledBets: [] },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);
      // Tribes and castaways should have been initialized to empty
      expect(scores.Tribe[3]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[6]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[4]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[2]?.filter(v => v !== 0)).toStrictEqual([]);

      // All members should have 0 points
      expect(scores.Member[10]?.[3]).toBe(0);
      expect(scores.Member[20]?.[3]).toBe(0);
    });
  });

  describe('Survival Streak Bonus', () => {
    it('should award survival streak bonuses', () => {
      const eliminations: Eliminations = [
        [], [], [], [], [], [], [], [], [], [], [],
      ];

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10], // Member 10 selects castaway 3
          4: [null, 20], // Member 12 selects castaway 1
        },
        memberCastaways: {
          10: [null, 3], // Member 10's selections
          20: [null, 4], // Member 20's selections
        },
      };

      const baseEvents: Events = {
        1: initialTribesEvents,
        10: {
          100: {
            eventId: 100,
            eventName: 'indivWin',
            references: [{ type: 'Castaway', id: 4 }],
            eventSource: 'Base',
            episodeId: 20,
            episodeNumber: 10,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const { scores } = compileScores(
        baseEvents,
        eliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        null,
        7 // survival cap
      );

      // Episode 1: +1, Episode 2: +2, ... Episode 7: +7, Episode 8+: +7 (capped)
      let expectedScore = 0;
      for (let episode = 1; episode <= 9; episode++) {
        if (episode <= 7) expectedScore += episode;
        else expectedScore += 7; // capped at 7

        expect(scores.Member[10]?.[episode]).toBe(expectedScore);
        expect(scores.Member[20]?.[episode]).toBe(expectedScore);
      }

      // Member 20 should also get points for indivWin by castaway 4
      expect(scores.Member[20]?.[10]).toBe(expectedScore + 7 + 10); // default for indivWin

      // Member 10 should not get points for indivWin
      expect(scores.Member[10]?.[10]).toBe(expectedScore + 7);
    });
  });

  describe('Shauhin Mode', () => {
    it('should not score bets until the custom start week', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
        8: {
          indivWin: [
            {
              predictionMakerId: 20,
              eventName: 'indivWin',
              hit: true,
              eventId: 44,
              bet: 15,
              eventSource: 'Base',
              eventEpisodeNumber: 8,
              predictionId: 12,
              predictionEpisodeNumber: 8,
              referenceId: 4,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
          2: [null, 20], // Member 20 has castaway 4 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
          20: [null, 3], // Member 20's selections
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'Custom',
          customStartWeek: 8,
          enabledBets: ['advFound', 'indivWin'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);
      // Tribes and castaways should have been initialized to empty
      expect(scores.Tribe[3]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[6]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[4]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[2]?.filter(v => v !== 0)).toStrictEqual([]);

      // Member 10 should have 7 points for correct advFound prediction
      expect(scores.Member[10]?.[3]).toBe(7);

      // Other members should have 0 points
      expect(scores.Member[20]?.[3]).toBe(0);

      // Member 20 should have 10 + 15 = 25 points for correct indivWin prediction with bet
      expect(scores.Member[20]?.[8]).toBe(25);

      // Member 10 should not get points for indivWin
      expect(scores.Member[10]?.[8]).toBe(7);
    });

    it('should subtract missed bet amounts for incorrect predictions', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: false,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'Custom',
          customStartWeek: 2,
          enabledBets: ['advFound'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Members should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      // Tribes and castaways should have been initialized to empty
      expect(scores.Tribe[3]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[6]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[4]?.filter(v => v !== 0)).toStrictEqual([]);
      expect(scores.Castaway[2]?.filter(v => v !== 0)).toStrictEqual([]);

      // Member 10 should have -10 points for incorrect advFound prediction with bet
      expect(scores.Member[10]?.[3]).toBe(-10);
    });

    it('should activate shauhin mode after premiere', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        1: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 1,
              predictionId: 7,
              predictionEpisodeNumber: 1,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
        2: {
          indivWin: [
            {
              predictionMakerId: 10,
              eventName: 'indivWin',
              hit: true,
              eventId: 44,
              bet: 15,
              eventSource: 'Base',
              eventEpisodeNumber: 2,
              predictionId: 12,
              predictionEpisodeNumber: 2,
              referenceId: 4,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10],
        },
        memberCastaways: {
          10: [null, 4],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Premiere',
          customStartWeek: null,
          enabledBets: ['advFound', 'indivWin'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Member 10 should have 7 points for correct advFound prediction (no bet bonus in episode 1)
      expect(scores.Member[10]?.[1]).toBe(7);
      // Member 10 should have 7 + 10 + 15 = 32 points (bet bonus applies after premiere)
      expect(scores.Member[10]?.[2]).toBe(32);
    });

    it('should activate shauhin mode after merge', () => {
      const keyEpisodesWithMerge: KeyEpisodes = {
        nextEpisode: null,
        mergeEpisode: {
          episodeNumber: 6,
          episodeId: 50,
          isFinale: false,
          airDate: new Date(),
          airStatus: 'Aired',
          isMerge: true,
          runtime: 60,
          seasonId: 1,
          title: 'Merge Episode',
        },
        previousEpisode: null,
      };

      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        6: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 6,
              predictionId: 7,
              predictionEpisodeNumber: 6,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
        8: {
          indivWin: [
            {
              predictionMakerId: 10,
              eventName: 'indivWin',
              hit: true,
              eventId: 44,
              bet: 15,
              eventSource: 'Base',
              eventEpisodeNumber: 8,
              predictionId: 12,
              predictionEpisodeNumber: 8,
              referenceId: 4,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10],
        },
        memberCastaways: {
          10: [null, 4],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: ['advFound', 'indivWin'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        keyEpisodesWithMerge,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Member 10 should have 7 points for correct advFound prediction (no bet bonus before merge at episode 6)
      expect(scores.Member[10]?.[6]).toBe(7);
      // Member 10 should have 7 + 10 + 15 = 32 points (bet bonus applies after merge)
      expect(scores.Member[10]?.[8]).toBe(32);
    });

    it('should activate shauhin mode before finale', () => {
      const keyEpisodesWithFinale: KeyEpisodes = {
        nextEpisode: {
          episodeNumber: 14,
          episodeId: 100,
          isFinale: true,
          airDate: new Date(),
          airStatus: 'Aired',
          isMerge: false,
          runtime: 90,
          seasonId: 1,
          title: 'Finale',
        },
        mergeEpisode: null,
        previousEpisode: null,
      };

      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        13: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 13,
              predictionId: 7,
              predictionEpisodeNumber: 13,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
        14: {
          indivWin: [
            {
              predictionMakerId: 10,
              eventName: 'indivWin',
              hit: true,
              eventId: 44,
              bet: 15,
              eventSource: 'Base',
              eventEpisodeNumber: 14,
              predictionId: 12,
              predictionEpisodeNumber: 14,
              referenceId: 4,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10],
        },
        memberCastaways: {
          10: [null, 4],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'Before Finale',
          customStartWeek: null,
          enabledBets: ['advFound', 'indivWin'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        keyEpisodesWithFinale,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Member 10 should have 7 + 10 = 17 points (bet bonus applies before finale)
      expect(scores.Member[10]?.[13]).toBe(17);
      // Member 10 should have 17 + 10 = 27 points (no bet bonus during finale episode)
      expect(scores.Member[10]?.[14]).toBe(27);
    });

    it('should clamp bet amounts to maxBet', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 200, // Exceeds maxBet of 50
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
            {
              predictionMakerId: 20,
              eventName: 'advFound',
              hit: true,
              eventId: 34,
              bet: -100, // Negative bet, should be treated as 0
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 8,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10],
          5: [null, 20],
        },
        memberCastaways: {
          10: [null, 4],
          20: [null, 5],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 50,
          maxBetsPerWeek: 5,
          startWeek: 'Custom',
          customStartWeek: 2,
          enabledBets: ['advFound'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Member 10 should have 7 + 50 = 57 points (bet clamped to maxBet of 50)
      expect(scores.Member[10]?.[3]).toBe(57);
      expect(scores.Member[20]?.[3]).toBe(7); // Negative bet treated as 0, so only base points
    });

    it('should not activate shauhin mode when custom start week is not set', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
        8: {
          indivWin: [
            {
              predictionMakerId: 10,
              eventName: 'indivWin',
              hit: true,
              eventId: 44,
              bet: 15,
              eventSource: 'Base',
              eventEpisodeNumber: 8,
              predictionId: 12,
              predictionEpisodeNumber: 8,
              referenceId: 4,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10],
        },
        memberCastaways: {
          10: [null, 4],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'Custom',
          customStartWeek: null, // No custom start week set
          enabledBets: ['advFound', 'indivWin'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Member 10 should have only 7 points (no bet bonus since customStartWeek is null)
      expect(scores.Member[10]?.[3]).toBe(7);
      // Member 10 should have only 7 + 10 = 17 points (no bet bonus)
      expect(scores.Member[10]?.[8]).toBe(17);
    });

    it('should not activate shauhin mode when merge episode is not set', () => {
      const keyEpisodesNoMerge: KeyEpisodes = {
        nextEpisode: null,
        mergeEpisode: null, // No merge episode set
        previousEpisode: null,
      };

      const baseEvents: Events = { 1: initialTribesEvents };
      const basePredictions: Predictions = {
        3: {
          advFound: [
            {
              predictionMakerId: 10,
              eventName: 'advFound',
              hit: true,
              eventId: 33,
              bet: 10,
              eventSource: 'Base',
              eventEpisodeNumber: 3,
              predictionId: 7,
              predictionEpisodeNumber: 3,
              referenceId: 6,
              referenceType: 'Castaway',
            },
          ],
        },
        8: {
          indivWin: [
            {
              predictionMakerId: 10,
              eventName: 'indivWin',
              hit: true,
              eventId: 44,
              bet: 15,
              eventSource: 'Base',
              eventEpisodeNumber: 8,
              predictionId: 12,
              predictionEpisodeNumber: 8,
              referenceId: 4,
              referenceType: 'Castaway',
            },
          ],
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10],
        },
        memberCastaways: {
          10: [null, 4],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: {
          ...defaultBasePredictionRules,
          advFound: { enabled: true, points: 7, timing: ['Weekly'] },
          indivWin: { enabled: true, points: 10, timing: ['Weekly'] },
        },
        shauhinMode: {
          enabled: true,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: ['advFound', 'indivWin'],
        },
        custom: [],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        keyEpisodesNoMerge,
        selectionTimelines,
        { events: [], predictions: [] },
        basePredictions,
        rules
      );

      // Member 10 should have only 7 points (no bet bonus since merge episode is not set)
      expect(scores.Member[10]?.[3]).toBe(7);
      // Member 10 should have only 7 + 10 = 17 points (no bet bonus)
      expect(scores.Member[10]?.[8]).toBe(17);
    });
  });

  describe('Custom Events', () => {
    it('should apply custom event scoring rules', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const customEvents: CustomEvents = {
        events: {
          2: {
            15: {
              eventId: 15,
              eventName: 'customEvent2',
              references: [{ type: 'Tribe', id: 4 }],
              eventSource: 'Custom',
              episodeId: 14,
              episodeNumber: 2,
              eventType: 'Direct',
              label: null,
              notes: null,
            },
          },
          5: {
            20: {
              eventId: 20,
              eventName: 'customEvent1',
              references: [{ type: 'Castaway', id: 4 }],
              eventSource: 'Custom',
              episodeId: 12,
              episodeNumber: 5,
              eventType: 'Direct',
              label: null,
              notes: null,
            },
            22: {
              eventId: 22,
              eventName: 'customEvent2',
              references: [{ type: 'Tribe', id: 4 }],
              eventSource: 'Custom',
              episodeId: 12,
              episodeNumber: 5,
              eventType: 'Direct',
              label: null,
              notes: null,
            },
          },
        },
        predictions: {},
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 2 (not 1)
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
        },
      };

      const customRules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: []
        },
        custom: [
          {
            eventName: 'customEvent1',
            customEventRuleId: 1,
            points: 15,
            description: 'Custom Event 1 Points',
            eventType: 'Direct',
            referenceTypes: ['Castaway'],
            timing: ['Weekly'],
          },
          {
            eventName: 'customEvent2',
            customEventRuleId: 2,
            points: -10,
            description: 'Custom Event 2 Points',
            eventType: 'Direct',
            referenceTypes: ['Tribe'],
            timing: ['Weekly'],
          },
        ],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        customEvents,
        {},
        customRules
      );


      // All tribes and castaways should have been initialized to 0 points
      expect(scores.Tribe[3]?.[0]).toBe(0);
      expect(scores.Tribe[4]?.[0]).toBe(0);
      expect(scores.Castaway[1]?.[0]).toBe(0);
      expect(scores.Castaway[2]?.[0]).toBe(0);
      expect(scores.Castaway[3]?.[0]).toBe(0);
      expect(scores.Castaway[4]?.[0]).toBe(0);
      expect(scores.Castaway[5]?.[0]).toBe(0);
      expect(scores.Castaway[6]?.[0]).toBe(0);
      // Member 10 should be initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);

      // Tribe 4 should have -10 points (custom for customEvent2)
      expect(scores.Tribe[4]?.[2]).toBe(-10);
      // Castaways 1, 3, 5 should have -10 points for tribe 4's custom event
      expect(scores.Castaway[1]?.[2]).toBe(-10);
      expect(scores.Castaway[3]?.[2]).toBe(-10);
      expect(scores.Castaway[5]?.[2]).toBe(-10);

      // Tribe 4 should have -20 points (custom for second customEvent2)
      expect(scores.Tribe[4]?.[5]).toBe(-20);
      // Castaways 5, 6 should lose 10 points for tribe 4's custom event
      expect(scores.Castaway[6]?.[5]).toBe(-10);
      expect(scores.Castaway[5]?.[5]).toBe(-20); // lost 10 points twice

      // Other tribes and castaways should have no point change
      expect(scores.Tribe[3]?.[5]).toBe(0);
      expect(scores.Castaway[1]?.[5]).toBe(-10);
      expect(scores.Castaway[2]?.[5]).toBe(0);
      expect(scores.Castaway[3]?.[5]).toBe(-10);

      // Castaway 4 should have 15 points (custom for customEvent1) - 10 points (custom for tribe 4's customEvent2) = 5
      expect(scores.Castaway[4]?.[5]).toBe(5);
      // Member 10 should have 15 points for castaway 4's custom event - 10 points for tribe 4's custom event = 5
      expect(scores.Member[10]?.[5]).toBe(5);
    });

    it('should ignore custom events with no matching rules', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          25: {
            eventId: 25,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 13,
            episodeNumber: 1,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };
      const customEvents: CustomEvents = {
        events: {
          2: {
            15: {
              eventId: 15,
              eventName: 'customEventNoRule',
              references: [{ type: 'Tribe', id: 4 }],
              eventSource: 'Custom',
              episodeId: 14,
              episodeNumber: 2,
              eventType: 'Direct',
              label: null,
              notes: null,
            },
          },
        },
        predictions: {},
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        undefined,
        customEvents
      );

      // All tribes and castaways should have been initialized to 0 points
      expect(scores.Tribe[3]?.[0]).toBe(0);
      expect(scores.Tribe[4]?.[0]).toBe(0);
      expect(scores.Castaway[1]?.[0]).toBe(0);
      expect(scores.Castaway[2]?.[0]).toBe(0);
      expect(scores.Castaway[3]?.[0]).toBe(0);
      expect(scores.Castaway[4]?.[0]).toBe(0);
      expect(scores.Castaway[5]?.[0]).toBe(0);
      expect(scores.Castaway[6]?.[0]).toBe(0);

      // No tribes or castaways should have points for the custom event with no matching rule
      expect(scores.Tribe[4]?.[2]).toBe(0);
      expect(scores.Castaway[1]?.[2]).toBe(0);
      expect(scores.Castaway[2]?.[2]).toBe(0);
      expect(scores.Castaway[3]?.[2]).toBe(0);
      expect(scores.Castaway[4]?.[2]).toBe(0);
      expect(scores.Castaway[5]?.[2]).toBe(0);
      expect(scores.Castaway[6]?.[2]).toBe(0);

      // Castaway 3 should have points for advFound event
      expect(scores.Castaway[3]?.[3]).toBe(5); // Default for advFound
    });

    it('should skip prediction type custom events in events section', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const customEvents: CustomEvents = {
        events: {
          2: {
            15: {
              eventId: 15,
              eventName: 'customPredictionEvent',
              references: [{ type: 'Tribe', id: 4 }],
              eventSource: 'Custom',
              episodeId: 14,
              episodeNumber: 2,
              eventType: 'Prediction',
              label: null,
              notes: null,
            },
          },
        },
        predictions: {},
      };

      const customRules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: []
        },
        custom: [
          {
            eventName: 'customPredictionEvent',
            customEventRuleId: 1,
            points: 20,
            description: 'Custom Prediction Event',
            eventType: 'Prediction',
            referenceTypes: ['Tribe'],
            timing: ['Weekly'],
          },
        ],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        undefined,
        customEvents,
        {},
        customRules
      );

      // When only prediction type custom events exist (which are skipped), no tribes/castaways get scored
      // The tribeUpdate event initializes tribes and castaways but doesn't score them.
      // Since the custom event is type Prediction, it's skipped in the events section
      // Therefore tribes and castaways should be initialized and have running totals.
      expect(scores.Tribe[3]).toBeDefined();
      expect(scores.Tribe[4]).toBeDefined();
      expect(scores.Castaway[1]).toBeDefined();

      // Since no scoring events occurred, all scores should remain at 0
      // Check that the Tribe scores exist but have no points at episode 2
      if (scores.Tribe[4] && scores.Tribe[4].length > 2) {
        expect(scores.Tribe[4][2]).toBe(0);
      }
    });

    it('should not score members for custom castaway events when castaway is not selected', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const customEvents: CustomEvents = {
        events: {
          5: {
            20: {
              eventId: 20,
              eventName: 'customEvent1',
              references: [{ type: 'Castaway', id: 5 }],
              eventSource: 'Custom',
              episodeId: 12,
              episodeNumber: 5,
              eventType: 'Direct',
              label: null,
              notes: null,
            },
          },
        },
        predictions: {},
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          4: [null, 10], // Member 10 has castaway 4, not castaway 5
        },
        memberCastaways: {
          10: [null, 4], // Member 10's selections
        },
      };

      const customRules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: []
        },
        custom: [
          {
            eventName: 'customEvent1',
            customEventRuleId: 1,
            points: 15,
            description: 'Custom Event 1 Points',
            eventType: 'Direct',
            referenceTypes: ['Castaway'],
            timing: ['Weekly'],
          },
        ],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        customEvents,
        {},
        customRules
      );

      // Member 10 should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);

      // Castaway 5's score at episode 5 should be 15 points
      expect(scores.Castaway[5]?.[5]).toBe(15);

      // Member 10's score at episode 5 should be 0 (castaway 5 not selected by member 10)
      expect(scores.Member[10]?.[5]).toBe(0);
    });
  });

  describe('Custom Predictions', () => {
    it('should apply custom prediction scoring rules', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const customPredictions: CustomEvents = {
        events: {},
        predictions: {
          4: {
            customPredEvent1: [
              {
                predictionMakerId: 10,
                eventName: 'customPredEvent1',
                hit: true,
                eventId: 50,
                bet: null,
                eventSource: 'Custom',
                eventEpisodeNumber: 4,
                predictionId: 30,
                predictionEpisodeNumber: 4,
                referenceId: 5,
                referenceType: 'Castaway',
              },
            ],
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          5: [null, 10], // Member 10 has castaway 5
          2: [null, 20], // Member 20 has castaway 2
        },
        memberCastaways: {
          10: [null, 5], // Member 10's selections
          20: [null, 2], // Member 20's selections
        },
      };

      const customRules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: []
        },
        custom: [
          {
            eventName: 'customPredEvent1',
            customEventRuleId: 1,
            points: 20,
            description: 'Custom Prediction Event 1 Points',
            eventType: 'Direct',
            referenceTypes: ['Castaway'],
            timing: ['Weekly'],
          },
        ],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        customPredictions,
        {},
        customRules
      );

      // Member 10 should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);

      // Member 10 should have 20 points for correct custom prediction event
      expect(scores.Member[10]?.[4]).toBe(20);

      // Other members should have 0 points
      expect(scores.Member[20]?.[4]).toBe(0);
    });

    it('should ignore custom predictions with no matching rules', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        2: {
          30: {
            eventId: 30,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 14,
            episodeNumber: 2,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        }
      };
      const customPredictions: CustomEvents = {
        events: {},
        predictions: {
          4: {
            customPredEventNoRule: [
              {
                predictionMakerId: 10,
                eventName: 'customPredEventNoRule',
                hit: true,
                eventId: 50,
                bet: null,
                eventSource: 'Custom',
                eventEpisodeNumber: 4,
                predictionId: 30,
                predictionEpisodeNumber: 4,
                referenceId: 5,
                referenceType: 'Castaway',
              },
            ],
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          5: [null, 10], // Member 10 has castaway 5
        },
        memberCastaways: {
          10: [null, 5], // Member 10's selections
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        customPredictions
      );

      // Member 10 should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);

      // Member 10 should have 0 points for custom prediction event with no matching rule
      expect(scores.Member[10]?.[4]).toBe(0);

      // Castaway 3 should have points for advFound event
      expect(scores.Castaway[3]?.[2]).toBe(5); // Default for advFound
    });

    it('should not score incorrect custom predictions', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const customPredictions: CustomEvents = {
        events: {},
        predictions: {
          4: {
            customPredEvent1: [
              {
                predictionMakerId: 10,
                eventName: 'customPredEvent1',
                hit: false,
                eventId: 50,
                bet: null,
                eventSource: 'Custom',
                eventEpisodeNumber: 4,
                predictionId: 30,
                predictionEpisodeNumber: 4,
                referenceId: 5,
                referenceType: 'Castaway',
              },
            ],
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          5: [null, 10], // Member 10 has castaway 5
          2: [null, 20], // Member 20 has castaway 2
        },
        memberCastaways: {
          10: [null, 5], // Member 10's selections
          20: [null, 2], // Member 20's selections
        },
      };

      const customRules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 102,
          maxBetsPerWeek: 5,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: []
        },
        custom: [
          {
            eventName: 'customPredEvent1',
            customEventRuleId: 1,
            points: 20,
            description: 'Custom Prediction Event 1 Points',
            eventType: 'Direct',
            referenceTypes: ['Castaway'],
            timing: ['Weekly'],
          },
        ],
        secondaryPick: null,
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        customPredictions,
        {},
        customRules
      );

      // Member 10 should have been initialized to 0 points
      expect(scores.Member[10]?.[0]).toBe(0);
      expect(scores.Member[20]?.[0]).toBe(0);

      // Member 10's score at episode 4 should be 0 (incorrect prediction, no points awarded)
      expect(scores.Member[10]?.[4]).toBe(0);

      // Other members should have 0 points
      expect(scores.Member[20]?.[4]).toBe(0);
    });
  });

  describe('Secondary Pick Scoring', () => {
    it('should score secondary picks with full multiplier', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10], // Member 10 has castaway 3 as main selection
          4: [null, 20], // Member 20 has castaway 4 as main selection
        },
        memberCastaways: {
          10: [null, 3], // Member 10's main selections
          20: [null, 4], // Member 20's main selections
        },
        secondaryPicks: {
          20: [null, null, null, 3], // Member 20 picks castaway 3 as secondary in episode 3
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1, // Full points
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 5 points from their main selection (castaway 3)
      expect(scores.Member[10]?.[3]).toBe(5);

      // Member 20 should have 5 points from their secondary pick (castaway 3)
      expect(scores.Member[20]?.[3]).toBe(5);
    });

    it('should not score secondary picks when feature is disabled', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10], // Member 10 has castaway 3 as main selection
        },
        memberCastaways: {
          10: [null, 3],
        },
        secondaryPicks: {
          20: [null, null, null, 3], // Member 20 picks castaway 3 as secondary in episode 3
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: false, // Feature disabled
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 5 points from their main selection
      expect(scores.Member[10]?.[3]).toBe(5);

      // Member 20 will not be initialized since secondary picks are
      // disabled and no events scored for their main selection
      expect(scores.Member[20]?.[3]).toBeUndefined();
    });

    it('should score secondary picks when secondaryPick is null', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10],
        },
        memberCastaways: {
          10: [null, 3],
        },
        secondaryPicks: {
          3: [null, null, null, 20],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: null, // Feature not configured
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 5 points from their main selection
      expect(scores.Member[10]?.[3]).toBe(5);

      // Member 20 should not be initialized since no secondary pick was made
      // and no events scored for their main selection
      expect(scores.Member[20]?.[3]).toBeUndefined();
    });

    it('should score both main and secondary picks for the same member', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
          11: {
            eventId: 11,
            eventName: 'indivWin',
            references: [{ type: 'Castaway', id: 4 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10], // Member 10 has castaway 3 as main selection
          4: [null, 20], // Member 20 has castaway 4 as main selection
        },
        memberCastaways: {
          10: [null, 3],
          20: [null, 4],
        },
        secondaryPicks: {
          20: [null, null, null, 3], // Member 20 picks castaway 3 as secondary in episode 3
          10: [null, null, null, 4], // Member 10 picks castaway 4 as secondary in episode 3
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 5 (main: castaway 3 advFound) + 10 (secondary: castaway 4 indivWin) = 15
      expect(scores.Member[10]?.[3]).toBe(15);

      // Member 20 should have 10 (main: castaway 4 indivWin) + 5 (secondary: castaway 3 advFound) = 15
      expect(scores.Member[20]?.[3]).toBe(15);
    });

    it('should score secondary picks for tribe events', () => {
      const baseEvents: Events = {
        1: {
          ...initialTribesEvents,
          2: {
            eventId: 2,
            eventName: 'tribe1st',
            references: [{ type: 'Tribe', id: 4 }],
            eventSource: 'Base',
            episodeId: 10,
            episodeNumber: 1,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          1: [null, 10], // Member 10 has castaway 1 as main selection
        },
        memberCastaways: {
          10: [null, 1],
        },
        secondaryPicks: {
          20: [null, 3], // Member 20 picks castaway 3 as secondary in episode 1
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 2 points (castaway 1 in tribe 4 which got tribe1st)
      expect(scores.Member[10]?.[1]).toBe(2);

      // Member 20 should have 2 points (castaway 3 in tribe 4 which got tribe1st)
      expect(scores.Member[20]?.[1]).toBe(2);
    });

    it('should score secondary picks for custom events', () => {
      const baseEvents: Events = { 1: initialTribesEvents };
      const customEvents: CustomEvents = {
        events: {
          3: {
            20: {
              eventId: 20,
              eventName: 'customEvent1',
              references: [{ type: 'Castaway', id: 3 }],
              eventSource: 'Custom',
              episodeId: 12,
              episodeNumber: 3,
              eventType: 'Direct',
              label: null,
              notes: null,
            },
          },
        },
        predictions: {},
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10],
        },
        memberCastaways: {
          10: [null, 3],
        },
        secondaryPicks: {
          20: [null, null, null, 3], // Member 20 picks castaway 3 as secondary in episode 3
        },
      };

      const customRules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [
          {
            eventName: 'customEvent1',
            customEventRuleId: 1,
            points: 15,
            description: 'Custom Event 1 Points',
            eventType: 'Direct',
            referenceTypes: ['Castaway'],
            timing: ['Weekly'],
          },
        ],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        customEvents,
        {},
        customRules
      );

      // Member 10 should have 15 points from their main selection
      expect(scores.Member[10]?.[3]).toBe(15);

      // Member 20 should have 15 points from their secondary pick
      expect(scores.Member[20]?.[3]).toBe(15);
    });

    it('should handle null secondary picks gracefully', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10],
        },
        memberCastaways: {
          10: [null, 3],
        },
        secondaryPicks: {
          3: [null, null, null, null], // No secondary pick in episode 3
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 5 points from their main selection
      expect(scores.Member[10]?.[3]).toBe(5);

      // No other members should be scored
      expect(Object.keys(scores.Member).length).toBe(1);
    });

    it('should not score secondary picks when secondaryPicks timeline is not provided', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10],
        },
        memberCastaways: {
          10: [null, 3],
        },
        // No secondaryPicks provided
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have 5 points from their main selection
      expect(scores.Member[10]?.[3]).toBe(5);

      // No other members should be scored
      expect(Object.keys(scores.Member).length).toBe(1);
    });

    it('should score secondary picks across multiple episodes', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        2: {
          10: {
            eventId: 10,
            eventName: 'advFound',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 7,
            episodeNumber: 2,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
        3: {
          11: {
            eventId: 11,
            eventName: 'indivWin',
            references: [{ type: 'Castaway', id: 4 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10],
          4: [null, 10],
        },
        memberCastaways: {
          10: [null, 3],
        },
        secondaryPicks: {
          20: [null, null, 3, 4], // Member 20 picks castaway 3 in episode 2 and castaway 4 in episode 3
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 20 should have 5 points from episode 2 (castaway 3 advFound)
      expect(scores.Member[20]?.[2]).toBe(5);

      // Member 20 should have 5 + 10 = 15 points total (episode 2 + episode 3 indivWin)
      expect(scores.Member[20]?.[3]).toBe(15);

      // Member 10 should have 5 + 10 = 15 points from their main selections
      expect(scores.Member[10]?.[3]).toBe(15);
    });

    it('should score secondary picks with negative points', () => {
      const baseEvents: Events = {
        1: initialTribesEvents,
        3: {
          10: {
            eventId: 10,
            eventName: 'badAdvPlay',
            references: [{ type: 'Castaway', id: 3 }],
            eventSource: 'Base',
            episodeId: 8,
            episodeNumber: 3,
            eventType: 'Direct',
            label: null,
            notes: null,
          },
        },
      };

      const selectionTimelines: SelectionTimelines = {
        castawayMembers: {
          3: [null, 10],
        },
        memberCastaways: {
          10: [null, 3],
        },
        secondaryPicks: {
          20: [null, null, null, 3],
        },
      };

      const rules: LeagueRules = {
        base: defaultBaseRules,
        basePrediction: defaultBasePredictionRules,
        shauhinMode: {
          enabled: false,
          maxBet: 0,
          maxBetsPerWeek: 0,
          startWeek: 'After Merge',
          customStartWeek: null,
          enabledBets: [],
        },
        custom: [],
        secondaryPick: {
          enabled: true,
          canPickOwnSurvivor: false,
          lockoutPeriod: 3,
          publicPicks: false,
          multiplier: 1,
        },
      };

      const { scores } = compileScores(
        baseEvents,
        basicEliminations,
        basicTribesTimeline,
        basicKeyEpisodes,
        selectionTimelines,
        { events: [], predictions: [] },
        {},
        rules
      );

      // Member 10 should have -5 points (badAdvPlay default)
      expect(scores.Member[10]?.[3]).toBe(-5);

      // Member 20 should have -5 points from their secondary pick
      expect(scores.Member[20]?.[3]).toBe(-5);
    });
  });
});
