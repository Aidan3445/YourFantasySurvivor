import { z } from 'zod';
import { type CastawayName } from './castaways';
import { type TribeName } from './tribes';
import { type LeagueMemberDisplayName } from './leagueMembers';

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
  advElim: -10,
  spokeEpTitle: 2,
  tribe1st: 2,
  tribe2nd: 1,
  indivWin: 10,
  indivReward: 5,
  finalists: 5,
  fireWin: 5,
  soleSurvivor: 10,
};

export const AllBaseEventNames = [
  ...ScoringBaseEventNames,
  'elim', 'noVoteExit', 'tribeUpdate', 'otherNotes'] as const;
export type BaseEventName = typeof AllBaseEventNames[number];
export const BaseEventNameZod = z.enum(AllBaseEventNames);

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

export const LeaguePredictionTimingOptions = [
  'Draft', 'Weekly', 'After Merge', 'Before Finale',
  'Manual', 'Weekly (Premerge only)', 'Weekly (Postmerge only)'] as const;
export type LeagueEventTiming = typeof LeaguePredictionTimingOptions[number];
export const EventTimingZod = z.enum(LeaguePredictionTimingOptions);

export const ReferenceOptions = ['Castaway', 'Tribe', 'Member'] as const;
export type ReferenceType = typeof ReferenceOptions[number];
export const EventRefZod = z.enum(ReferenceOptions);

export const LeagueEventRuleZod = z.object({
  leagueEventRuleId: z.number().optional(),
  eventName: EventNameZod,
  description: EventDescZod,
  points: EventPointsZod,
  eventType: EventTypeZod,
  referenceTypes: z.array(EventRefZod),
  timing: EventTimingZod.array(),
  public: z.boolean(),
});
export type LeagueEventRule = z.infer<typeof LeagueEventRuleZod>;
export const defaultLeagueEventRule: LeagueEventRule = {
  eventName: '',
  description: '',
  points: 5,
  eventType: 'Direct',
  referenceTypes: ['Castaway'],
  timing: [],
  public: false,
};

export type LeagueEventPrediction = LeagueEventRule & {
  predictionMade: {
    referenceType: ReferenceType;
    referenceId: number;
  } | null
};

export type LeagueEventId = number;
export type LeagueEventName = string;

export type LeagueDirectEvent = {
  eventId: LeagueEventId,
  eventName: LeagueEventName,
  points: number,
  referenceType: ReferenceType,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  referenceName: CastawayName | TribeName | LeagueMemberDisplayName,
  notes: string[] | null
};

export type LeaguePredictionEvent = {
  eventId: LeagueEventId,
  eventName: LeagueEventName,
  points: number,
  referenceType: ReferenceType,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  referenceName: CastawayName | TribeName | LeagueMemberDisplayName,
  predictionMaker: LeagueMemberDisplayName,
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
  spokeEpTitle: 'Spoke',
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
});
export type BaseEventInsert = z.infer<typeof BaseEventInsertZod>;


