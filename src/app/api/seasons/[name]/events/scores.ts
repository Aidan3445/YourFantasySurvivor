import { type Events } from './query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';

export default function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  rules: BaseEventRuleType
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};

  // castaway events
  for (const { castaway, name, episode } of castawayEvents) {
    if (!scores[castaway]) {
      scores[castaway] = [];
    }

    const points = scores[castaway];

    switch (name) {
      case 'indivWin':
      case 'indivReward':
      case 'tribe1st':
      case 'tribe2nd':
      case 'advFound':
      case 'advPlay':
      case 'badAdvPlay':
      case 'advElim':
      case 'spokeEpTitle':
      case 'finalists':
      case 'fireWin':
      case 'soleSurvivor':
        points[episode] = (points[episode] ?? 0) + rules[name];
        break;
      default:
        break;
    }
  }

  // tribe events
  for (const { tribe, name, episode } of tribeEvents) {
    const castaways = tribeUpdates[episode]?.[tribe] ?? [];

    for (const castaway of castaways) {
      if (!scores[castaway]) {
        scores[castaway] = [];
      }

      const points = scores[castaway];

      switch (name) {
        case 'tribe1st':
          points[episode] = (points[episode] ?? 0) + rules.tribe1st;
          break;
        case 'tribe2nd':
          points[episode] = (points[episode] ?? 0) + rules.tribe2nd;
          break;
        default:
          break;
      }
    }
  }
  return scores;
}
