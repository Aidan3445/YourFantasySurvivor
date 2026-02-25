'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TimelineFilters from '~/components/shared/eventTimeline/filters';
import EpisodeEvents from '~/components/shared/eventTimeline/table/view';
import { type SeasonsDataQuery } from '~/types/seasons';
import type { LeagueData } from '~/components/shared/eventTimeline/filters';
import { Card, CardContent, CardHeader } from '~/components/common/card';

interface EventTimelineProps {
  seasonData: SeasonsDataQuery;
  leagueData?: LeagueData;
  hideMemberFilter?: boolean;
}

export default function EventTimeline({ seasonData, leagueData, hideMemberFilter = false }: EventTimelineProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramEpisode = searchParams.get('episode');

  const [filterCastaway, setFilterCastaway] = useState<number[]>([]);
  const [filterTribe, setFilterTribe] = useState<number[]>([]);
  const [filterMember, setFilterMember] = useState<number[]>([]);
  const [filterEvent, setFilterEvent] = useState<string[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<number | undefined>(
    paramEpisode ? Number(paramEpisode) : undefined
  );

  const updateEpisodeParam = useCallback(
    (episode: number | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (episode !== undefined) {
        params.set('episode', episode.toString());
      } else {
        params.delete('episode');
      }
      if (params.get('tab') && params.get('tab') !== 'events') {
        params.delete('tab');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleEpisodeChange = useCallback(
    (episode: number | undefined) => {
      setSelectedEpisode(episode);
      updateEpisodeParam(episode);
    },
    [updateEpisodeParam]
  );

  const seasonDataWithDates = useMemo(() => {
    if (seasonData.episodes?.[0]?.airDate instanceof Date) return seasonData;
    return {
      ...seasonData,
      episodes: seasonData.episodes.map(ep => ({
        ...ep,
        airDate: new Date(ep.airDate)
      })),
      season: {
        ...seasonData.season,
        premiereDate: new Date(seasonData.season.premiereDate),
        finaleDate: seasonData.season.finaleDate ? new Date(seasonData.season.finaleDate) : null
      }
    };
  }, [seasonData]);

  // Auto-select episode when season changes (skip on mount if param exists)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (paramEpisode) return; // respect query param on first load
    }

    const episodes = seasonDataWithDates.episodes;
    if (!episodes?.length) return;

    const now = new Date();
    const sorted = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);

    // Find currently airing or most recently aired episode
    const airedEpisodes = sorted.filter(ep => new Date(ep.airDate) <= now);
    const episode = airedEpisodes.length > 0
      ? airedEpisodes[airedEpisodes.length - 1]! // most recent aired
      : sorted[0]!; // fallback to first episode

    handleEpisodeChange(episode.episodeNumber);
  }, [seasonDataWithDates.season.seasonId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className='w-[calc(100svw-2rem)] md:w-[calc(100svw-3.25rem-var(--sidebar-width))] pb-0 bg-card rounded-lg border-2 border-primary/20'>
      {/* Accent Elements */}
      <div className='absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl' />
      <CardHeader>
        <TimelineFilters
          seasonData={seasonDataWithDates}
          leagueData={leagueData}
          filterCastaway={filterCastaway}
          setFilterCastaway={setFilterCastaway}
          filterTribe={filterTribe}
          setFilterTribe={setFilterTribe}
          filterMember={filterMember}
          setFilterMember={setFilterMember}
          filterEvent={filterEvent}
          setFilterEvent={setFilterEvent}
          selectedEpisode={selectedEpisode}
          setSelectedEpisode={handleEpisodeChange}
          hideMemberFilter={hideMemberFilter} />
      </CardHeader>
      <CardContent className='relative z-10 p-0'>
        {selectedEpisode &&
          <EpisodeEvents
            episodeNumber={selectedEpisode}
            seasonData={seasonDataWithDates}
            leagueData={leagueData}
            filters={{
              castaway: filterCastaway,
              tribe: filterTribe,
              member: filterMember,
              event: filterEvent
            }} />
        }
      </CardContent>
    </Card>
  );
}
