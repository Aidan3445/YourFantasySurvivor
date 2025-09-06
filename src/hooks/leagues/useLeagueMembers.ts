import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type LeagueMember } from '~/types/leagueMembers';

/**
  * Fetches league members data from the API.
  * @returnObj `LeagueMember[]`
  */
export function useLeagueMembers() {
  const params = useParams();
  const hash = params.hash as string;


  return useQuery<LeagueMember[]>({
    queryKey: ['leagueMembers', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const res = await fetch('/api/leagues/members');
      if (!res.ok) {
        throw new Error('Failed to fetch leagueMembers data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!hash
  });
}
