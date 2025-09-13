import { useMemo } from 'react';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useTribes } from '~/hooks/seasons/useTribes';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { defaultBasePredictionRules } from '~/lib/leagues';
import { type EnrichedCastaway } from '~/types/castaways';
import { type EnrichedPrediction, type EnrichedEvent, type Prediction, type ScoringBaseEventName } from '~/types/events';
import { useEliminations } from '~/hooks/seasons/useEliminations';

/**
  * Custom hook to get enriched data for a list of predictions.
  * Combines predictions with their respective rules and references.
  * @param {number} seasonId The season ID to get predictions for.
  * @param {EnrichedEvent[]} events The list of to use for enriching predictions.
  * @param {Prediction[]} predictions The list of predictions to enrich.
  */
export function useEnrichPredictions(
  seasonId: number | null,
  events: EnrichedEvent[] | null,
  predictions: Prediction[] | null
) {
  const { data: rules } = useLeagueRules();
  const { data: tribesTimeline } = useTribesTimeline(seasonId);
  const { data: tribes } = useTribes(seasonId);
  const { data: castaways } = useCastaways(seasonId);
  const { data: leagueMembers } = useLeagueMembers();
  const { data: eliminations } = useEliminations(seasonId);

  const lookupMaps = useMemo(() => {
    if (!tribes || !castaways || !leagueMembers || !events || !eliminations) {
      return null;
    }

    const tribesById = new Map(tribes.map(tribe => [tribe.tribeId, tribe]));
    const castawaysById = new Map(castaways.map(castaway => [castaway.castawayId, castaway]));
    const membersById = new Map(leagueMembers.members.map(member => [member.memberId, member]));
    const eventsById = new Map(events.map(event => [event.eventName, event]));

    const eliminationEpisodes = new Map<number, number>();
    eliminations.forEach((episodeElims, index) => {
      episodeElims.forEach(elim => {
        if (elim?.castawayId) {
          eliminationEpisodes.set(elim.castawayId, index + 1);
        }
      });
    });

    return {
      tribesById,
      castawaysById,
      membersById,
      eventsById,
      eliminationEpisodes
    };
  }, [tribes, castaways, leagueMembers, events, eliminations]);

  const createTribeFinder = useMemo(() => {
    if (!tribesTimeline || !lookupMaps) return null;

    return (castawayId: number, episodeNumber: number) => {
      const sortedTimeline = Object.entries(tribesTimeline)
        .filter(([epNumStr]) => parseInt(epNumStr) <= episodeNumber)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

      for (const [, tribesInEpisode] of sortedTimeline) {
        for (const [tribeIdStr, tribeMembers] of Object.entries(tribesInEpisode)) {
          if (tribeMembers.includes(castawayId)) {
            const tribe = lookupMaps.tribesById.get(parseInt(tribeIdStr));
            return tribe ? {
              name: tribe.tribeName,
              color: tribe.tribeColor
            } : null;
          }
        }
      }
      return null;
    };
  }, [tribesTimeline, lookupMaps]);

  const enrichedPredictions = useMemo(() => {
    if (!seasonId || !predictions || !lookupMaps || !createTribeFinder || !rules) {
      return [];
    }

    const predictionGroups: Record<string, EnrichedPrediction> = {};

    for (const prediction of predictions) {
      if (!prediction.eventName || prediction.hit === null) {
        continue;
      }

      let existingPrediction = predictionGroups[prediction.eventName];
      if (!existingPrediction) {
        const event = lookupMaps.eventsById.get(prediction.eventName);
        if (!event) continue;

        let points: number | null = null;
        if (event.eventSource === 'Base') {
          const basePredictionRules = rules.basePrediction ?? defaultBasePredictionRules;
          points = basePredictionRules[prediction.eventName as ScoringBaseEventName]?.points ?? null;
        } else {
          points = rules.custom?.find(r => r.eventName === event.eventName)?.points ?? null;
        }

        if (points === null) continue;

        existingPrediction = { event, points, hits: [], misses: [] };
        predictionGroups[prediction.eventName] = existingPrediction;
      }

      const member = lookupMaps.membersById.get(prediction.predictionMakerId);
      if (!member) continue;

      const entry = {
        member,
        hit: prediction.hit,
        bet: prediction.bet
      };

      if (prediction.hit) {
        existingPrediction.hits.push(entry);
      } else {
        if (prediction.referenceType === 'Castaway') {
          const castaway = lookupMaps.castawaysById.get(prediction.referenceId);
          if (!castaway) continue;

          const tribe = createTribeFinder(castaway.castawayId, existingPrediction.event.episodeNumber);
          if (!tribe) continue;

          const eliminatedEpisode = lookupMaps.eliminationEpisodes.get(castaway.castawayId) ?? null;

          const castawayWithTribe: EnrichedCastaway = {
            ...castaway,
            tribe,
            eliminatedEpisode
          };

          existingPrediction.misses.push({
            ...entry,
            reference: {
              type: 'Castaway',
              name: castaway.fullName,
              color: castawayWithTribe.tribe?.color ?? '#AAAAAA'
            },
          });

        } else if (prediction.referenceType === 'Tribe') {
          const tribe = lookupMaps.tribesById.get(prediction.referenceId);
          if (!tribe) continue;

          existingPrediction.misses.push({
            ...entry,
            reference: {
              type: 'Tribe',
              name: tribe.tribeName,
              color: tribe.tribeColor
            }
          });
        }
      }
    }

    return Object.values(predictionGroups);
  }, [seasonId, predictions, lookupMaps, createTribeFinder, rules]);

  return enrichedPredictions;
}
