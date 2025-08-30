import { defaultBaseRules, defaultPredictionRules, type BaseEventRule } from '~/server/db/defs/events';
import { compileScores as scoresCompiler } from '../leagues/[leagueHash]/scores';
import { type QUERIES as SEASON_QUERIES } from './query';

export function compileScores(
  baseEvents: Awaited<ReturnType<typeof SEASON_QUERIES.getBaseEvents>>,
  tribesTimeline: Awaited<ReturnType<typeof SEASON_QUERIES.getTribesTimeline>>,
  eliminations: Awaited<ReturnType<typeof SEASON_QUERIES.getEliminations>>,
  baseEventRules?: BaseEventRule,
) {
  return scoresCompiler(
    baseEvents,
    baseEventRules ?? defaultBaseRules,
    {}, defaultPredictionRules,
    { directEvents: {}, predictionEvents: {} },
    { castawayMembers: {}, memberCastaways: {} },
    tribesTimeline,
    eliminations,
    0,
    false
  );
}

