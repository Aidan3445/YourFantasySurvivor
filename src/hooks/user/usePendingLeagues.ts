import { useQuery } from '@tanstack/react-query';
import { type PublicLeague } from '~/types/leagues';

/**
  * Fetches the leagues for the current user.
  */
export function usePendingLeagues() {

  return useQuery<PublicLeague[]>({
    queryKey: ['pending-leagues'],
    queryFn: async () => {
      const response = await fetch('/api/leagues/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      const { leagues } = await response.json() as { leagues: PublicLeague[] };
      return leagues;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: true
  });
}
