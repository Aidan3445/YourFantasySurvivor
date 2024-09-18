import { type Events } from '~/app/api/seasons/[name]/events/query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';
import { type RulesType } from '~/server/db/schema/rules';

export default function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  memberCastaways: Record<number, Record<string, string>>,
  rules: RulesType
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};

  // castaway events
  for (const { castaway, name, episode } of castawayEvents) {
    const member = findMember(memberCastaways, castaway, episode);
    if (!member) continue;

    scores[member] ??= [];

    const points = scores[member];
    points[episode] = (points[episode] ?? 0) + rules[name as keyof BaseEventRuleType];
  }

  // tribe events
  for (const { tribe, name, episode } of tribeEvents) {
    const castaways = tribeUpdates[episode]?.[tribe] ?? [];

    for (const castaway of castaways) {
      const member = findMember(memberCastaways, castaway, episode);
      if (!member) continue;

      scores[member] ??= [];
      const points = scores[member];

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

// find the member that has the castaway selected 
function findMember(memberCastaways: Record<number, Record<string, string>>, castaway: string, episode: number) {
  for (let i = episode; i >= 0; i--) {
    const member = memberCastaways[i]?.[castaway];
    if (member) return member;
  }
}
