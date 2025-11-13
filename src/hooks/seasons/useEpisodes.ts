import { useQuery } from '@tanstack/react-query';
import { type Episode } from '~/types/episodes';

/**
  * Fetches episodes data from the API.
  * Optimized for data that updates approximately once per week.
  * @param seasonId The ID of the season to fetch episodes for.
  * @returnObj `Episode[]`
  */
export function useEpisodes(seasonId: number | null) {
  return useQuery<Episode[]>({
    queryKey: ['episodes', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];

      const res = await fetch(`/api/seasons/episodes?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch episode data');
      }
      const { episodes } = await res.json() as { episodes: Episode[] };
      return episodes.map(ep => ({ ...ep, airDate: new Date(ep.airDate) }));
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 1 week
    refetchInterval: 4 * 60 * 60 * 1000, // 4 hours
    refetchOnReconnect: false,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    enabled: !!seasonId
  });
}
