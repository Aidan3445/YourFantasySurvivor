import { useMemo } from 'react';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useTribes } from '~/hooks/seasons/useTribes';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { defaultBaseRules } from '~/lib/leagues';
import { type EnrichedCastaway } from '~/types/castaways';
import { type EnrichedPrediction, type EnrichedEvent, type Prediction, type ScoringBaseEventName } from '~/types/events';

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

  const enrichedPredictions = useMemo(() => {
    if (!seasonId || !events || !predictions || !tribesTimeline ||
      !castaways || !tribes || !leagueMembers || !rules) {
      return [];
    }

    return predictions.reduce((acc, prediction) => {
      if (!prediction.eventName || prediction.hit === null) {
        return acc; // skip if eventName or hit is missing
      }

      let existingPrediction = acc[prediction.eventName];
      if (!existingPrediction) {
        const event = events.find(e => e.eventName === prediction.eventName);
        if (!event) {
          return acc; // skip if event not found
        }
        let points: number | null = null;
        if (event.eventSource === 'Base') {
          const baseRules = rules?.base ?? defaultBaseRules;
          points = baseRules[event.eventName as ScoringBaseEventName] ?? null;
        } else {
          points = rules?.custom?.find(r => r.eventName === event.eventName)?.points ?? null;
        }

        if (points === null) {
          return acc; // skip if rule/points not found
        }

        existingPrediction = { event, points, hits: [], misses: [] };
        acc[prediction.eventName] = existingPrediction;
      }

      const member = leagueMembers.find(m => m.memberId === prediction.predictionMakerId);
      if (!member) {
        return acc; // skip if member not found
      }

      const entry = {
        member,
        hit: prediction.hit,
        bet: prediction.bet
      };

      if (prediction.hit) {
        existingPrediction.hits.push(entry);
      } else {
        if (prediction.referenceType === 'Castaway') {
          const findTribe = (castawayId: number) => {
            let tribe: { name: string; color: string } | null = null;
            const sortedTimeline = Object.entries(tribesTimeline)
              .filter(([epNumStr]) => parseInt(epNumStr) <= existingPrediction.event.episodeNumber)
              .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

            // find the most recent tribe update for the castaway
            for (const [, tribesInEpisode] of sortedTimeline) {
              for (const [tribeIdStr, tribeMembers] of Object.entries(tribesInEpisode)) {
                if (tribeMembers.includes(castawayId)) {
                  const foundTribe = tribes.find(t => t.tribeId === parseInt(tribeIdStr));
                  if (foundTribe) {
                    tribe = {
                      name: foundTribe.tribeName,
                      color: foundTribe.tribeColor
                    };
                    break;
                  }
                }
              }
              if (tribe) break; // stop if tribe is found
            }
            return tribe;
          };

          const castaway = castaways.find(c => c.castawayId === prediction.referenceId) ?? null;
          if (!castaway) {
            console.warn(`Castaway with ID ${prediction.referenceId} not found for prediction on event ${prediction.eventName}`);
            return acc;
          }

          const tribe = findTribe(castaway.castawayId);
          if (!tribe) {
            console.warn(`Tribe not found for castaway ID ${castaway.castawayId} in prediction on event ${prediction.eventName}`);
            return acc;
          }

          const castawayWithTribe: EnrichedCastaway = {
            ...castaway,
            tribe
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
          const tribe = tribes.find(t => t.tribeId === prediction.referenceId) ?? null;
          if (!tribe) {
            console.warn(`Tribe with ID ${prediction.referenceId} not found for prediction on event ${prediction.eventName}`);
            return acc;
          }
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

      return acc;
    }, {} as Record<string, EnrichedPrediction>);
  }, [
    castaways, events, leagueMembers, predictions,
    rules, seasonId, tribes, tribesTimeline
  ]);

  return Object.values(enrichedPredictions);
}

