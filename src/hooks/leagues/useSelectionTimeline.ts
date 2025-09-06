import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type SelectionTimelines } from '~/types/leagues';

/**
  */
export function useSelectionTimeline() {
  const params = useParams();
  const hash = params.hash as string;

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
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

