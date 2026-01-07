'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ColorRow from '~/components/shared/colorRow';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';

interface EpisodeMarkerProps {
  episodeNumber: number;
  episodeTitle?: string;
  tribes: Tribe[];
  castawaysByTribe: Record<number, EnrichedCastaway[]>;
  isKeyEpisode?: boolean;
  keyEpisodeLabel?: string;
}

export default function EpisodeMarker({
  episodeNumber,
  episodeTitle,
  tribes,
  castawaysByTribe,
  isKeyEpisode,
  keyEpisodeLabel
}: EpisodeMarkerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='flex flex-col gap-2'>
      <button
        onClick={() => setExpanded(!expanded)}
        className='flex items-center gap-2 p-3 bg-card rounded-lg hover:bg-accent transition-colors'>
        <div className='flex-1 text-left'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-lg'>Episode {episodeNumber}</span>
            {isKeyEpisode && keyEpisodeLabel && (
              <span className='text-xs bg-primary text-primary-foreground px-2 py-1 rounded'>
                {keyEpisodeLabel}
              </span>
            )}
          </div>
          {episodeTitle && (
            <span className='text-sm text-muted-foreground'>{episodeTitle}</span>
          )}
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className='pl-4 flex flex-col gap-2'>
          {tribes.map(tribe => {
            const tribesMembers = castawaysByTribe[tribe.tribeId] ?? [];
            if (tribesMembers.length === 0) return null;

            return (
              <div
                key={tribe.tribeId}
                className='bg-b2 rounded-lg p-3'
                style={{ border: `3px solid ${tribe.tribeColor}` }}>
                <h4 className='font-semibold mb-2'>{tribe.tribeName}</h4>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-1'>
                  {tribesMembers.map(castaway => (
                    <ColorRow
                      key={castaway.castawayId}
                      className='text-sm px-2 py-1'
                      color={tribe.tribeColor}>
                      {castaway.fullName}
                      {castaway.eliminatedEpisode === episodeNumber && (
                        <span className='ml-1 text-xs'>❌</span>
                      )}
                    </ColorRow>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
