import {
  TableCell,
} from '~/components/common/table';

import { Circle, Flame, FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import { cn } from '~/lib/utils';

interface CastawayRowProps {
  place: number;
  castaway?: EnrichedCastaway;
  points?: number;
  tribeTimeline?: { episode: number; tribe: Tribe; }[];
  allZero?: boolean;
}

export default function CastawayEntry({ place, castaway, points, tribeTimeline, allZero }: CastawayRowProps) {
  const isTopThree = place <= 3 && !allZero;
  const rankBadgeColor = place === 1 ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40'
    : place === 2 ? 'bg-gray-400/20 text-gray-600 border-gray-400/40'
      : place === 3 ? 'bg-amber-700/20 text-amber-700 border-amber-700/40'
        : 'bg-primary/10 text-primary border-primary/30';

  return (
    <>
      {!allZero && (
        <>
          <TableCell className='px-3 py-3 w-0 text-left'>
            <div className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-sm border-2 transition-all',
              rankBadgeColor,
              isTopThree && 'shadow-md'
            )}>
              {place}
            </div>
          </TableCell>
          <TableCell className='px-3 py-3 w-0 text-left'>
            <div className='font-black text-lg tabular-nums text-primary'>
              {points}
              <Flame className='inline w-5 h-5 stroke-muted-foreground align-text-top' />
            </div>
          </TableCell>
        </>
      )}
      <TableCell className={cn('text-nowrap px-3 py-3 w-1 /2', allZero && 'py-4')}>
        <div className='flex items-center gap-2'>
          <CastawayPopover castaway={castaway}>
            <span
              className={cn(
                'text-base md:text-lg font-bold transition-all hover:text-primary cursor-pointer',
                castaway?.eliminatedEpisode && 'line-through opacity-40 hover:opacity-60'
              )}>
              {castaway?.fullName}
            </span>
          </CastawayPopover>
          <div className='ml-auto flex gap-1 items-center'>
            {tribeTimeline && (tribeTimeline.length > 1 || castaway?.eliminatedEpisode) && tribeTimeline.map(({ episode, tribe }) => (
              <Popover key={`${tribe.tribeName}-${episode}`}>
                <PopoverTrigger>
                  <Circle
                    size={16}
                    fill={tribe.tribeColor}
                    className='cursor-pointer opacity-80 hover:opacity-100 active:opacity-60 transition-all hover:scale-110 drop-shadow-sm'
                  />
                </PopoverTrigger>
                <PopoverContent className='w-min p-2 bg-card border-primary/30' align='end'>
                  <PopoverArrow />
                  <div className='font-bold text-xs text-nowrap'>
                    {tribe.tribeName} <span className='text-nowrap text-muted-foreground'>• Ep {episode}</span>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
            {castaway?.eliminatedEpisode && (
              <Popover>
                <PopoverTrigger>
                  <div className='p-1 bg-destructive/20 rounded hover:bg-destructive/30 transition-colors cursor-pointer'>
                    <FlameKindling className='w-3.5 h-3.5 text-destructive' />
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-min p-2 bg-card border-destructive/30' align='end'>
                  <PopoverArrow />
                  <div className='font-bold text-xs text-destructive text-nowrap'>
                    Eliminated • Ep {castaway.eliminatedEpisode}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </TableCell>
    </>
  );
}

