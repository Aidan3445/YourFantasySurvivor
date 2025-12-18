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

  console.log('useEnrichPredictions', {
    events,
    predictions
  });

  const lookupMaps = useMemo(() => {
    if (!tribes || !castaways || !leagueMembers || !events || !eliminations) {
      return null;
    }

    const tribesById = new Map(tribes.map(tribe => [tribe.tribeId, tribe]));
    const castawaysById = new Map(castaways.map(castaway => [castaway.castawayId, castaway]));
    const membersById = new Map(leagueMembers.members.map(member => [member.memberId, member]));
    const eventsById = new Map(events.map(event => [event.eventId, event]));

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

  const findTribe = useMemo(() => {
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
    if (!seasonId || !predictions || !lookupMaps || !findTribe || !rules) {
      return [];
    }

    const predictionGroups: Record<string, EnrichedPrediction> = {};

    for (const prediction of predictions) {
      if (!prediction.eventId || prediction.hit === null) {
        continue;
      }

      const event = prediction.eventId ? lookupMaps.eventsById.get(prediction.eventId) : null;
      if (!event) continue;

      let existingPrediction = predictionGroups[prediction.eventName];
      if (!existingPrediction) {
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
      } else if (existingPrediction.event.eventId !== event.eventId) {
        // we then need to make sure to combine the references if multiple events with the same name exist
        // only add new references to both referenceMap and references list
        existingPrediction.event.referenceMap = [
          ...existingPrediction.event.referenceMap,
          ...event.referenceMap.filter(newRef =>
            !existingPrediction!.event.referenceMap.some(existingRef =>
              JSON.stringify(existingRef) === JSON.stringify(newRef)))
        ];
        existingPrediction.event.references = [
          ...existingPrediction.event.references,
          ...event.references.filter(newRef =>
            !existingPrediction!.event.references.some(existingRef =>
              existingRef.id === newRef.id &&
              existingRef.type === newRef.type))
        ];
        console.log('existingPrediction found', existingPrediction.event.referenceMap, 'new', event.referenceMap);
      }

      const member = lookupMaps.membersById.get(prediction.predictionMakerId);
      if (!member) continue;

      const entry = {
        member,
        hit: prediction.hit,
        bet: prediction.bet,
        reference: {
          type: prediction.referenceType,
          name: '',
          color: ''
        }
      };

      if (prediction.referenceType === 'Castaway') {
        const castaway = lookupMaps.castawaysById.get(prediction.referenceId);
        if (!castaway) continue;

        const tribe = findTribe(castaway.castawayId, existingPrediction.event.episodeNumber);
        if (!tribe) continue;

        const eliminatedEpisode = lookupMaps.eliminationEpisodes.get(castaway.castawayId) ?? null;

        const castawayWithTribe: EnrichedCastaway = {
          ...castaway,
          tribe,
          eliminatedEpisode
        };

        entry.reference = {
          ...entry.reference,
          name: castaway.fullName,
          color: castawayWithTribe.tribe?.color ?? '#AAAAAA'
        };

      } else if (prediction.referenceType === 'Tribe') {
        const tribe = lookupMaps.tribesById.get(prediction.referenceId);
        if (!tribe) continue;

        entry.reference = {
          ...entry.reference,
          name: tribe.tribeName,
          color: tribe.tribeColor
        };
      }

      if (prediction.hit) {
        existingPrediction.hits.push(entry);
      } else {
        existingPrediction.misses.push(entry);
      }
    }

    return Object.values(predictionGroups);
  }, [seasonId, predictions, lookupMaps, findTribe, rules]);

  return enrichedPredictions;
}
