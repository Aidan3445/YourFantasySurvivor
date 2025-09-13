import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useIsEpisodeAiring } from '~/hooks/helpers/useIsEpisodeAiring';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';
import { type LeagueMember } from '~/types/leagueMembers';

/**
  * Fetches league member's data from the API.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `LeagueMember[]`
  */
export function useLeagueMembers(overrideHash?: string) {
  const params = useParams();
  const hash = overrideHash ?? params?.hash as string;

  const isEpisodeAiring = useIsEpisodeAiring(overrideHash);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

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
    enabled: !!hash,
    ...refreshConfig,
  });
}
