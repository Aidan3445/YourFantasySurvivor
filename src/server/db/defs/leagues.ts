import { z } from 'zod';

export const LeagueNameZod = z.string()
  .min(3, { message: 'League name must be between 3 and 64 characters' })
  .max(64, { message: 'League name must be between 3 and 64 characters' });
export type LeagueName = string;

export const LeagueStatusOptions = ['Predraft', 'Draft', 'Active', 'Inactive'] as const;
export type LeagueStatus = typeof LeagueStatusOptions[number];

export const DEFAULT_SURVIVAL_CAP = 5;
export const MAX_SURVIVAL_CAP = 15;
export const SurvivalCapZod = z.object({
  survivalCap: z.coerce.number().int().lte(MAX_SURVIVAL_CAP).gte(0),
  preserveStreak: z.boolean(),
});

export type LeagueSurvivalCap = number;

export type LeagueHash = string;

export interface League {
  leagueName: LeagueName;
  leagueHash: LeagueHash;
  survivalCap: number;
  draftDate: Date;
}

export interface LeagueSettingsUpdate {
  leagueName?: string;
  draftDate?: Date | null;
  survivalCap?: number;
  preserveStreak?: boolean;
}
