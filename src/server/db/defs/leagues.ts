import { z } from 'zod';

export const LeagueNameZod = z.string()
  .min(3, { message: 'League name must be between 3 and 64 characters' })
  .max(64, { message: 'League name must be between 3 and 64 characters' });
export type LeagueName = string;

export const DEFAULT_SURVIVAL_CAP = 5;
export const MAX_SURVIVAL_CAP = 20;
export const SurvivalCapZod = z.coerce.number().int().lte(MAX_SURVIVAL_CAP).gte(0);
export type LeagueSurvivalCap = number;

export const DraftTimingOptions = ['Before Premiere', 'After Premiere'] as const;
export type LeagueDraftTiming = typeof DraftTimingOptions[number];

export type Leaguehash = string;

export interface League {
  leagueName: LeagueName;
  leagueHash: Leaguehash;
  survivalCap: number;
  draftTiming: LeagueDraftTiming;
  draftDate: Date;
}

export interface LeagueSettingsUpdate {
  leagueName?: string;
  survivalCap?: number;
  draftTiming?: LeagueDraftTiming;
  draftDate?: Date;
}
