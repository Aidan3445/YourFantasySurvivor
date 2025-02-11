import { z } from 'zod';

export const EventPointsZod = z.coerce.number()
  .lte(512, { message: 'Points must not exceed 512' })
  .gte(-512, { message: 'Points must not be less than -512' });

export const BaseEventRuleZod = z.object({
  advFound: EventPointsZod,
  advPlay: EventPointsZod,
  badAdvPlay: EventPointsZod,
  advElim: EventPointsZod,
  spokeEpTitle: EventPointsZod,
  tribe1st: EventPointsZod,
  tribe2nd: EventPointsZod,
  indivWin: EventPointsZod,
  indivReward: EventPointsZod,
  finalists: EventPointsZod,
  fireWin: EventPointsZod,
  soleSurvivor: EventPointsZod,
});
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
  'Weekly', 'Before Premiere', 'After Premiere', 'After Merge', 'Before Finale'] as const;
export type LeagueEventTiming = typeof LeaguePredictionTimingOptions[number];
export const EventTimingZod = z.enum(LeaguePredictionTimingOptions);

export const LeagueEventRuleZod = z.object({
  eventName: EventNameZod,
  description: EventDescZod,
  points: EventPointsZod,
  type: EventTypeZod,
  timing: EventTimingZod.array(),
  public: z.boolean(),
});
export type LeagueEventRule = z.infer<typeof LeagueEventRuleZod>;
export const defaultLeagueEventRule: LeagueEventRule = {
  eventName: '',
  description: '',
  points: 5,
  type: 'Direct',
  timing: [],
  public: false,
};

export const ReferenceOptions = ['Castaway', 'Tribe', 'Member'] as const;
export type ReferenceType = typeof ReferenceOptions[number];
export const EventRefZod = z.enum(ReferenceOptions);
