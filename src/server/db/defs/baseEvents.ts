import { z } from 'zod';

export const pointRange = z.coerce.number()
  .max(512, { message: 'Points must not exceed ±512' })
  .min(-512, { message: 'Points must not exceed ±512' });

export const BaseEventRule = z.object({
  advFound: pointRange,
  advPlay: pointRange,
  badAdvPlay: pointRange,
  advElim: pointRange,
  spokeEpTitle: pointRange,
  tribe1st: pointRange,
  tribe2nd: pointRange,
  indivWin: pointRange,
  indivReward: pointRange,
  finalists: pointRange,
  fireWin: pointRange,
  soleSurvivor: pointRange,
});

export type BaseEventRuleType = z.infer<typeof BaseEventRule>;

export const defaultBaseRules: BaseEventRuleType = {
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
