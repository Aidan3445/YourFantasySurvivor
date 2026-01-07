import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useIsEpisodeAiring } from '~/hooks/helpers/useIsEpisodeAiring';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';
import { type PendingLeagueMember } from '~/types/leagueMembers';

/**
  * Fetches pending league members data from the API.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `PendingLeagueMember[]`
  */
export function usePendingMembers(overrideHash?: string) {
  const params = useParams();
  const hash = overrideHash ?? params?.hash as string;

  const isEpisodeAiring = useIsEpisodeAiring(overrideHash);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

  return useQuery<{ members: PendingLeagueMember[] }>({
    queryKey: ['leagueMembers', 'pending', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const res = await fetch(`/api/leagues/${hash}/members/pending`);
      if (!res.ok) {
        throw new Error('Failed to fetch leagueMembers data');
      }
      const { leagueMembers } = await res.json() as { leagueMembers: PendingLeagueMember[] };
      return { members: leagueMembers };
    },
    enabled: !!hash,
    ...refreshConfig,
  });
}
