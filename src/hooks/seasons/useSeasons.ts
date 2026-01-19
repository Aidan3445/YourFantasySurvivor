import { useQuery } from '@tanstack/react-query';
import { type Season } from '~/types/seasons';

/**
  * Fetches seasons data from the API.
  * Optimized for essentially static data that never changes.
  * @param {boolean} includeInactive Whether to include inactive seasons.
  * @returnObj `Season[]`
  */
export function useSeasons(includeInactive: boolean) {
  return useQuery<Season[]>({
    queryKey: ['seasons', includeInactive],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/seasons?includeInactive=${includeInactive}`);
      if (!res.ok) {
        throw new Error('Failed to fetch seasons data');
      }
      const { seasons } = await res.json() as { seasons: Season[] };
      return seasons;
    },
    staleTime: Infinity,
    gcTime: 5 * 24 * 60 * 60 * 1000, // 5 days
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: true
  });
}
