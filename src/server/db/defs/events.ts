import { z } from 'zod';
import { type CastawayName } from './castaways';
import { type TribeName } from './tribes';
import { type LeagueMemberDisplayName } from './leagueMembers';
import { type EpisodeNumber } from './episodes';

// Base Events
export const EventPointsZod = z.coerce.number()
  .lte(512, { message: 'Points must not exceed 512' })
  .gte(-512, { message: 'Points must not be less than -512' });

export const ScoringBaseEventNames = [
  'advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st', 'tribe2nd',
  'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor'] as const;
export type ScoringBaseEventName = typeof ScoringBaseEventNames[number];
export const BaseEventRuleZod = z.object(
  Object.fromEntries(ScoringBaseEventNames
    .map((name: ScoringBaseEventName) => [name, EventPointsZod]))
) as z.ZodObject<Record<ScoringBaseEventName, z.ZodNumber>, 'strip', z.ZodTypeAny, Record<ScoringBaseEventName, number>, Record<ScoringBaseEventName, number>>;
export type BaseEventRule = z.infer<typeof BaseEventRuleZod>;
export const defaultBaseRules: BaseEventRule = {
  advFound: 5,
  advPlay: 10,
  badAdvPlay: -5,
  advElim: -7,
  spokeEpTitle: 2,
  tribe1st: 5,
  tribe2nd: 2,
  indivWin: 10,
  indivReward: 5,
  finalists: 5,
  fireWin: 5,
  soleSurvivor: 10,
};

export const PredictionTimingOptions = [
  'Draft', 'Weekly', 'After Merge', 'Before Finale',
  'Weekly (Premerge only)', 'Weekly (Postmerge only)'] as const;
export type PredictionEventTiming = typeof PredictionTimingOptions[number];
export const PredictionEventTimingZod = z.enum(PredictionTimingOptions);
export type BaseEventPredictionSetting = {
  enabled: boolean,
  points: number,
  timing: PredictionEventTiming[],
  pickCount?: number
};

export type BasePredictionRules = Record<ScoringBaseEventName, BaseEventPredictionSetting>;
export const defaultPredictionRules: BasePredictionRules = {
  advFound: {
    enabled: false,
    points: 5,
    timing: ['Draft']
  },
  advPlay: {
    enabled: false,
    points: 3,
    timing: ['Weekly']
  },
  badAdvPlay: {
    enabled: false,
    points: 3,
    timing: ['Weekly']
  },
  advElim: {
    enabled: false,
    points: 3,
    timing: ['Weekly']
  },
  spokeEpTitle: {
    enabled: false,
    points: 2,
    timing: ['Weekly']
  },
  tribe1st: {
    enabled: false,
    points: 5,
    timing: ['Weekly (Premerge only)']
  },
  tribe2nd: {
    enabled: false,
    points: 3,
    timing: ['Weekly (Premerge only)']
  },
  indivWin: {
    enabled: false,
    points: 10,
    timing: ['Weekly (Postmerge only)']
  },
  indivReward: {
    enabled: false,
    points: 5,
    timing: ['Weekly (Postmerge only)']
  },
  finalists: {
    enabled: false,
    points: 3,
    timing: ['Draft', 'After Merge', 'Before Finale'],
    pickCount: 3
  },
  fireWin: {
    enabled: false,
    points: 7,
    timing: ['Before Finale']
  },
  soleSurvivor: {
    enabled: false,
    points: 10,
    timing: ['Draft', 'After Merge', 'Before Finale']
  }
};

export const BasePredictionRulesZod = z.object(
  Object.fromEntries(ScoringBaseEventNames
    .map((name: ScoringBaseEventName) => [
      name,
      z.object({
        enabled: z.boolean(),
        points: z.coerce.number().gte(0, { message: 'Points must be a positive number' }),
        timing: z.array(PredictionEventTimingZod),
        pickCount: z.coerce.number().optional()
      })
    ])
  )
) as z.ZodObject<Record<ScoringBaseEventName, z.ZodObject<{
  enabled: z.ZodBoolean;
  points: z.ZodNumber;
  timing: z.ZodArray<typeof PredictionEventTimingZod>;
  pickCount: z.ZodOptional<z.ZodNumber>;
}, 'strip',
  z.ZodTypeAny, {
    enabled: boolean;
    points: number;
    timing: PredictionEventTiming[];
    pickCount?: number;
  }, {
    enabled: boolean;
    points: number;
    timing: PredictionEventTiming[];
    pickCount?: number;
  }>>, 'strip', z.ZodTypeAny, BasePredictionRules, BasePredictionRules>;

export const AllBaseEventNames = [
  ...ScoringBaseEventNames,
  'elim', 'noVoteExit', 'tribeUpdate', 'otherNotes'] as const;
export type BaseEventName = typeof AllBaseEventNames[number];
export const BaseEventNameZod = z.enum(AllBaseEventNames);

export const BaseEventFullName: Record<BaseEventName, string> = {
  advFound: 'Advantage Found',
  advPlay: 'Advantage Played',
  badAdvPlay: 'Bad Advantage Play',
  advElim: 'Advantage Eliminated',
  spokeEpTitle: 'Spoke Episode Title',
  tribe1st: 'Tribe/Team 1st',
  tribe2nd: 'Tribe/Team 2nd',
  indivWin: 'Individual Immunity',
  indivReward: 'Individual Reward',
  finalists: 'Finalists',
  fireWin: 'Fire Making Challenge',
  soleSurvivor: 'Sole Survivor',
  elim: 'Eliminated',
  noVoteExit: 'No Vote Exit',
  tribeUpdate: 'Tribe Update',
  otherNotes: 'Other Notes'
};

export const BaseEventDescriptions: {
  main: Record<ScoringBaseEventName, string>,
  italics: Partial<Record<ScoringBaseEventName, string>>
} = {
  main: {
    indivWin: 'Points if your castaway wins an individual immunity challenge',
    indivReward: 'Points if your castaway wins an individual reward challenge',
    tribe1st: 'Points if your castaway’s tribe/team wins a challenge',
    tribe2nd: 'Points if your castaway’s tribe/team comes second in a challenge',
    advFound: 'Points if your castaway finds or earns an advantage',
    advPlay: 'Points if your castaway plays an advantage effectively',
    badAdvPlay: 'Points if your castaway plays an advantage poorly or unnecessarily',
    advElim: 'Points if your castaway is eliminated with an advantage in their pocket',
    spokeEpTitle: 'Points if your castaway is quoted in the episode title',
    finalists: 'Points if your castaway makes it to the final tribal council',
    fireWin: 'Points if your castaway wins the fire-making challenge',
    soleSurvivor: 'Points if your castaway wins the season'
  },
  italics: {
    tribe2nd: '(only applies for challenges with 3+ tribes/teams)',
    badAdvPlay: '(usually negative)',
    advElim: '(usually negative)',
  },
};

export const BasePredictionReferenceTypes: Record<ScoringBaseEventName, ReferenceType[]> = {
  advFound: ['Castaway'],
  advPlay: ['Castaway'],
  badAdvPlay: ['Castaway'],
  advElim: ['Castaway'],
  spokeEpTitle: ['Castaway'],
  tribe1st: ['Tribe'],
  tribe2nd: ['Tribe'],
  indivWin: ['Castaway'],
  indivReward: ['Castaway'],
  finalists: ['Castaway'],
  fireWin: ['Castaway'],
  soleSurvivor: ['Castaway'],
} as const;

export type BaseEventId = number;
export type BaseEvent = {
  baseEventId: BaseEventId,
  eventName: BaseEventName,
  label: string,
  referenceType: ReferenceType,
  references: number[],
  castaways: CastawayName[],
  tribes: TribeName[],
  notes: string[] | null
};

// League Events
export const EventNameZod = z.coerce.string()
  .min(3, { message: 'Name must be between 3 and 16 characters' })
  .max(32, { message: 'Name must be between 3 and 16 characters' });
export const EventDescZod = z.coerce.string()
  .min(3, { message: 'Description must be between 3 and 256 characters, or blank' })
  .max(256, { message: 'Description must be between 3 and 256 characters, or blank' });

export const LeagueEventTypeOptions = ['Direct', 'Prediction'] as const;
export type LeagueEventType = typeof LeagueEventTypeOptions[number];
export const EventTypeZod = z.enum(LeagueEventTypeOptions);

export const ReferenceOptions = ['Castaway', 'Tribe'] as const;
export type ReferenceType = typeof ReferenceOptions[number];
export const EventRefZod = z.enum(ReferenceOptions);

export const LeagueEventRuleZod = z.object({
  leagueEventRuleId: z.number().optional(),
  eventName: EventNameZod,
  description: EventDescZod,
  points: EventPointsZod,
  eventType: EventTypeZod,
  referenceTypes: z.array(EventRefZod),
  timing: PredictionEventTimingZod.array(),
});
export type LeagueEventRule = z.infer<typeof LeagueEventRuleZod>;
export const defaultLeagueEventRule: LeagueEventRule = {
  eventName: '',
  description: '',
  points: 5,
  eventType: 'Direct',
  referenceTypes: ['Castaway'],
  timing: [],
};

export type BaseEventPrediction = {
  eventName: BaseEventName,
  episodeNumber: EpisodeNumber,
  predictionMade: {
    referenceType: ReferenceType;
    referenceId: number;
  } | null
};

export type EventPrediction = LeagueEventRule & {
  predictionMade: {
    referenceType: ReferenceType;
    referenceId: number;
  } | null
};

export type LeagueEventId = number;
export type LeagueEventName = string;

export type LeagueDirectEvent = {
  leagueEventRuleId: LeagueEventId,
  eventId: LeagueEventId,
  eventName: LeagueEventName,
  points: number,
  referenceType: ReferenceType,
  referenceId: number,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  referenceName: CastawayName | TribeName | LeagueMemberDisplayName,
  notes: string[] | null
};

export type LeaguePredictionEvent = {
  leagueEventRuleId: number,
  eventId: LeagueEventId,
  eventName: LeagueEventName,
  points: number,
  referenceType: ReferenceType,
  referenceId: number,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  referenceName: CastawayName | TribeName | LeagueMemberDisplayName,
  hit: boolean,
  predictionMaker: LeagueMemberDisplayName,
  notes: string[] | null
};

export type Prediction = {
  leagueMember: LeagueMemberDisplayName,
  eventName: LeagueEventName,
  leagueEventRuleId: LeagueEventId,
  points: number,
  timing: PredictionEventTiming[]
  prediction: {
    episodeNumber: EpisodeNumber,
    castaway: CastawayName | null,
    castawayShort: CastawayName | null,
    tribe: TribeName | null
    referenceType: ReferenceType,
    referenceId: number,
  },
  results: {
    episodeNumber: EpisodeNumber | null,
    castaway: CastawayName | null,
    castawayShort: CastawayName | null,
    tribe: TribeName | null
    referenceType: ReferenceType | null,
    referenceId: number | null,
  }[]
};

export type LeagueEvent = {
  eventId: LeagueEventId,
  eventName: LeagueEventName,
  points: number,
  referenceType: ReferenceType,
  referenceId: number,
  notes: string[] | null
};

const advList = ['Advantage', 'Idol', 'Beware Advantage', 'Extra Vote', 'Block a Vote', 'Steal a Vote',
  'Safety Without Power', 'Idol Nullifier', 'Challenge Advantage', 'Knowledge is Power'] as const;

export const baseEventLabels: Record<BaseEventName, readonly [string, ...string[]]> = {
  advFound: advList,
  advPlay: [...advList, 'Shot in the Dark'],
  badAdvPlay: [...advList, 'Shot in the Dark'],
  advElim: advList,
  spokeEpTitle: ['Spoke Episode Title'],
  tribe1st: ['Tribe Immunity and Reward', 'Tribe Immunity', 'Tribe Reward'],
  tribe2nd: ['Tribe Immunity and Reward', 'Tribe Immunity', 'Tribe Reward'],
  indivWin: ['Individual Immunity and Reward', 'Individual Immunity'],
  indivReward: ['Individual Reward'],
  finalists: ['Final 3', 'Final 2'],
  fireWin: ['Won Fire Making'],
  soleSurvivor: ['Sole Survivor'],
  elim: ['Voted Out', 'Blindside', 'Rock Draw'],
  noVoteExit: ['Lost Fire Making', 'Quit', 'Medevac', 'Removed'],
  tribeUpdate: ['Starting Tribes', 'Merge Tribe', 'Tribe Swap', 'New Tribes'],
  otherNotes: ['Other Notes']
} as const;

export const baseEventLabelPrefixes: Record<BaseEventName, string> = {
  advFound: 'Found',
  advPlay: 'Correctly played',
  badAdvPlay: 'Incorrectly played',
  advElim: 'Eliminated with',
  spokeEpTitle: '',
  tribe1st: '1st',
  tribe2nd: '2nd',
  indivWin: 'Won',
  indivReward: 'Won',
  finalists: '',
  fireWin: '',
  soleSurvivor: '',
  elim: '',
  noVoteExit: '',
  tribeUpdate: '',
  otherNotes: ''
} as const;

export const BaseEventInsertZod = z.object({
  episodeId: z.number(),
  eventName: BaseEventNameZod,
  referenceType: EventRefZod,
  references: z.number().array().nonempty(),
  label: z.string(),
  notes: z.array(z.string()).nullable(),
  updateTribe: z.coerce.number().nullable().optional(),
});
export type BaseEventInsert = z.infer<typeof BaseEventInsertZod>;

export const LeagueEventInsertZod = z.object({
  leagueEventRuleId: z.coerce.number(),
  episodeId: z.coerce.number(),
  referenceType: EventRefZod,
  referenceId: z.coerce.number(),
  notes: z.array(z.string()).nullable(),
});
export type LeagueEventInsert = z.infer<typeof LeagueEventInsertZod>;

