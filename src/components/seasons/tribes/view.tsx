'use client';

import { useMemo } from 'react';
import { type SeasonsDataQuery } from '~/types/seasons';
import EpisodeMarker from '~/components/seasons/tribes/episodeMarker';
import { type EnrichedCastaway } from '~/types/castaways';

interface TimelineViewProps {
  seasonData: SeasonsDataQuery;
}

export default function TribesTimeline({ seasonData }: TimelineViewProps) {
  const { episodes, castaways, tribes, tribesTimeline, keyEpisodes } = seasonData;

  // Get all episode numbers from tribes timeline
  const episodeNumbers = useMemo(() => {
    return Object.keys(tribesTimeline)
      .map(Number)
      .sort((a, b) => a - b);
  }, [tribesTimeline]);

  // Group castaways by tribe for each episode
  const episodeData = useMemo(() => {
    return episodeNumbers.map(episodeNum => {
      const tribesInEpisode = tribesTimeline[episodeNum] ?? {};
      const castawaysByTribe: Record<number, EnrichedCastaway[]> = {};

      Object.entries(tribesInEpisode).forEach(([tribeIdStr, castawayIds]) => {
        const tribeId = Number(tribeIdStr);
        castawaysByTribe[tribeId] = castawayIds
          .map(id => castaways.find(c => c.castawayId === id))
          .filter(Boolean) as EnrichedCastaway[];
      });

      return {
        episodeNumber: episodeNum,
        castawaysByTribe,
        tribes: tribes.filter(t => Object.keys(tribesInEpisode).includes(t.tribeId.toString()))
      };
    });
  }, [episodeNumbers, tribesTimeline, castaways, tribes]);

  // Determine key episodes
  const getKeyEpisodeLabel = (episodeNum: number): string | undefined => {
    if (episodeNum === 1) return 'Premiere';
    if (episodes?.find(e => e.episodeNumber === episodeNum)?.isFinale) return 'Finale';
    if (keyEpisodes?.mergeEpisode?.episodeNumber === episodeNum) return 'Merge';
    return undefined;
  };

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='bg-card rounded-lg p-4'>
        <h2 className='text-2xl font-semibold mb-4'>Tribe Timeline</h2>
        <p className='text-muted-foreground mb-4'>
          Explore how tribe compositions changed throughout the season. Click an episode to expand and see details.
        </p>

        <div className='flex flex-col gap-3'>
          {episodeData.map(({ episodeNumber, castawaysByTribe, tribes: episodeTribes }) => {
            const episode = episodes?.find(e => e.episodeNumber === episodeNumber);
            const keyLabel = getKeyEpisodeLabel(episodeNumber);

            return (
              <EpisodeMarker
                key={episodeNumber}
                episodeNumber={episodeNumber}
                episodeTitle={episode?.title}
                tribes={episodeTribes}
                castawaysByTribe={castawaysByTribe}
                isKeyEpisode={!!keyLabel}
                keyEpisodeLabel={keyLabel}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
