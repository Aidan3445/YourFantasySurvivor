import { useQuery } from '@tanstack/react-query';
import { type LeagueDetails } from '~/types/leagues';

/**
  * Fetches the leagues for the current user.
  */
export function useLeagues() {

  return useQuery<LeagueDetails[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const response = await fetch('/api/leagues');
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      const { leagues } = await response.json() as { leagues: LeagueDetails[] };
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
