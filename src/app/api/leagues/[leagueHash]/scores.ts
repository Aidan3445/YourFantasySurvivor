import { findTribeCastaways } from '~/lib/utils';
import { type QUERIES as LEAGUE_QUERIES } from '../query';
import { type QUERIES as SEASON_QUERIES } from '~/app/api/seasons/query';
import { type ScoringBaseEventName, ScoringBaseEventNames, type BaseEventRule } from '~/server/db/defs/events';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';
import { type LeagueSurvivalCap } from '~/server/db/defs/leagues';

/**
  * Compile the scores for a league 
  * @param baseEvents The base events for the season
  * @param tribesTimeline The tribe updates for the season
  * @param eliminations The eliminations for the season
  * @param leagueEvents The league events
  * @param baseEventRules The league's base event scoring
  * @param selectionTimeline The selection timeline for the league
  * @param survivalCap The survival cap for the league
  * @returns The scores for the league as running totals
  */
export function compileScores(
  baseEvents: Awaited<ReturnType<typeof SEASON_QUERIES.getBaseEvents>>,
  tribesTimeline: Awaited<ReturnType<typeof SEASON_QUERIES.getTribesTimeline>>,
  eliminations: Awaited<ReturnType<typeof SEASON_QUERIES.getEliminations>>,

  leagueEvents: Awaited<ReturnType<typeof LEAGUE_QUERIES.getLeagueEvents>>,
  baseEventRules: BaseEventRule,
  selectionTimeline: Awaited<ReturnType<typeof LEAGUE_QUERIES.getSelectionTimeline>>,

  survivalCap: LeagueSurvivalCap
) {
  const scores: Record<LeagueMemberDisplayName, number[]> = {};

  // score base events
  Object.entries(baseEvents).forEach(([episodeNumber, events]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(events).forEach((event) => {
      if (!ScoringBaseEventNames.includes(event.eventName as ScoringBaseEventName)) return;
      event.tribes.forEach((tribe) => {
        // initialize tribe score if it doesn't exist
        scores[tribe] ??= [];
        scores[tribe][episodeNum] ??= 0;
        // add points to tribe score
        const points = baseEventRules[event.eventName as ScoringBaseEventName];
        scores[tribe][episodeNum] += points;
        // add castaways to be scored
        findTribeCastaways(tribesTimeline, eliminations, tribe, episodeNum).forEach((castaway) => {
          event.castaways.push(castaway);
        });
      });

      event.castaways.forEach((castaway) => {
        // initialize castaway score if it doesn't exist
        scores[castaway] ??= [];
        scores[castaway][episodeNum] ??= 0;
        // add points to castaway score
        const points = baseEventRules[event.eventName as ScoringBaseEventName];
        scores[castaway][episodeNum] += points;
        // score the member who has this castaway selected at this episode
        const cmIndex = Math.min(episodeNum - 1,
          (selectionTimeline.castawayMembers[castaway]?.length ?? 0) - 1);
        const leagueMember = selectionTimeline.castawayMembers[castaway]?.[cmIndex];
        // if the castaway was not selected at this episode, don't score the member
        if (!leagueMember) return;
        scores[leagueMember] ??= [];
        scores[leagueMember][episodeNum] ??= 0;
        scores[leagueMember][episodeNum] += points;
      });
    });
  });

  /* score league events */
  // direct events
  Object.entries(leagueEvents.directEvents).forEach(([episodeNumber, events]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(events).forEach((event) => {
      event.forEach((e) => {
        // initialize member score if it doesn't exist
        scores[e.referenceName] ??= [];
        scores[e.referenceName]![episodeNum] ??= 0;
        scores[e.referenceName]![episodeNum]! += e.points;
        // score castaways if this is a tribe event
        if (e.referenceType === 'Tribe') {
          findTribeCastaways(tribesTimeline, eliminations, e.referenceName, episodeNum).forEach((castaway) => {
            scores[castaway] ??= [];
            scores[castaway][episodeNum] ??= 0;
            scores[castaway][episodeNum] += e.points;
            // score the member who has this castaway selected at this episode
            const cmIndex = Math.min(episodeNum - 1,
              (selectionTimeline.castawayMembers[castaway]?.length ?? 0) - 1);
            const leagueMember = selectionTimeline.castawayMembers[castaway]?.[cmIndex];
            // if the castaway was not selected at this episode, don't score the member
            if (!leagueMember) return;
            scores[leagueMember] ??= [];
            scores[leagueMember][episodeNum] ??= 0;
            scores[leagueMember][episodeNum] += e.points;
          });
        }
        // score members if this is a castaway event
        if (e.referenceType === 'Castaway') {
          const cmIndex = Math.min(episodeNum - 1,
            (selectionTimeline.castawayMembers[e.referenceName]?.length ?? 0) - 1);
          const leagueMember = selectionTimeline.castawayMembers[e.referenceName]?.[cmIndex];
          // if the castaway was not selected at this episode, don't score the member
          if (!leagueMember) return;
          scores[leagueMember] ??= [];
          scores[leagueMember][episodeNum] ??= 0;
          scores[leagueMember][episodeNum] += e.points;
        }
      });
    });
  });

  // prediction events
  Object.entries(leagueEvents.predictionEvents).forEach(([episodeNumber, events]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(events).forEach((event) => {
      // prediction events just earn points for the member who made the prediction
      scores[event.predictionMaker] ??= [];
      scores[event.predictionMaker]![episodeNum] ??= 0;
      scores[event.predictionMaker]![episodeNum]! += event.points;
    });
  });

  // survival streak bonus
  // after each episode the castaway survives, they earn a bonus point
  // then they earn two points for the next episode, then three, etc.
  // the bonus is capped at the survival cap set by the league
  Object.entries(selectionTimeline.memberCastaways).forEach(([member, castaways]) => {
    let streak = 0;
    for (let episodeNumber = 1; episodeNumber < eliminations.length; episodeNumber++) {
      // get the castaways who were eliminated at any point before this episode
      const eliminated = eliminations.slice(0, episodeNumber + 1).flat();
      // get the castaways who were selected by this member at this episode
      const mcIndex = Math.min(episodeNumber - 1, castaways.length - 1);
      // if the castaway selected has been eliminated set the streak to 0
      // note this has the side effect of ensuring that streaks end when
      // a member is out of castaways to select
      if (eliminated.includes(castaways[mcIndex] ?? '')) {
        streak = 0;
        continue;
      }
      // increment the streak and add the bonus to the member's score
      streak++;
      const bonus = Math.min(streak, survivalCap);
      scores[member] ??= [];
      scores[member][episodeNumber] ??= 0;
      scores[member][episodeNumber]! += bonus;
    }
  });

  // fill in missing episodes and convert to running totals
  const episodes = Math.max(...Object.values(scores).map((s) => s.length)) - 1;
  for (const member in scores) {
    const points = scores[member];
    for (let i = 0; i <= episodes; i++) {
      points![i] ??= 0;
      points![i]! += points![i - 1] ?? 0;
    }
  }


  return scores;
}

