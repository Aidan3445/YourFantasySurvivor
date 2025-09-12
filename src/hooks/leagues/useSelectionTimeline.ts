import { useQuery } from '@tanstack/react-query';
import { type SelectionTimelines } from '~/types/leagues';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useMemo } from 'react';

/**
  * Fetches selection timeline data for a league based on the league hash from the URL parameters.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  */
export function useSelectionTimeline(overrideHash?: string) {
  const { data: league } = useLeague(overrideHash);
  const hash = useMemo(() => overrideHash ?? league?.hash, [overrideHash, league]);

  return useQuery<SelectionTimelines>({
    queryKey: ['selectionTimeline', hash],
    queryFn: async () => {
      if (!hash) throw new Error('League hash is required');

      const response = await fetch(`/api/leagues/${hash}/selectionTimeline`);
      if (!response.ok) {
        throw new Error('Failed to fetch league');
      }
      return response.json();
    },
    enabled: !!hash,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: league?.status === 'Draft' ?
      5 * 1000 : // 5 seconds during draft
      10 * 60 * 1000, // 10 minutes
  });
}

