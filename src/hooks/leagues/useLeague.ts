import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type League } from '~/types/leagues';

/**
  * Fetches league data based on the league hash from the URL parameters.
  * Adjusts stale time and fetch intervals based on the league status and episode airing status.
  * @param overrideHash Optional hash to override URL parameter.
  * @returnObj `League & { isEpisodeAiring: boolean }`
  */
export function useLeague(overrideHash?: string) {
  const params = useParams();
  const hash = overrideHash ?? params.hash as string;

  return useQuery<League>({
    queryKey: ['league', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const response = await fetch(`/api/leagues/${hash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      return response.json() as Promise<League>;
    },
    enabled: !!hash,
    staleTime: (query) => {
      const data = query.state.data;
      if (!data) return 0;

      switch (data.status) {
        case 'Predraft':
          return 30 * 1000; // 30 seconds
        case 'Draft':
          return 10 * 1000; // 10 seconds
        case 'Active':
          return 5 * 60 * 1000; // 5 minutes
        case 'Inactive':
          return 60 * 60 * 1000; // 1 hour
        default:
          return 60 * 2000; // 2 minute fallback
      }
    },
    gcTime: 10 * 60 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;

      switch (data.status) {
        case 'Draft':
          return 30 * 1000; // 30 seconds during draft
        case 'Predraft':
          return 60 * 1000; // 1 minute during predraft (waiting for draft to start)
        default:
          return false; // No polling for other states
      }
    },
    refetchOnWindowFocus: (query) => {
      const data = query.state.data;
      return data?.status === 'Draft' || data?.status === 'Predraft';
    },
    refetchOnReconnect: (query) => {
      const data = query.state.data;
      return data?.status === 'Draft' || data?.status === 'Predraft';
    },
  });
}
