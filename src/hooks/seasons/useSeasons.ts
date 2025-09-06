import { useQuery } from '@tanstack/react-query';
import { type Season } from '~/types/seasons';

/**
  * Fetches seasons data from the API.
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
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: true
  });
}
