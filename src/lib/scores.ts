import { defaultBaseRules, defaultPredictionRules } from '~/types/events';
import { findTribeCastaways } from '~/lib/utils';
import { type leaguesService as LEAGUE_QUERIES } from '~/services/leagues';
import { type seasonsService as SEASON_QUERIES } from '~/services/seasons';
import { type ScoringBaseEventName, ScoringBaseEventNames, type BaseEventRule, type ReferenceType, type BasePredictionRules } from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import { type LeagueSurvivalCap } from '~/types/leagues';

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
  baseEventRules: BaseEventRule = defaultBaseRules,
  tribesTimeline: Awaited<ReturnType<typeof SEASON_QUERIES.getTribesTimeline>>,
  eliminations: Awaited<ReturnType<typeof SEASON_QUERIES.getEliminations>>,

  basePredictions: Awaited<ReturnType<typeof LEAGUE_QUERIES.getBasePredictions>> = {},
  basePredictionRules: BasePredictionRules = defaultPredictionRules,
  leagueEvents: Awaited<ReturnType<typeof LEAGUE_QUERIES.getLeagueEvents>> = { directEvents: {}, predictionEvents: {} },
  selectionTimeline: Awaited<ReturnType<typeof LEAGUE_QUERIES.getSelectionTimeline>> = { castawayMembers: {}, memberCastaways: {} },
  survivalCap: LeagueSurvivalCap = 0,
  preserveStreak = false
) {
  const scores: Record<ReferenceType | 'Member', Record<LeagueMemberDisplayName, number[]>> = {
    Castaway: {},
    Tribe: {},
    Member: {},
  };

  // score base events
  Object.entries(baseEvents).forEach(([episodeNumber, events]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(events).forEach((event) => {
      const baseEvent = event.eventName as ScoringBaseEventName;
      event.tribes.forEach((tribe) => {
        // add castaways to be scored
        findTribeCastaways(tribesTimeline, eliminations, tribe, episodeNum).forEach((castaway) => {
          if (!event.castaways.includes(castaway)) event.castaways.push(castaway);
        });
        // here we want to align the castaways for non scoring events so we
        // push this check inside, later we skip iteration entirely for castaways
        if (!ScoringBaseEventNames.includes(baseEvent)) return;
        // initialize tribe score if it doesn't exist
        scores.Tribe[tribe] ??= [];
        scores.Tribe[tribe][episodeNum] ??= 0;
        // add points to tribe score
        const points = baseEventRules[baseEvent];
        scores.Tribe[tribe][episodeNum] += points;
        // check predictions
        basePredictions[episodeNum]?.filter((p) =>
          p.reference.referenceType === 'Tribe' && p.eventName === event.eventName)
          .forEach((prediction) => {
            // initialize member score if it doesn't exist
            scores.Member[prediction.predictionMaker] ??= [];
            scores.Member[prediction.predictionMaker]![episodeNum] ??= 0;

            if (prediction.reference.referenceType === tribe) {
              // add points to member score
              scores.Member[prediction.predictionMaker]![episodeNum]!
                += basePredictionRules[baseEvent].points
                + (prediction.bet ?? 0);
            } else {
              // subtract bet for incorrect tribe prediction
              scores.Member[prediction.predictionMaker]![episodeNum]! -= prediction.bet ?? 0;
            }
          });
      });

      if (!ScoringBaseEventNames.includes(event.eventName as ScoringBaseEventName)) return;
      event.castaways.forEach((castaway) => {
        // initialize castaway score if it doesn't exist
        scores.Castaway[castaway] ??= [];
        scores.Castaway[castaway][episodeNum] ??= 0;
        // add points to castaway score
        const points = baseEventRules[event.eventName as ScoringBaseEventName];
        scores.Castaway[castaway][episodeNum] += points;
        // score the member who has this castaway selected at this episode
        const cmIndex = Math.min(episodeNum,
          (selectionTimeline.castawayMembers[castaway]?.length ?? 0) - 1);
        const leagueMember = selectionTimeline.castawayMembers[castaway]?.[cmIndex];
        // if the castaway was not selected at this episode, don't score the member
        if (!leagueMember) return;
        scores.Member[leagueMember] ??= [];
        scores.Member[leagueMember][episodeNum] ??= 0;
        scores.Member[leagueMember][episodeNum] += points;
        // check predictions
        basePredictions[episodeNum]?.filter((p) =>
          p.reference.referenceType === 'Castaway' && p.eventName === event.eventName)
          .forEach((prediction) => {
            // initialize member score if it doesn't exist
            scores.Member[prediction.predictionMaker] ??= [];
            scores.Member[prediction.predictionMaker]![episodeNum] ??= 0;

            if (prediction.reference.referenceType === castaway) {
              // add points to member score
              scores.Member[prediction.predictionMaker]![episodeNum]! +=
                basePredictionRules[event.eventName as ScoringBaseEventName].points
                + (prediction.bet ?? 0);
            } else {
              // subtract bet for incorrect castaway prediction
              scores.Member[prediction.predictionMaker]![episodeNum]! -= prediction.bet ?? 0;
            }
          });
      });
    });
  });

  /* score league events */
  // direct events
  Object.entries(leagueEvents.directEvents).forEach(([episodeNumber, refEvents]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(refEvents).forEach((events) => {
      events.forEach((event) => {
        // initialize member score if it doesn't exist
        scores[event.referenceType][event.referenceName] ??= [];
        scores[event.referenceType][event.referenceName]![episodeNum] ??= 0;
        scores[event.referenceType][event.referenceName]![episodeNum]! += event.points;
        // score castaways if this is a tribe event
        if (event.referenceType === 'Tribe') {
          findTribeCastaways(tribesTimeline, eliminations, event.referenceName, episodeNum).forEach((castaway) => {
            scores.Tribe[castaway] ??= [];
            scores.Tribe[castaway][episodeNum] ??= 0;
            scores.Tribe[castaway][episodeNum] += event.points;
            // score the member who has this castaway selected at this episode
            const cmIndex = Math.min(episodeNum - 1,
              (selectionTimeline.castawayMembers[castaway]?.length ?? 0) - 1);
            const leagueMember = selectionTimeline.castawayMembers[castaway]?.[cmIndex];
            // if the castaway was not selected at this episode, don't score the member
            if (!leagueMember) return;
            scores.Member[leagueMember] ??= [];
            scores.Member[leagueMember][episodeNum] ??= 0;
            scores.Member[leagueMember][episodeNum] += event.points;
          });
        }
        // score members if this is a castaway event
        if (event.referenceType === 'Castaway') {
          const cmIndex = Math.min(episodeNum - 1,
            (selectionTimeline.castawayMembers[event.referenceName]?.length ?? 0) - 1);
          const leagueMember = selectionTimeline.castawayMembers[event.referenceName]?.[cmIndex];
          // if the castaway was not selected at this episode, don't score the member
          if (!leagueMember) return;
          scores.Member[leagueMember] ??= [];
          scores.Member[leagueMember][episodeNum] ??= 0;
          scores.Member[leagueMember][episodeNum] += event.points;
        }
      });
    });
  });

  // prediction events
  Object.entries(leagueEvents.predictionEvents).forEach(([episodeNumber, events]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(events).forEach((event) => {
      if (!event.hit) return;
      // prediction events just earn points for the member who made the prediction
      scores.Member[event.predictionMaker] ??= [];
      scores.Member[event.predictionMaker]![episodeNum] ??= 0;
      scores.Member[event.predictionMaker]![episodeNum]! += event.points;
    });
  });

  // survival streak bonus
  // after each episode the castaway survives, they earn a bonus point
  // then they earn two points for the next episode, then three, etc.
  // the bonus is capped at the survival cap set by the league
  const currentStreaks: Record<LeagueMemberDisplayName, number> = {};
  Object.entries(selectionTimeline.memberCastaways).forEach(([member, castaways]) => {
    // get the episode of the first pick, this will be the same for all members for now
    // but doing it this way allows for the possibility of members joining late
    const firstPickEpisode = castaways.findIndex((c) => c);
    // ensure at least zero entry exists for the member
    scores.Member[member] ??= [0];
    // iterate to add the streak bonus
    let streak = 0;

    for (let episodeNumber = firstPickEpisode; episodeNumber < eliminations.length; episodeNumber++) {
      // get the castaways who were eliminated at any point before this episode
      const eliminated = eliminations.slice(0, episodeNumber + 1).flat();
      // get the castaways who were selected by this member at this episode
      const mcIndex = Math.min(episodeNumber, castaways.length - 1);
      // if the castaway selected has been eliminated set the streak to 0
      // note this has the side effect of ensuring that streaks end when
      // a member is out of castaways to select
      if (eliminated.includes(castaways[mcIndex] ?? '') ||
        (!preserveStreak && castaways[episodeNumber - 1] &&
          castaways[episodeNumber - 1] !== castaways[mcIndex])) {
        streak = 0;
        continue;
      }
      // increment the streak and add the bonus to the member's score
      streak++;
      const bonus = Math.min(streak, survivalCap);
      scores.Member[member] ??= [];
      scores.Member[member][episodeNumber] ??= 0;
      scores.Member[member][episodeNumber]! += bonus;
    }

    currentStreaks[member] = streak;
  });

  // fill in missing episodes and convert to running totals
  const episodes = Math.max(...Object.values(scores.Castaway).map((s) => s.length)) - 1;
  for (const referenceType in scores) {
    const references = scores[referenceType as ReferenceType];
    for (const reference in references) {
      const points = scores[referenceType as ReferenceType][reference];
      for (let i = 0; i <= episodes; i++) {
        points![i] ??= 0;
        points![i]! += points![i - 1] ?? 0;
      }
    }
  }

  return { scores, currentStreaks };
}
