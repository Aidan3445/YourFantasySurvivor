import { defaultBaseRules, defaultPredictionRules, type BaseEventRule } from '~/types/events';
import { compileScores as scoresCompiler } from '~/app/api/leagues/[leagueHash]/scores';
import { type seasonsService as SEASON_QUERIES } from '~/services/seasons';

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

