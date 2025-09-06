import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type Predictions } from '~/types/events';

/**
  * Fetches base event predictions for a league based on the league hash from the URL parameters.
  * @returnObj `Prediction[]`
  */
export function useBasePredictions() {
  const params = useParams();
  const hash = params.hash as string;

  return useQuery<Predictions>({
    queryKey: ['basePredictions', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const response = await fetch(`/api/leagues/${hash}/basePredictions`);
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      return response.json();
    },
    enabled: !!hash,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

