import 'server-only';
import { type Events } from '~/app/api/seasons/[name]/events/query';
import { type BaseEventRuleType } from '~/server/db/schema/leagues';
import type { CastawayMembers, AltEvents, MemberCastaways } from './query';
import { findTribeCastaways } from '~/app/api/seasons/[name]/events/scores';
import { parseInt } from 'lodash';

function compileScores(
  { castawayEvents, tribeEvents, tribeUpdates }: Events,
  altEvents: AltEvents,
  rules: BaseEventRuleType,
  memberCastaways?: MemberCastaways,
  castawayMembers?: CastawayMembers,
): Record<string, number[]> {
  const scores: Record<string, number[]> = {};
  const elims: Record<number, string[]> = [];

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


    const cmIndex = Math.min(episode, castawayMembers?.[castaway]?.length ?? 0);
    const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
    if (!name) continue;

    scores[name] ??= [];
    scores[name][episode] ??= 0;
    scores[name][episode] += rules[eventName as keyof BaseEventRuleType];

    if (castaway === 'Sol') {
      console.log('-----------------');
      console.log('sol', episode, eventName);
      console.log('cmIndex', cmIndex);
      console.log('name', name);
      console.log('points', rules[eventName as keyof BaseEventRuleType]);
      console.log('scores', scores[name]);
      console.log('-----------------');
    }
  }

  // tribe events
  for (const { tribe, eventName, episode } of tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elims, tribe, episode);

    for (const castaway of castaways) {
      const cmIndex = Math.min(episode, castawayMembers?.[castaway]?.length ?? 0);
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
          break;
      }
    }
  }

  // alt events
  for (const { name: castaway, points, episode } of altEvents.castawayEvents) {
    const cmIndex = Math.min(episode, castawayMembers?.[castaway]?.length ?? 0);
    const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
    if (!name) continue;

    scores[name] ??= [];
    scores[name][episode] ??= 0;
    scores[name][episode] += points;
  }


  for (const { name: tribe, points, episode } of altEvents.tribeEvents) {
    const castaways = findTribeCastaways(tribeUpdates, elims, tribe, episode);

    for (const castaway of castaways) {
      const cmIndex = Math.min(episode, castawayMembers?.[castaway]?.length ?? 0);
      const name = castawayMembers ? castawayMembers[castaway]?.[cmIndex] : castaway;
      if (!name) continue;

      scores[name] ??= [];
      scores[name][episode] ??= 0;
      scores[name][episode] += points;
    }
  }


  for (const { name, points, episode } of altEvents.memberEvents) {
    scores[name] ??= [];
    scores[name][episode] ??= 0;
    scores[name][episode] += points;
  }

  // add survival bonus
  // each episode that your castaway survives
  // you get points for the number of episodes they've survived
  const CAP = 100;
  Object.entries(memberCastaways ?? {}).forEach(([member, castaways]) => {
    let streak = 0;
    Object.entries(elims).forEach(([episode, eliminated]) => {
      const episodeNum = parseInt(episode);
      if (eliminated.includes(castaways[episodeNum - 1] ?? '')) {
        streak = 0;
        return;
      }

      scores[member] ??= [];
      scores[member][episodeNum] ??= 0;
      scores[member][episodeNum] += Math.min(++streak, CAP);
    });
  });

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
