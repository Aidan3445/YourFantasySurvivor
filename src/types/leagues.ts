import z from 'zod';
import { EventTypes, PredictionTimings, ReferenceTypes, ScoringBaseEventNames } from '~/lib/events';
import { ABS_MAX_EVENT_POINTS, LEAGUE_NAME_MAX_LENGTH, LEAGUE_NAME_MIN_LENGTH, MAX_SURVIVAL_CAP, SHAUHIN_MODE_MAX_MAX_BETS_PER_WEEK, ShauhinModeTimings, type LeagueStatuses } from '~/lib/leagues';
import { type EventType, type ReferenceType, type PredictionTiming, type ScoringBaseEventName } from '~/types/events';
import { type Tribe } from '~/types/tribes';
import { type EnrichedCastaway } from '~/types/castaways';
import { ColorZod, type CurrentSelection, DisplayNameZod, type LeagueMember } from '~/types/leagueMembers';

export type LeagueStatus = (typeof LeagueStatuses)[number];

export type League = {
  leagueId: number;
  name: string;
  hash: string;
  status: LeagueStatus;
  season: string;
  seasonId: number;
  startWeek: number | null;
};

export type PublicLeague = {
  name: string;
  status: LeagueStatus;
  season: string;
  usedColors: string[];
};

export type LeagueDetails = {
  league: League;
  member: LeagueMember;
  currentSelection: CurrentSelection;
  memberCount: number,
};

export const LeagueNameZod = z.string()
  .min(LEAGUE_NAME_MIN_LENGTH, { message: `League name must be between ${LEAGUE_NAME_MIN_LENGTH} and ${LEAGUE_NAME_MAX_LENGTH} characters` })
  .max(LEAGUE_NAME_MAX_LENGTH, { message: `League name must be between ${LEAGUE_NAME_MIN_LENGTH} and ${LEAGUE_NAME_MAX_LENGTH} characters` });

export const LeagueInsertZod = z.object({
  leagueName: LeagueNameZod,
  member: z.object({
    displayName: DisplayNameZod,
    color: ColorZod,
  }).transform(data => ({
    ...data,
    displayName: data.displayName.trim(),
  })),
  draftDate: z.date().optional(),
});
export type LeagueInsert = z.infer<typeof LeagueInsertZod>;

export type LeagueSettings = {
  leagueId: number;
  isProtected: boolean;
  draftDate: Date | null;
  survivalCap: number;
  preserveStreak: boolean;
};

export type LeagueSettingsUpdate = {
  name?: string;
  isProtected?: boolean;
  draftDate?: Date | null | string;
  survivalCap?: number;
  preserveStreak?: boolean;
}

export const LeagueDetailsUpdateZod = z.object({
  name: LeagueNameZod,
  isProtected: z.boolean(),
});
export type LeagueDetailsUpdate = z.infer<typeof LeagueDetailsUpdateZod>;

export const SurvivalCapZod = z.coerce.number().int()
  .gte(0, { message: `Survival cap must be either 0 (no cap) or less than ${MAX_SURVIVAL_CAP}` })
  .lte(MAX_SURVIVAL_CAP, { message: `Survival cap must be either 0 (no cap) or less than ${MAX_SURVIVAL_CAP}` });

export const LeagueSurvivalUpdateZod = z.object({
  survivalCap: SurvivalCapZod,
  preserveStreak: z.boolean(),
});
export type LeagueSurvivalUpdate = z.infer<typeof LeagueSurvivalUpdateZod>;

export const EventPointsZod = z.coerce.number().int()
  .gte(-ABS_MAX_EVENT_POINTS, { message: `Points must be between -${ABS_MAX_EVENT_POINTS} and ${ABS_MAX_EVENT_POINTS}` })
  .lte(ABS_MAX_EVENT_POINTS, { message: `Points must be between -${ABS_MAX_EVENT_POINTS} and ${ABS_MAX_EVENT_POINTS}` });

export type BaseEventRules = Record<ScoringBaseEventName, number>;
export const BaseEventRulesZod = z.object(
  Object.fromEntries(ScoringBaseEventNames
    .map((name: ScoringBaseEventName) => [name, EventPointsZod]))
) as z.ZodObject<Record<ScoringBaseEventName, z.ZodNumber>, 'strip', z.ZodTypeAny, Record<ScoringBaseEventName, number>, Record<ScoringBaseEventName, number>>;

export type BaseEventPredictionRulesSchema = {
  advFoundPrediction: boolean | null,
  advFoundPredictionPoints: number | null,
  advFoundPredictionTiming: PredictionTiming[] | null,

  advPlayPrediction: boolean | null,
  advPlayPredictionPoints: number | null,
  advPlayPredictionTiming: PredictionTiming[] | null,

  badAdvPlayPrediction: boolean | null,
  badAdvPlayPredictionPoints: number | null,
  badAdvPlayPredictionTiming: PredictionTiming[] | null,

  advElimPrediction: boolean | null,
  advElimPredictionPoints: number | null,
  advElimPredictionTiming: PredictionTiming[] | null,

  spokeEpTitlePrediction: boolean | null,
  spokeEpTitlePredictionPoints: number | null,
  spokeEpTitlePredictionTiming: PredictionTiming[] | null,

  tribe1stPrediction: boolean | null,
  tribe1stPredictionPoints: number | null,
  tribe1stPredictionTiming: PredictionTiming[] | null,

  tribe2ndPrediction: boolean | null,
  tribe2ndPredictionPoints: number | null,
  tribe2ndPredictionTiming: PredictionTiming[] | null,

  indivWinPrediction: boolean | null,
  indivWinPredictionPoints: number | null,
  indivWinPredictionTiming: PredictionTiming[] | null,

  indivRewardPrediction: boolean | null,
  indivRewardPredictionPoints: number | null,
  indivRewardPredictionTiming: PredictionTiming[] | null,

  finalistsPrediction: boolean | null,
  finalistsPredictionPoints: number | null,
  finalistsPredictionTiming: PredictionTiming[] | null,

  fireWinPrediction: boolean | null,
  fireWinPredictionPoints: number | null,
  fireWinPredictionTiming: PredictionTiming[] | null,

  soleSurvivorPrediction: boolean | null,
  soleSurvivorPredictionPoints: number | null,
  soleSurvivorPredictionTiming: PredictionTiming[] | null,
}

export type BaseEventPredictionSetting = {
  enabled: boolean;
  points: number;
  timing: PredictionTiming[];
};
export type BaseEventPredictionRules = Record<ScoringBaseEventName, BaseEventPredictionSetting>;

export const PredictionTimingZod = z.enum(PredictionTimings);

export const BasePredictionRulesZod = z.object(
  Object.fromEntries(ScoringBaseEventNames
    .map((name: ScoringBaseEventName) => [
      name,
      z.object({
        enabled: z.boolean(),
        points: z.coerce.number().gte(0, { message: 'Points must be a positive number' }),
        timing: z.array(PredictionTimingZod),
      })
    ])
  )
) as z.ZodObject<Record<ScoringBaseEventName, z.ZodObject<{
  enabled: z.ZodBoolean;
  points: z.ZodNumber;
  timing: z.ZodArray<typeof PredictionTimingZod>;
}, 'strip',
  z.ZodTypeAny, BaseEventPredictionSetting, BaseEventPredictionSetting>>,
  'strip', z.ZodTypeAny, BaseEventPredictionRules, BaseEventPredictionRules>;

export type ShauhinModeTiming = (typeof ShauhinModeTimings)[number];
export type ShauhinModeSettings = {
  enabled: boolean;
  maxBet: number;
  maxBetsPerWeek: number;
  startWeek: ShauhinModeTiming;
  customStartWeek: number | null;
  enabledBets: ScoringBaseEventName[];
};
export const ShauhinModeSettingsZod = z.object({
  enabled: z.boolean(),
  maxBet: EventPointsZod.refine(val => val >= 0, { message: 'Max bet must be positive or 0 for unlimited.' }),
  maxBetsPerWeek: z.coerce.number().int()
    .min(0, { message: 'Max bets per week must be at least 1 or 0 for unlimited.' })
    .max(SHAUHIN_MODE_MAX_MAX_BETS_PER_WEEK, { message: `Max bets per week cannot exceed ${SHAUHIN_MODE_MAX_MAX_BETS_PER_WEEK}` }),
  startWeek: z.enum(ShauhinModeTimings),
  customStartWeek: z.coerce.number().int().min(3).nullable(),
  enabledBets: z.array(z.enum(ScoringBaseEventNames)).min(1, { message: 'At least one bet type must be enabled' }),
}).refine(data => data.startWeek !== 'Custom' || (data.customStartWeek !== null && data.customStartWeek >= 3), {
  message: 'Custom start week must be set and at least 3 when start week is Custom'
});

export type CustomEventRule = {
  customEventRuleId: number;
  eventName: string;
  description: string;
  points: number;
  eventType: EventType;
  referenceTypes: ReferenceType[];
  timing: PredictionTiming[];
};

export type LeagueRules = {
  base: BaseEventRules | null;
  basePrediction: BaseEventPredictionRules | null;
  shauhinMode: ShauhinModeSettings | null;
  custom: CustomEventRule[];
};

export const CustomEventRuleInsertZod = z.object({
  eventName: z.string().max(64).min(3),
  description: z.string().max(256),
  points: EventPointsZod,
  eventType: z.enum(EventTypes),
  referenceTypes: z.enum(ReferenceTypes).array().min(1),
  timing: z.enum(PredictionTimings).array(),
}).refine(data => data.eventType !== 'Prediction' || (data.timing.length > 0), {
  message: 'At least one timing must be selected for prediction events'
});
export type CustomEventRuleInsert = z.infer<typeof CustomEventRuleInsertZod>;

/**
  * Record<castawayId | memberId, (castawayId | null)[] | (memberId | null)[]>
  */
export type SelectionTimeline = Record<number, (number | null)[]>;
/**
  * Selection timelines for both member->castaway and castaway->member selections.
  * The keys are member IDs or castaway IDs, and the values are arrays of selected IDs with index
  * representing the episode number.
  * ---
  * For example:
  * [memberCastaways][[memberId]][[3]] gives the [castawayId] selected by [memberId] in episode [3]
  * [castawayMembers][[castawayId]][[5]] gives the [memberId] who selected [castawayId] in episode [5]
  * ---
  * If a castaway is available (not selected) in an episode, the value is [null].
  * When a member has no selection in an episode, the value is [null].
  */
export type SelectionTimelines = {
  memberCastaways: SelectionTimeline,
  castawayMembers: SelectionTimeline
};

/**
  * Record<tribeId, { tribe, castaways }>
  */
export type DraftDetails = Record<number, {
  tribe: Tribe;
  castaways: {
    castaway: EnrichedCastaway;
    member: LeagueMember | null;
  }[];
}> 
