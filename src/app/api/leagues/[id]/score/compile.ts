import 'server-only';
import { type Events } from '~/app/api/seasons/[name]/events/query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';
import type { CastawayMembers, AltEvents, MemberCastaways } from './query';
import { findTribeCastaways } from '~/app/api/seasons/[name]/events/scores';

function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  altEvents: AltEvents,
  rules: BaseEventRuleType,
  memberCastaways?: MemberCastaways,
  castawayMembers?: CastawayMembers,
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};
  const elims: string[][] = [];

  // castaway events
  // sort for consistent elimination order
  const sortedCE = castawayEvents.sort((a, b) => a.episode - b.episode);
  for (const { castaway, eventName, episode } of sortedCE) {
    switch (eventName) {
      case 'otherNotes':
        continue;
      case 'elim':
      case 'noVoteExit':
        elims[episode] ??= [];
        elims[episode].push(castaway);
        continue;
      default:
        break;
    }

    const cmIndex = Math.min(episode - 1, (castawayMembers?.[castaway]?.length ?? 0) - 1);
    const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
    if (!name) continue;

    scores[name] ??= [];
    scores[name][episode] ??= 0;
    scores[name][episode] += rules[eventName as keyof BaseEventRuleType];
  }

  // tribe events
  for (const { tribe, eventName, episode } of tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elims, tribe, episode);

    for (const castaway of castaways) {
      const cmIndex = Math.min(episode - 1, (castawayMembers?.[castaway]?.length ?? 0) - 1);
      const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
      if (!name) continue;

      scores[name] ??= [];
      const points = scores[name];

      switch (eventName) {
        case 'tribe1st':
          points[episode] = (points[episode] ?? 0) + rules.tribe1st;
          break;
        case 'tribe2nd':
          points[episode] = (points[episode] ?? 0) + rules.tribe2nd;
          break;
        default:
          continue;
      }
    }
  }

  // alt events
  for (const { name: castaway, points, episode } of altEvents.castawayEvents) {
    const cmIndex = Math.min(episode - 1, (castawayMembers?.[castaway]?.length ?? 0) - 1);
    const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
    if (!name) continue;

    scores[name] ??= [];
    scores[name][episode] ??= 0;
    scores[name][episode] += points;
  }


  for (const { name: tribe, points, episode } of altEvents.tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elims, tribe, episode);

    for (const castaway of castaways) {
      const cmIndex = Math.min(episode - 1, (castawayMembers?.[castaway]?.length ?? 0) - 1);
      const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
      if (!name) continue;

      scores[name] ??= [];
      scores[name][episode] ??= 0;
      scores[name][episode] += points;
    }
  }


  if (memberCastaways) {
    for (const { name, points, episode } of altEvents.memberEvents) {
      scores[name] ??= [];
      scores[name][episode] ??= 0;
      scores[name][episode] += points;
    }

    // add survival bonus
    // each episode that your castaway survives
    // you get points for the number of episodes they've survived
    const CAP = 100;
    Object.entries(memberCastaways).forEach(([member, castaways]) => {
      let streak = 0;
      for (let episodeNum = 1; episodeNum < elims.length; episodeNum++) {
        const eliminated = elims.slice(0, episodeNum + 1).flat();
        const cIndex = Math.min(episodeNum - 1, castaways.length - 1);

        if (eliminated.includes(castaways[cIndex] ?? '')) {
          streak = 0;
          continue;
        }

        scores[member] ??= [];
        scores[member][episodeNum] ??= 0;
        scores[member][episodeNum]! += Math.min(++streak, CAP);
      }
    });
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

  return scores;
}

export function scoreMembers(
  events: Events,
  altEvents: AltEvents,
  rules: BaseEventRuleType,
  memberCastaways: MemberCastaways,
  castawayMembers: CastawayMembers
): Record<string, number[]> {
  return compileScores(events, altEvents, rules, memberCastaways, castawayMembers);
}

export function scoreCastaways(
  events: Events,
  altEvents: AltEvents,
  rules: BaseEventRuleType
): Record<string, number[]> {
  return compileScores(events, altEvents, rules);
}
