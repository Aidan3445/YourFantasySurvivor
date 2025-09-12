import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type PredictionTiming } from '~/types/events';

/**
  * Fetches prediction timing currently active for a league based on the league hash from the URL parameters.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `PredictionTiming[]`
  */
export function usePredictionTiming(overrideHash?: string) {
  const params = useParams();
  const hash = overrideHash ?? params.hash as string;

  return useQuery<PredictionTiming[]>({
    queryKey: ['predictionTiming', hash],
    queryFn: async () => {
      if (!hash) return [];

      const response = await fetch(`/api/leagues/${hash}/predictionTiming`);
      if (!response.ok) {
        return [];
      }
      const { predictionTiming } = await response.json() as { predictionTiming: PredictionTiming[] };
      console.log('Fetched prediction timing:', predictionTiming);
      return predictionTiming;
    },
    enabled: !!hash,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

