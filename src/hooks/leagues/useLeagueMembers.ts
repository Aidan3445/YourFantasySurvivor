import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type LeagueMember } from '~/types/leagueMembers';

/**
  * Fetches league member's data from the API.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `LeagueMember[]`
  */
export function useLeagueMembers(overrideHash?: string) {
  const params = useParams();
  const hash = overrideHash ?? params?.hash as string;

  return useQuery<{ loggedIn?: LeagueMember; members: LeagueMember[] }>({
    queryKey: ['leagueMembers', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const res = await fetch(`/api/leagues/${hash}/members`);
      if (!res.ok) {
        throw new Error('Failed to fetch leagueMembers data');
      }
      const { leagueMembers } = await res.json() as { leagueMembers: LeagueMember[] };
      const loggedIn = leagueMembers.find((member) => member.loggedIn);
      return { loggedIn, members: leagueMembers };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!hash
  });
}
