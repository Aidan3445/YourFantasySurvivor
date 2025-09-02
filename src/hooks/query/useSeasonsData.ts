import { useQuery } from '@tanstack/react-query';
import { type Season } from '~/types/seasons';
import { type Castaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import type { Elimination, EventWithReferences } from '~/types/events';
import { type Episode } from '~/types/episodes';

type SeasonsDataQuery = {
  season: Season;
  castaways: Castaway[];
  tribes: Tribe[];
  baseEvents: Record<number, Record<number, EventWithReferences>>;
  episodes: Episode[];
  tribesTimeline: Record<number, Record<number, number[]>>;
  eliminations: Record<number, Elimination[]>;
}[]

/**
  * Fetches seasons data from the API.
  * @param {boolean} activeOnly - If true, fetches only active seasons.
  */
export default function useSeasonsData(activeOnly: boolean) {
  return useQuery<SeasonsDataQuery>({
    queryKey: ['seasons', 'baseEvents', activeOnly],
    queryFn: async () => {
      const res = await fetch('/api/seasons/seasonsData');
      if (!res.ok) {
        throw new Error('Failed to fetch season data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const isAnyEpisodeAiring = data.some(seasonData =>
        seasonData.episodes.some(episode => episode.airStatus === 'Airing')
      );
      return isAnyEpisodeAiring ? 1000 * 60 : false; // 1 minute
    },
    enabled: true
  });
}
