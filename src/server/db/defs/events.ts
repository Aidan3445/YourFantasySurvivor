import { z } from 'zod';

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

export type BaseEvent = {
  baseEventId: number;
  episode: number;
  name: BaseEventName;
  castaways: string[];
  tribes: string[];
  keywords: string[];
  notes: string[];
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
  'Draft', 'Weekly', 'After Merge', 'Before Finale', 'Manual'] as const;
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
