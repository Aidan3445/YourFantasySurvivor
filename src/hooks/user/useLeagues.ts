import { useQuery } from '@tanstack/react-query';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { type League } from '~/types/leagues';

/**
  * Fetches the leagues for the current user.
  */
export function useLeagues() {

  return useQuery<{ league: League, member: LeagueMember, castaway: CurrentSelection }[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const response = await fetch('/api/leagues/');
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      return response.json();
    }
  });
}
