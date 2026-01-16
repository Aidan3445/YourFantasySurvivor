import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { type Episode, type KeyEpisodes, type EpisodeOverrideConfig } from '~/types/episodes';
import { calculateKeyEpisodes } from '~/lib/episodes';
import {
  loadOverrideConfig,
  saveOverrideConfig,
  clearOverrideConfig,
} from '~/lib/devEpisodeOverride';
import { useParams } from 'next/navigation';
import { type League } from '~/types/leagues';

const formSchema = z.object({
  seasonId: z.number(),
  previousEpisodeId: z.number().nullable(),
  nextEpisodeId: z.number().nullable(),
  mergeEpisodeId: z.number().nullable(),
  previousAirStatus: z.enum(['Aired', 'Airing']),
  leagueStatus: z.enum(['Predraft', 'Draft', 'Active', 'Inactive']),
  startWeek: z.number(),
}).refine((data) => {
  // If both previous and next are set, validate that previous < next
  if (data.previousEpisodeId === null || data.nextEpisodeId === null) {
    return true; // Allow nulls
  }

  return true; // We'll do episode number validation in the component
}, {
  message: 'Previous episode must come before next episode',
});

export function useDevEpisodeOverride() {
  const params = useParams();
  const hash = params.hash as string;

  const [open, setOpen] = useState(false);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { data: seasons } = useSeasons(true);
  const { data: episodes, isLoading: episodesLoading } = useEpisodes(selectedSeasonId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seasonId: 0,
      previousEpisodeId: null,
      nextEpisodeId: null,
      mergeEpisodeId: null,
      previousAirStatus: 'Aired',
      leagueStatus: 'Active',
      startWeek: 1,
    },
  });

  const watchPrevious = form.watch('previousEpisodeId');
  const watchNext = form.watch('nextEpisodeId');

  const applyOverride = useCallback((config: EpisodeOverrideConfig) => {
    const episodesData = queryClient.getQueryData<Episode[]>(['episodes', config.seasonId]);
    if (episodesData) {
      // Special case: if next is null, simulate empty episodes response
      if (config.nextEpisodeId === null) {
        queryClient.setQueryData(['episodes', config.seasonId], []);
        queryClient.setQueryData(['episodes', config.seasonId, 'key'], {
          previousEpisode: null,
          nextEpisode: null,
          mergeEpisode: null,
        } as KeyEpisodes);
        return;
      }

      // Find episodes for comparisons
      const previousEp = config.previousEpisodeId
        ? episodesData.find(e => e.episodeId === config.previousEpisodeId)
        : null;
      const nextEp = config.nextEpisodeId
        ? episodesData.find(e => e.episodeId === config.nextEpisodeId)
        : null;
      const mergeEp = config.mergeEpisodeId
        ? episodesData.find(e => e.episodeId === config.mergeEpisodeId)
        : null;

      // Update all episodes
      const updatedEpisodes = episodesData.map(ep => {
        const updated = { ...ep };

        // Update air status based on position
        if (previousEp && ep.episodeId === config.previousEpisodeId) {
          updated.airStatus = config.previousAirStatus;
        } else if (nextEp && ep.episodeId === config.nextEpisodeId) {
          updated.airStatus = 'Upcoming';
        } else if (previousEp && ep.episodeNumber < previousEp.episodeNumber) {
          updated.airStatus = 'Aired';
        } else if (nextEp && ep.episodeNumber > nextEp.episodeNumber) {
          updated.airStatus = 'Upcoming';
        } else if (previousEp && nextEp && ep.episodeNumber > previousEp.episodeNumber && ep.episodeNumber < nextEp.episodeNumber) {
          updated.airStatus = 'Upcoming';
        }

        // Update merge flag (only one episode can be merge)
        if (mergeEp) {
          updated.isMerge = ep.episodeId === config.mergeEpisodeId;
          // If episode is now merge, turn off finale flag
          if (updated.isMerge && updated.isFinale) {
            updated.isFinale = false;
          }
        } else {
          // If merge is null, no episode has merge flag
          updated.isMerge = false;
        }

        return updated;
      });

      // Cancel any in-flight queries to prevent them from overwriting our override
      void queryClient.cancelQueries({ queryKey: ['episodes', config.seasonId] });
      void queryClient.cancelQueries({ queryKey: ['episodes', config.seasonId, 'key'] });
      // Update episodes cache
      queryClient.setQueryData(['episodes', config.seasonId], updatedEpisodes);
      // Recalculate and update key episodes using shared lib function
      const keyEpisodes = calculateKeyEpisodes(updatedEpisodes) as KeyEpisodes;
      queryClient.setQueryData(['episodes', config.seasonId, 'key'], keyEpisodes);
      // Invalidate and refetch to ensure all observers get updated
      void queryClient.invalidateQueries({
        queryKey: ['episodes', config.seasonId, 'key'],
        refetchType: 'active' // Refetch active queries to trigger re-render
      });
      // Invalidate the seasons query to trigger useSeasonsData to refetch/reselect
      void queryClient.invalidateQueries({ queryKey: ['seasons'] });
    }

    // League override
    const league = queryClient.getQueryData<League>(['league', hash]);
    if (league?.seasonId === config.seasonId) {
      const updatedLeague = {
        ...league,
        status: config.leagueStatus,
        startWeek: config.startWeek,
      };
      // Cancel any in-flight league queries
      void queryClient.cancelQueries({ queryKey: ['league', hash] });
      // Update league cache
      queryClient.setQueryData(['league', hash], updatedLeague);
      // Invalidate to refetch
      void queryClient.invalidateQueries({ queryKey: ['league', hash] });
    }

  }, [hash, queryClient]);


  // Load override config from localStorage on mount
  useEffect(() => {
    const config = loadOverrideConfig();
    if (config?.enabled) {
      setOverrideEnabled(true);
      setSelectedSeasonId(config.seasonId);
      form.setValue('seasonId', config.seasonId);
      form.setValue('previousEpisodeId', config.previousEpisodeId);
      form.setValue('nextEpisodeId', config.nextEpisodeId);
      form.setValue('mergeEpisodeId', config.mergeEpisodeId);
      form.setValue('previousAirStatus', config.previousAirStatus);
      form.setValue('leagueStatus', config.leagueStatus);
      form.setValue('startWeek', config.startWeek);
    }
  }, [form]);

  // Apply override when episodes are loaded
  useEffect(() => {
    const config = loadOverrideConfig();
    if (config?.enabled && episodes && episodes.length > 0 && selectedSeasonId === config.seasonId) {
      applyOverride(config);
    }
  }, [episodes, selectedSeasonId, applyOverride]);

  // When season changes, auto-populate merge episode
  useEffect(() => {
    if (!episodes || episodes.length === 0) return;

    const mergeEp = episodes.find(ep => ep.isMerge);
    if (mergeEp) {
      form.setValue('mergeEpisodeId', mergeEp.episodeId);
    } else {
      form.setValue('mergeEpisodeId', null);
    }
  }, [selectedSeasonId, episodes, form]);

  // When previous changes, auto-set next
  useEffect(() => {
    if (!episodes || episodes.length === 0 || watchPrevious === undefined) return;

    if (watchPrevious === null) {
      // Previous is null: Set next to episode 1
      const firstEp = episodes.find(ep => ep.episodeNumber === 1);
      if (firstEp) {
        form.setValue('nextEpisodeId', firstEp.episodeId);
      }
      // Merge to real merge or null (handled by season change effect)
    } else {
      const prevEp = episodes.find(ep => ep.episodeId === watchPrevious);
      if (!prevEp) return;

      // Check if previous is last episode
      const isLast = !episodes.some(ep => ep.episodeNumber > prevEp.episodeNumber);
      if (isLast) {
        form.setValue('nextEpisodeId', null);
      } else {
        // Set next to previous + 1
        const nextEp = episodes.find(ep => ep.episodeNumber === prevEp.episodeNumber + 1);
        if (nextEp) {
          form.setValue('nextEpisodeId', nextEp.episodeId);
        }
      }
    }
  }, [watchPrevious, episodes, form]);

  // When next changes, auto-set previous
  useEffect(() => {
    if (!episodes || episodes.length === 0 || watchNext === undefined) return;

    if (watchNext === null) {
      // Next is null: Clear all
      form.setValue('previousEpisodeId', null);
      form.setValue('mergeEpisodeId', null);
    } else {
      const nextEp = episodes.find(ep => ep.episodeId === watchNext);
      if (!nextEp) return;

      // Check if next is first episode
      if (nextEp.episodeNumber === 1) {
        form.setValue('previousEpisodeId', null);
      } else {
        // Set previous to next - 1
        const prevEp = episodes.find(ep => ep.episodeNumber === nextEp.episodeNumber - 1);
        if (prevEp) {
          form.setValue('previousEpisodeId', prevEp.episodeId);
        }
      }
    }
  }, [watchNext, episodes, form]);

  const handleApply = form.handleSubmit((data) => {
    const config: EpisodeOverrideConfig = {
      ...data,
      enabled: true,
    };
    saveOverrideConfig(config);
    setOverrideEnabled(true);
    applyOverride(config);
    setOpen(false);
    alert('Episode override applied and saved to localStorage');
  });

  const handleReset = () => {
    const config = loadOverrideConfig();
    clearOverrideConfig();
    setOverrideEnabled(false);
    form.reset();
    setSelectedSeasonId(null);

    if (config) {
      // Invalidate cache to refetch real data
      void queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId] });
      void queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId, 'key'] });
      void queryClient.invalidateQueries({ queryKey: ['seasons'] });
      void queryClient.invalidateQueries({ queryKey: ['league', hash] });
    }

    alert('Episode override cleared');
  };

  const handleToggle = (enabled: boolean) => {
    const config = loadOverrideConfig();
    if (!config) return;

    const updatedConfig = { ...config, enabled };
    saveOverrideConfig(updatedConfig);
    setOverrideEnabled(enabled);

    if (enabled) {
      // Apply override to cache
      applyOverride(updatedConfig);
    } else {
      // Invalidate cache to refetch real data
      void queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId] });
      void queryClient.invalidateQueries({ queryKey: ['episodes', config.seasonId, 'key'] });
      void queryClient.invalidateQueries({ queryKey: ['seasons'] });
      void queryClient.invalidateQueries({ queryKey: ['league', hash] });
    }
  };

  return {
    open,
    setOpen,
    overrideEnabled,
    handleToggle,
    seasons,
    episodes,
    episodesLoading,
    selectedSeasonId,
    setSelectedSeasonId,
    form,
    handleApply,
    handleReset,
    watchPrevious,
  };
}
