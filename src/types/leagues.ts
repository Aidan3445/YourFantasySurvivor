import z from 'zod';
import { EventTypes, PredictionTimings, ReferenceTypes } from '~/lib/events';
import { LEAGUE_NAME_MAX_LENGTH, LEAGUE_NAME_MIN_LENGTH, type LeagueStatuses, type ShauhinModeTimings } from '~/lib/leagues';
import { type EventType, type ReferenceType, type PredictionTiming, type ScoringBaseEventName } from '~/types/events';
import { type Tribe } from '~/types/tribes';
import { type EnrichedCastaway } from '~/types/castaways';
import { type LeagueMember } from '~/types/leagueMembers';

export type LeagueStatus = (typeof LeagueStatuses)[number];

export type League = {
  leagueId: number;
  name: string;
  hash: string;
  status: LeagueStatus;
  season: string;
  seasonId: number;
};

export const LeagueNameZod = z.string()
  .min(LEAGUE_NAME_MIN_LENGTH, { message: `League name must be between ${LEAGUE_NAME_MIN_LENGTH} and ${LEAGUE_NAME_MAX_LENGTH} characters` })
  .max(LEAGUE_NAME_MAX_LENGTH, { message: `League name must be between ${LEAGUE_NAME_MIN_LENGTH} and ${LEAGUE_NAME_MAX_LENGTH} characters` });

export type LeagueSettings = {
  leagueId: number;
  draftDate: Date | null;
  survivalCap: number;
  preserveStreak: boolean;
};

export interface LeagueSettingsUpdate {
  name?: string;
  draftDate?: Date | null;
  survivalCap?: number;
  preserveStreak?: boolean;
}

export type BaseEventRules = Record<ScoringBaseEventName, number>;

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

export type ShauhinModeTiming = (typeof ShauhinModeTimings)[number];
export type ShauhinModeSettings = {
  enabled: boolean;
  maxBet: number;
  maxBetsPerWeek: number;
  startWeek: ShauhinModeTiming;
  customStartWeek: number | null;
  enabledBets: ScoringBaseEventName[];
  noEventIsMiss: boolean;
};

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
  eventName: z.string().max(64),
  description: z.string().max(256),
  points: z.number().int().min(-100).max(100),
  eventType: z.enum(EventTypes),
  referenceTypes: z.enum(ReferenceTypes).array().min(1),
  timing: z.enum(PredictionTimings).array(),
});
export type CustomEventRuleInsert = z.infer<typeof CustomEventRuleInsertZod>;

export type SelectionTimeline = Record<number, (number | null)[]>;
/**
  * Selection timelines for both member->castaway and castaway->member selections.
  * The keys are member IDs or castaway IDs, and the values are arrays of selected IDs with index
  * representing the episode number.
  * ---
  * For example:
  * [memberCastaways][[memberId]][[3]] gives the [castawayId] selected by [memberId] in episode [3].
  * [castawayMembers][[castawayId]][[5]] gives the [memberId] who selected [castawayId] in episode [5].
  * ---
  * If a castaway is available (not selected) in an episode, the value is [null].
  * When a member has no selection in an episode, the value is [null].
  */
export type SelectionTimelines = {
  memberCastaways: SelectionTimeline,
  castawayMembers: SelectionTimeline
};

export type DraftDetails = Record<number, {
  tribe: Tribe;
  castaways: {
    castaway: EnrichedCastaway;
    member: LeagueMember | null;
  }[];
}> 
