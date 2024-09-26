import { type Events } from '~/app/api/seasons/[name]/events/query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';
import { type AltEvents } from './query';

export default function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  altEvents: AltEvents,
  memberCastaways: Record<number, Record<string, string>>,
  rules: BaseEventRuleType
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};
  const elimList: string[] = [];

  // castaway events
  // sort for consistent elimination order
  const sortedCE = castawayEvents.sort((a, b) => a.episode - b.episode);
  for (const { castaway, name, episode } of sortedCE) {
    if (!(name in rules)) {
      // this means they left the game
      elimList.push(castaway);
      continue;
    }

    const member = findMember(memberCastaways, castaway, episode);
    if (!member) continue;

    console.log(`${member} scored ${rules[name as keyof BaseEventRuleType]} for ${name} in episode ${episode} from ${castaway}`);

    scores[member] ??= [];

    const points = scores[member];
    points[episode] = (points[episode] ?? 0) + rules[name as keyof BaseEventRuleType];
  }

  // tribe events
  for (const { tribe, name, episode } of tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elimList, tribe, episode);

    for (const castaway of castaways) {
      const member = findMember(memberCastaways, castaway, episode);
      if (!member) continue;

      console.log(`${member} scored ${rules[name as keyof BaseEventRuleType]} for ${name} in episode ${episode} from ${castaway} on ${tribe}`);

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
  for (const { castaway, points, episode } of altEvents.castawayEvents) {
    const member = findMember(memberCastaways, castaway, episode);
    if (!member) continue;

    console.log(`${member} scored ${points} for castaway event in episode ${episode} from ${castaway}`);

    scores[member] ??= [];
    const memberPoints = scores[member];
    memberPoints[episode] = (memberPoints[episode] ?? 0) + points;
  }

  for (const { tribe, points, episode } of altEvents.tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elimList, tribe, episode);

    for (const castaway of castaways) {
      const member = findMember(memberCastaways, castaway, episode);
      if (!member) continue;

      console.log(`${member} scored ${points} for tribe event in episode ${episode} from ${castaway} on ${tribe}`);

      scores[member] ??= [];
      const memberPoints = scores[member];
      memberPoints[episode] = (memberPoints[episode] ?? 0) + points;
    }
  }

  for (const { member, points, episode } of altEvents.memberEvents) {

    console.log(`${member} scored ${points} for member event in episode ${episode}`);

    scores[member] ??= [];
    const memberPoints = scores[member];
    memberPoints[episode] = (memberPoints[episode] ?? 0) + points;
  }

  // add survival bonus
  // each episode that your castaway survives
  // you get points for the number of episodes they've survived
  const members = Object.values(Object.values(memberCastaways)[0] ?? {});
  const survivalTable = members.reduce((acc, castaway) => {
    acc[castaway] = 1;
    return acc;
  }, {} as Record<string, number>);

  for (let i = 1; i <= elimList.length; i++) {
    const elminated = elimList[i - 1]!;

    for (const member in survivalTable) {
      if (findMember(memberCastaways, elminated, i) === member) {
        survivalTable[member] = 0;
        console.log(`${member} lost ${elminated} in episode ${i}`);
      } else {
        scores[member] ??= [];
        scores[member][i] ??= 0;
        scores[member][i]! += survivalTable[member]!++;
      }
    }
  }

  // fill in missing episodes
  const episodes = Math.max(...Object.values(scores).map((s) => s.length)) - 1;
  for (const member in scores) {
    const points = scores[member];
    if (!points) continue;
    for (let i = 1; i <= episodes; i++) {
      points[i] ??= 0;
    }
  }

  console.log(scores);

  return scores;
}

// find the member that has the castaway selected 
function findMember(memberCastaways: Record<number, Record<string, string>>, castaway: string, episode: number) {
  console.log(`Finding member for ${castaway} in episode ${episode}`);
  console.log(memberCastaways);

  let member = memberCastaways[1]?.[castaway];
  for (let i = 2; i <= episode; i++) {
    if (!memberCastaways[i]) continue;

    if (memberCastaways[i]![castaway]) member = memberCastaways[i]![castaway];
    else if (member && Object.values(memberCastaways[i]!).includes(member)) member = undefined;
  }
  console.log(`Found ${member}`);

  return member;

}

// find the castaways on a tribe at a given episode
function findTribeCastaways(
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

