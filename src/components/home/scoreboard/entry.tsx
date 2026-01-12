import {
  TableCell,
} from '~/components/common/table';

import { Circle, FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import CastawayPopover from '~/components/seasons/shared/castawayPopover';
import { cn } from '~/lib/utils';

interface CastawayRowProps {
  place: number;
  castaway?: EnrichedCastaway;
  points?: number;
  tribeTimeline?: { episode: number; tribe: Tribe; }[];
  allZero?: boolean;
}

export default function CastawayEntry({ place, castaway, points, tribeTimeline, allZero }: CastawayRowProps) {
  return (
    <>
      {!allZero && (
        <>
          <TableCell className='px-3 py-4 text-muted-foreground text-sm font-light w-12'>
            {place}
          </TableCell>
          <TableCell className='px-3 py-4 font-medium tabular-nums w-20'>
            {points}
          </TableCell>
        </>
      )}
      <TableCell className={cn('text-nowrap px-3 py-4 w-1/2', allZero && 'py-5')}>
        <div className='flex items-center gap-2'>
          <CastawayPopover castaway={castaway}>
            <span
              className={cn(
                'text-base text-left md:text-lg font-light md:tracking-wide transition-opacity hover:opacity-70 cursor-pointer text-pretty',
                castaway?.eliminatedEpisode && 'line-through opacity-50'
              )}>
              {castaway?.fullName}
            </span>
          </CastawayPopover>
          <div className='ml-auto flex gap-1'>
            {tribeTimeline && (tribeTimeline.length > 1 || castaway?.eliminatedEpisode) && tribeTimeline.map(({ episode, tribe }) => (
              <Popover key={`${tribe.tribeName}-${episode}`}>
                <PopoverTrigger>
                  <Circle size={14} fill={tribe.tribeColor} className='cursor-pointer opacity-75 hover:opacity-100 active:opacity-60 transition-opacity' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {episode}
                </PopoverContent>
              </Popover>
            ))}
            {castaway?.eliminatedEpisode && (
              <Popover>
                <PopoverTrigger>
                  <FlameKindling className='align-text-bottom inline w-3.5 h-3.5 cursor-pointer hover:stroke-primary active:stroke-secondary transition-colors' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  Eliminated Episode {castaway.eliminatedEpisode}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </TableCell>
    </>
  );
}

