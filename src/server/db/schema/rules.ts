import { z } from 'zod';
import { BaseEventRule } from './leagues';
import { CustomEventRule } from './customEvents';
import { WeeklyEventRule } from './weeklyEvents';
import { SeasonEventRule } from './seasonEvents';


export const Rules = z.intersection(
  BaseEventRule,
  z.object({
    custom: z.array(CustomEventRule.merge(z.object({ id: z.number().optional() }))),
    weekly: z.array(WeeklyEventRule.merge(z.object({ id: z.number().optional() }))),
    season: z.array(SeasonEventRule.merge(z.object({ id: z.number().optional() }))),
  }));

export type RulesType = z.infer<typeof Rules>;
