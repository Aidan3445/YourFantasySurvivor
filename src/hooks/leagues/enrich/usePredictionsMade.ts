import { useMemo } from 'react';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';

import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { type Prediction } from '~/types/events';

/**
  * Custom hook to get predictions made by the loggedin user in a league.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `{ basePredictions: Prediction[], customPredictions: Prediction[] }`
  */
export function usePredictionsMade(overrideHash?: string) {
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: basePredictions } = useBasePredictions(overrideHash);
  const { data: customEvents } = useCustomEvents(overrideHash);

  const basePredictionsMade = useMemo(() => {
    if (!basePredictions) return {};
    console.log('Base predictions:', basePredictions);
    return Object.entries(basePredictions ?? {})
      .reduce((acc, [episodeNumber, predictionMap]) => {
        Object.values(predictionMap).forEach((predictions) => {
          console.log('Predictions for episode', episodeNumber, predictions);
          const userPreds = predictions?.filter(pred =>
            pred.predictionMakerId === leagueMembers?.loggedIn?.memberId);
          if (userPreds) {
            acc[Number(episodeNumber)] ??= [];
            acc[Number(episodeNumber)]!.push(...userPreds);
          }
        });
        return acc;
      }, {} as Record<number, Prediction[]>);
  }, [basePredictions, leagueMembers]);

  const customPredictionsMade = useMemo(() => {
    if (!customEvents?.predictions) return {};
    return Object.entries(customEvents.predictions)
      .reduce((acc, [episodeNumber, predictions]) => {
        Object.values(predictions).forEach((preds) => {
          const userPreds = preds?.filter(pred =>
            pred.predictionMakerId === leagueMembers?.loggedIn?.memberId);
          if (userPreds) {
            acc[Number(episodeNumber)] ??= [];
            acc[Number(episodeNumber)]!.push(...userPreds);
          }
        });
        return acc;
      }, {} as Record<number, Prediction[]>);
  }, [customEvents?.predictions, leagueMembers]);

  return {
    basePredictionsMade,
    customPredictionsMade,
  };
}
