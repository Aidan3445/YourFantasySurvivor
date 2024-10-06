import { type Events } from './query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';

export default function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  rules: BaseEventRuleType
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};
  const elimList: string[] = [];

  // init castaway scores
  Object.entries(tribeUpdates[1]!).forEach(([_, castaways]) => {
    castaways.forEach((castaway) => scores[castaway] = [0]);
  });

  // castaway events
  // sort for consistent elimination order
  const sortedCE = castawayEvents.sort((a, b) => a.episode - b.episode);
  for (const { castaway, name, episode } of sortedCE) {
    if (name === 'elim' || name === 'noVoteExit') {
      // this means they left the game
      elimList.push(castaway);
      continue;
    } else if (name === 'otherNotes') continue;

    scores[castaway] ??= [];

    const points = scores[castaway];
    points[episode] = (points[episode] ?? 0) + rules[name as keyof BaseEventRuleType];
  }

  // tribe events
  for (const { tribe, name, episode } of tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elimList, tribe, episode);

    for (const castaway of castaways) {

      scores[castaway] ??= [];
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

// find the castaways on a tribe at a given episode
export function findTribeCastaways(
  tribeUpdates: Record<number, Record<string, string[]>>,
  elimList: string[],
  tribe: string,
  episode: number) {
  const onTribe = new Set(tribeUpdates[1]?.[tribe] ?? []);
  for (let i = 2; i <= episode; i++) {
    // -2 because we're looking at the previous episode
    // and the elimList is 0-indexed while the episodes/tribeUpdates are 1-indexed
    if (elimList[i - 2]) onTribe.delete(elimList[i - 2]!);
    if (!tribeUpdates[i]) continue;
    Object.entries(tribeUpdates[i]!).forEach(([tribeName, castaways]) => {
      if (tribeName === tribe) {
        castaways.forEach((castaway) => onTribe.add(castaway));
      } else {
        castaways.forEach((castaway) => onTribe.delete(castaway));
      }
    });
  }

  return [...onTribe];
}

