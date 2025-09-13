import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useIsEpisodeAiring } from '~/hooks/helpers/useIsEpisodeAiring';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';
import { type Predictions } from '~/types/events';

/**
  * Fetches base event predictions for a league with dynamic refresh rates based on episode air status.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `Prediction[]`
  */
export function useBasePredictions(overrideHash?: string) {
  const params = useParams();
  const hash = overrideHash ?? params.hash as string;

  const isEpisodeAiring = useIsEpisodeAiring(overrideHash);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

  return useQuery<Predictions>({
    queryKey: ['basePredictions', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const response = await fetch(`/api/leagues/${hash}/basePredictions`);
      if (!response.ok) {
        throw new Error('Failed to fetch base predictions');
      }
      return response.json();
    },
    enabled: !!hash,
    ...refreshConfig,
  });
}
