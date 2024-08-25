import { z } from 'zod';
import { BaseEventRule } from './leagues';
import { CustomEventRule } from './customEvents';
import { WeeklyEventRule } from './weeklyEvents';
import { SeasonEventRule } from './seasonEvents';

export const Rules = z.intersection(
  BaseEventRule,
  z.object({
    custom: z.array(CustomEventRule),
    weekly: z.array(WeeklyEventRule),
    season: z.array(SeasonEventRule),
  }));

export type RulesType = z.infer<typeof Rules>;
