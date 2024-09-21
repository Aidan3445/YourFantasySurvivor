import { type Events } from '~/app/api/seasons/[name]/events/query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';

export default function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  altEvents: { castaway: string; points: number; episode: number }[],
  memberCastaways: Record<number, Record<string, string>>,
  rules: BaseEventRuleType
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};
  const elimList: string[] = [];

  // castaway events
  // sort for consistent elimination order
  const sortedCE = castawayEvents.sort((a, b) => a.episode - b.episode);
  for (const { castaway, name, episode } of sortedCE) {
    const member = findMember(memberCastaways, castaway, episode);
    if (!member) continue;

    scores[member] ??= [];

    const points = scores[member];
    if (!(name in rules)) {
      // this means they left the game
      elimList.push(castaway);
      continue;
    }
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

  // alt events
  for (const { castaway, points, episode } of altEvents) {
    const member = findMember(memberCastaways, castaway, episode);
    if (!member) continue;

    scores[member] ??= [];
    const memberPoints = scores[member];
    memberPoints[episode] = (memberPoints[episode] ?? 0) + points;
  }

  // add survival bonus
  // each episode that your castaway survives
  // you get points for the number of episodes they've survived
  const survivalTable = Object.values(Object.values(memberCastaways)[0] ?? {}).reduce(
    (acc, castaway) => {
      acc[castaway] = 1;
      return acc;
    },
    {} as Record<string, number>
  );

  for (let i = 1; i <= elimList.length; i++) {
    const elminated = elimList[i - 1]!;

    for (const member in survivalTable) {
      if (findMember(memberCastaways, elminated, i) === member) survivalTable[member] = 1;
      else {
        scores[member] ??= [];
        scores[member][i] ??= 0;
        scores[member][i]! += survivalTable[member]!++;
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
