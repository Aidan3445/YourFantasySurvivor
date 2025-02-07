import { z } from 'zod';

export const LeagueNameZod = z.string()
  .min(3, { message: 'League name must be between 3 and 64 characters' })
  .max(64, { message: 'League name must be between 3 and 64 characters' });

export const DEFAULT_SURVIVAL_CAP = 5;
export const MAX_SURVIVAL_CAP = 20;
export const SurvivalCapZod = z.coerce.number().int().lte(MAX_SURVIVAL_CAP).gte(0);

export const DraftTimingOptions = [
  'Before Premier',
  'After Premier'
] as const;
export type DraftTiming = typeof DraftTimingOptions[number];
