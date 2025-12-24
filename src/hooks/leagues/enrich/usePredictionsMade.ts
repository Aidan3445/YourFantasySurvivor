import { useMemo } from 'react';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { type Prediction } from '~/types/events';

/**
  * Custom hook to get predictions made by the logged in user in a league.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `{ basePredictionsMade: Record<number, Prediction[]>, customPredictionsMade: Record<number, Prediction[]> }`
  */
export function usePredictionsMade(overrideHash?: string, selectedMemberId?: number) {
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: basePredictions } = useBasePredictions(overrideHash);
  const { data: customEvents } = useCustomEvents(overrideHash);

  const memberId = useMemo(() =>
    selectedMemberId ??
    leagueMembers?.loggedIn?.memberId,
    [selectedMemberId, leagueMembers?.loggedIn?.memberId]
  );

  const filterPredictionsByUser = useMemo(() => {
    if (!memberId) return () => [];

    return (predictions: Prediction[] | undefined) =>
      predictions?.filter(pred => pred.predictionMakerId === memberId) ?? [];
  }, [memberId]);

  const basePredictionsMade = useMemo(() => {
    if (!basePredictions || !memberId) return {};

    const result: Record<number, Prediction[]> = {};

    Object.entries(basePredictions).forEach(([episodeNumber, predictionMap]) => {
      const episodeNum = Number(episodeNumber);

      const userPredictions: Prediction[] = [];

      Object.values(predictionMap).forEach(predictions => {
        if (predictions?.length) {
          const userPreds = filterPredictionsByUser(predictions);
          if (userPreds.length > 0) {
            userPredictions.push(...userPreds);
          }
        }
      });

      if (userPredictions.length > 0) {
        result[episodeNum] = userPredictions;
      }
    });

    return result;
  }, [basePredictions, memberId, filterPredictionsByUser]);

  const customPredictionsMade = useMemo(() => {
    if (!customEvents?.predictions || !memberId) return {};

    const result: Record<number, Prediction[]> = {};

    Object.entries(customEvents.predictions).forEach(([episodeNumber, predictions]) => {
      const episodeNum = Number(episodeNumber);

      const userPredictions: Prediction[] = [];

      Object.values(predictions).forEach(preds => {
        if (preds?.length) {
          const userPreds = filterPredictionsByUser(preds);
          if (userPreds.length > 0) {
            userPredictions.push(...userPreds);
          }
        }
      });

      if (userPredictions.length > 0) {
        result[episodeNum] = userPredictions;
      }
    });

    return result;
  }, [customEvents?.predictions, memberId, filterPredictionsByUser]);

  return {
    basePredictionsMade,
    customPredictionsMade,
  };
}
