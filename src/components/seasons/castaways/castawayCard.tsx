'use client';

import { Circle, FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import ColorRow from '~/components/shared/colorRow';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import { getTribeTimeline } from '~/lib/utils';
import { type TribesTimeline } from '~/types/tribes';
import CastawayPopover from '~/components/seasons/shared/castawayPopover';
import { useMemo } from 'react';
import { getContrastingColor } from '@uiw/color-convert';

interface CastawayCardProps {
  castaway: EnrichedCastaway;
  tribesTimeline: TribesTimeline;
  tribes: Tribe[];
}

export default function CastawayCard({ castaway, tribesTimeline, tribes }: CastawayCardProps) {
  const tribeTimeline = useMemo(
    () => getTribeTimeline(castaway.castawayId, tribesTimeline, tribes),
    [castaway.castawayId, tribesTimeline, tribes]
  );

  return (
    <div className='flex flex-col gap-1'>
      <ColorRow
        className='justify-center gap-2 px-1 py-1 h-8'
        color={castaway.eliminatedEpisode ? '#AAAAAA' : castaway.tribe?.color}>
        <CastawayPopover castaway={castaway}>
          <span
            className='leading-none text-sm'
            style={{
              color: getContrastingColor(castaway?.eliminatedEpisode
                ? '#AAAAAA'
                : castaway?.tribe?.color ?? '#AAAAAA')
            }}>
            {castaway.fullName}
          </span>
        </CastawayPopover>

        {castaway.eliminatedEpisode && (
          <Popover>
            <PopoverTrigger>
              <span className='text-xs text-muted-foreground cursor-help text-nowrap'>
                <FlameKindling className='align-text-bottom inline w-4 h-4' />
                ({castaway.eliminatedEpisode})
              </span>
            </PopoverTrigger>
            <PopoverContent className='w-min text-nowrap p-1' align='end'>
              <PopoverArrow />
              Eliminated Episode {castaway.eliminatedEpisode}
            </PopoverContent>
          </Popover>
        )}

        <div className='ml-auto flex gap-0.5'>
          {tribeTimeline && (tribeTimeline.length > 1 || castaway.eliminatedEpisode) && tribeTimeline.map(({ episode, tribe }) => (
            tribe && (
              <Popover key={`${tribe.tribeName}-${episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {episode}
                </PopoverContent>
              </Popover>
            )
          ))}
        </div>
      </ColorRow>
    </div>
  );
}
