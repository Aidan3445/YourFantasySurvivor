import { defaultBaseRules, defaultBasePredictionRules, defaultShauhinModeSettings } from '~/lib/leagues';
import { findTribeCastaways } from '~/lib/utils';
import { type Predictions, type Eliminations, type Events, type CustomEvents, type ReferenceType, type Scores, type ScoringBaseEventName, type Streaks } from '~/types/events';
import { type SelectionTimelines, type LeagueRules } from '~/types/leagues';
import { type TribesTimeline } from '~/types/tribes';
import { ScoringBaseEventNames } from '~/lib/events';
import { type KeyEpisodes } from '~/types/episodes';

/**
  * Compile the scores for a league 
  * @param baseEvents The base events for the season
  * @param eliminations The eliminations for the season
  * @param tribesTimeline The tribe updates for the season
  * @param keyEpisodes The key episodes for the season
  * @param customEvents The league events
  * @param baseEventRules The league's base event scoring
  * @param selectionTimelines The selection timelines for the league
  * @param survivalCap The survival cap for the league
  * @returns The scores for the league as running totals
  * @returnObj `Scores`
  */
export function compileScores(
  baseEvents: Events,
  eliminations: Eliminations,
  tribesTimeline: TribesTimeline,
  keyEpisodes: KeyEpisodes,

  selectionTimelines: SelectionTimelines = { castawayMembers: {}, memberCastaways: {} },
  customEvents: CustomEvents = { events: [], predictions: [] },
  basePredictions: Predictions = {},
  rules: LeagueRules | null = null,
  survivalCap = 0,
  preserveStreak = false
) {
  const scores: Scores = {
    Castaway: {},
    Tribe: {},
    Member: {},
  };

  const baseEventRules = rules?.base ?? defaultBaseRules;
  const basePredictionRules = rules?.basePrediction ?? defaultBasePredictionRules;
  const shauhinModeRules = rules?.shauhinMode ?? defaultShauhinModeSettings;
  const customEventRules = rules?.custom ?? [];

  // score base events
  Object.entries(baseEvents).forEach(([episodeNumber, events]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(events).forEach((event) => {
      const baseEvent = event.eventName as ScoringBaseEventName;
      const { eventTribes, eventCastaways } = event.references.reduce((acc, ref) => {
        if (ref.type === 'Tribe') acc.eventTribes.add(ref.id);
        if (ref.type === 'Castaway') acc.eventCastaways.add(ref.id);
        return acc;
      }, { eventTribes: new Set<number>(), eventCastaways: new Set<number>() });

      // ensure initial tribe assignments
      if (episodeNum === 1 && event.eventName === 'tribeUpdate') {
        eventTribes.forEach((tribeId) => {
          scores.Tribe[tribeId] ??= [];
        });
        eventCastaways.forEach((castawayId) => {
          scores.Castaway[castawayId] ??= [];
        });
      }

      eventTribes.forEach((tribe) => {
        // add castaways to be scored
        findTribeCastaways(tribesTimeline, eliminations, tribe, episodeNum).forEach((castaway) => {
          if (!eventCastaways.has(castaway)) eventCastaways.add(castaway);
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
      });

      if (!ScoringBaseEventNames.includes(event.eventName as ScoringBaseEventName)) return;
      eventCastaways.forEach((castaway) => {
        // initialize castaway score if it doesn't exist
        scores.Castaway[castaway] ??= [];
        scores.Castaway[castaway][episodeNum] ??= 0;
        // add points to castaway score
        const points = baseEventRules[event.eventName as ScoringBaseEventName];
        scores.Castaway[castaway][episodeNum] += points;
        // score the member who has this castaway selected at this episode
        const cmIndex = Math.min(episodeNum,
          (selectionTimelines.castawayMembers[castaway]?.length ?? 0) - 1);
        const leagueMember = selectionTimelines.castawayMembers[castaway]?.[cmIndex];
        // if the castaway was not selected at this episode, don't score the member
        if (!leagueMember) return;
        scores.Member[leagueMember] ??= [];
        scores.Member[leagueMember][episodeNum] ??= 0;
        scores.Member[leagueMember][episodeNum] += points;
      });
    });
  });


  // score base predictions
  Object.entries(basePredictions ?? {})
    .forEach(([episodeNumber, predictionsMap]) => {
      const episodeNum = parseInt(episodeNumber, 10);
      const shauhinModeActive =
        shauhinModeRules.enabled &&
        shauhinModeRules.enabledBets.length > 0 && (
          (shauhinModeRules.startWeek === 'Custom' && episodeNum >= (shauhinModeRules.customStartWeek ?? Infinity))
          || (shauhinModeRules.startWeek === 'After Premiere' && episodeNum > 1)
          || (shauhinModeRules.startWeek === 'After Merge' && episodeNum > (keyEpisodes.mergeEpisode?.episodeNumber ?? Infinity))
          || (shauhinModeRules.startWeek === 'Before Finale' && !!keyEpisodes.nextEpisode?.isFinale && episodeNum < keyEpisodes.nextEpisode.episodeNumber)
        );

      Object.values(predictionsMap).flat().forEach((prediction) => {
        const rule = basePredictionRules[prediction.eventName as ScoringBaseEventName];
        const points = rule?.points;
        if (!points || !rule?.enabled) return;
        if (prediction.hit) {
          // prediction events just earn points for the member who made the prediction
          scores.Member[prediction.predictionMakerId] ??= [];
          scores.Member[prediction.predictionMakerId]![episodeNum] ??= 0;
          scores.Member[prediction.predictionMakerId]![episodeNum]! += points;
          if (shauhinModeActive && prediction.bet) {
            scores.Member[prediction.predictionMakerId] ??= [];
            scores.Member[prediction.predictionMakerId]![episodeNum] ??= 0;
            scores.Member[prediction.predictionMakerId]![episodeNum]! += prediction.bet;
          }
        } else if (shauhinModeActive && !prediction.pending && prediction.bet) {
          // if the prediction was wrong but shauhin mode is active, subtract the bet
          scores.Member[prediction.predictionMakerId] ??= [];
          scores.Member[prediction.predictionMakerId]![episodeNum] ??= 0;
          scores.Member[prediction.predictionMakerId]![episodeNum]! -= prediction.bet;
        }
      });
    });

  /* score league events */
  // direct events
  Object.entries(customEvents.events).forEach(([episodeNumber, refEvents]) => {
    const episodeNum = parseInt(episodeNumber);
    Object.values(refEvents).forEach((event) => {
      // skip prediction events here, they are handled below
      if (event.eventType === 'Prediction') return;

      const points = customEventRules.find((r) => r.eventName === event.eventName)?.points;
      if (!points) return;

      event.references.forEach((reference) => {
        // initialize member score if it doesn't exist
        scores[reference.type][reference.id] ??= [];
        scores[reference.type][reference.id]![episodeNum] ??= 0;
        scores[reference.type][reference.id]![episodeNum]! += points;
        // score castaways if this is a tribe event
        if (reference.type === 'Tribe') {
          findTribeCastaways(tribesTimeline, eliminations, reference.id, episodeNum).forEach((castaway) => {
            scores.Castaway[castaway] ??= [];
            scores.Castaway[castaway][episodeNum] ??= 0;
            scores.Castaway[castaway][episodeNum] += points;
            // score the member who has this castaway selected at this episode
            const cmIndex = Math.min(episodeNum,
              (selectionTimelines.castawayMembers[castaway]?.length ?? 0) - 1);
            const leagueMember = selectionTimelines.castawayMembers[castaway]?.[cmIndex];
            // if the castaway was not selected at this episode, don't score the member
            if (!leagueMember) return;
            scores.Member[leagueMember] ??= [];
            scores.Member[leagueMember][episodeNum] ??= 0;
            scores.Member[leagueMember][episodeNum] += points;
          });
        }
        // score members if this is a castaway event
        if (reference.type === 'Castaway') {
          const cmIndex = Math.min(episodeNum - 1,
            (selectionTimelines.castawayMembers[reference.id]?.length ?? 0) - 1);
          const leagueMember = selectionTimelines.castawayMembers[reference.id]?.[cmIndex];
          // if the castaway was not selected at this episode, don't score the member
          if (!leagueMember) return;
          scores.Member[leagueMember] ??= [];
          scores.Member[leagueMember][episodeNum] ??= 0;
          scores.Member[leagueMember][episodeNum] += points;
        }
      });
    });
  });

  // prediction events
  Object.entries(customEvents.predictions).forEach(([episodeNumber, predictionsMap]) => {
    const episodeNum = parseInt(episodeNumber);

    Object.values(predictionsMap).flat().forEach((prediction) => {
      const points = customEventRules.find((r) => r.eventName === prediction.eventName)?.points;
      if (!points) return;

      if (!prediction.hit) return;
      // prediction events just earn points for the member who made the prediction
      scores.Member[prediction.predictionMakerId] ??= [];
      scores.Member[prediction.predictionMakerId]![episodeNum] ??= 0;
      scores.Member[prediction.predictionMakerId]![episodeNum]! += points;
    });
  });

  // survival streak bonus
  // after each episode the castaway survives, they earn a bonus point
  // then they earn two points for the next episode, then three, etc.
  // the bonus is capped at the survival cap set by the league
  const currentStreaks: Streaks = {};
  Object.entries(selectionTimelines.memberCastaways).forEach(([memberId, castaways]) => {
    const mid = parseInt(memberId, 10);
    // get the episode of the first pick, this will be the same for all members for now
    // but doing it this way allows for the possibility of members joining late
    const firstPickEpisode = castaways.findIndex((c) => c);
    // ensure at least zero entry exists for the member
    scores.Member[mid] ??= [0];
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
      if (eliminated.some((e) => e?.castawayId === castaways[mcIndex]) ||
        (!preserveStreak && castaways[episodeNumber - 1] &&
          castaways[episodeNumber - 1] !== castaways[mcIndex])) {
        streak = 0;
        continue;
      }
      // increment the streak and add the bonus to the member's score
      streak++;
      const bonus = Math.min(streak, survivalCap);
      scores.Member[mid] ??= [];
      scores.Member[mid][episodeNumber] ??= 0;
      scores.Member[mid][episodeNumber]! += bonus;
    }

    currentStreaks[mid] = streak;
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



