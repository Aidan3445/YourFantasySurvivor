import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type League } from '~/types/leagues';

/**
  * Fetches league data based on the league hash from the URL parameters.
  * Adjusts stale time and fetch intervals based on the league status.
  * @param overrideHash Optional hash to override URL parameter.
  * @returnObj `League`
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
      return response.json();
    },
    enabled: !!hash,
    staleTime: (query) => {
      const data = query.state.data;
      if (!data) return 0;

      // During critical states, keep data fresher
      switch (data.status) {
        case 'Predraft':
          return 30 * 1000; // 30 seconds - draft could start anytime
        case 'Draft':
          return 10 * 1000; // 10 seconds - need to know when draft completes
        case 'Active':
          return 5 * 60 * 1000; // 5 minutes - status rarely changes
        case 'Inactive':
          return 60 * 60 * 1000; // 1 hour - nothing changes
        default:
          return 60 * 1000; // 1 minute fallback
      }
    },
    gcTime: 10 * 60 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Only poll during draft
      return data?.status === 'Draft' ? 30 * 1000 : false;
    },
  });
}
