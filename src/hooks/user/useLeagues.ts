import { useQuery } from '@tanstack/react-query';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { type League } from '~/types/leagues';

/**
  * Fetches the leagues for the current user.
  */
export function useLeagues() {

  return useQuery<{
    league: League,
    member: LeagueMember,
    currentSelection: CurrentSelection,
    memberCount: number
  }[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const response = await fetch('/api/leagues');
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      const { leagues } = await response.json() as {
        leagues: {
          league: League,
          member: LeagueMember,
          currentSelection: CurrentSelection,
          memberCount: number
        }[]
      };
      return leagues;
    },
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: true
  });
}
