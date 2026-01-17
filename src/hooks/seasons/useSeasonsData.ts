import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type SeasonsDataQuery } from '~/types/seasons';
import { type Episode, type KeyEpisodes } from '~/types/episodes';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';
import { useIsEpisodeAiringForSeason } from '~/hooks/helpers/useIsEpisodeAiring';
import { loadOverrideConfig } from '~/lib/devEpisodeOverride';

/**
  * Fetches seasons data from the API.
  * @param {boolean} includeInactive Whether to include inactive seasons.
  * @param {number} [seasonId] Optional season ID to fetch specific season data, overrides includeInactive
  * @returnObj `SeasonsDataQuery`
  */
export function useSeasonsData(includeInactive: boolean, seasonId?: number) {
  const isEpisodeAiring = useIsEpisodeAiringForSeason(seasonId ?? null);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);
  const queryClient = useQueryClient();

  return useQuery<SeasonsDataQuery[]>({
    queryKey: ['seasons', seasonId, includeInactive],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/seasonsData?includeInactive=${includeInactive}${seasonId ? `&seasonId=${seasonId}` : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch season data');
      }
      const { seasonsData } = await res.json() as { seasonsData: SeasonsDataQuery[] };
      return seasonsData.map(seasonData => ({
        ...seasonData,
        // Convert date strings to Date objects
        season: {
          ...seasonData.season,
          premiereDate: new Date(seasonData.season.premiereDate),
          finaleDate: seasonData.season.finaleDate ? new Date(seasonData.season.finaleDate) : null,
        },
        episodes: seasonData.episodes.map(episode => ({
          ...episode,
          airDate: new Date(episode.airDate),
        })),
      }));
    },
    select: (data) => {
      // Check if there's an active dev override
      const overrideConfig = loadOverrideConfig();

      if (!overrideConfig?.enabled) return data;
      

      // Apply override to matching season data
      return data.map(seasonData => {
        if (seasonData.season.seasonId !== overrideConfig.seasonId) {
          return seasonData;
        }

        // Get overridden episodes and keyEpisodes from cache
        const overriddenEpisodes = queryClient.getQueryData<Episode[]>(['episodes', overrideConfig.seasonId]);
        const overriddenKeyEpisodes = queryClient.getQueryData<KeyEpisodes>(['episodes', overrideConfig.seasonId, 'key']);

        return {
          ...seasonData,
          episodes: overriddenEpisodes ?? seasonData.episodes,
          keyEpisodes: overriddenKeyEpisodes ?? seasonData.keyEpisodes,
        };
      });
    },
    enabled: true,
    ...refreshConfig
  });
}
