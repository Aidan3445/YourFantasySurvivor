import {
  TableCell,
} from '~/components/common/table';

import { Flame } from 'lucide-react';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import { cn } from '~/lib/utils';
import EliminationIndicator from '~/components/shared/castaways/eliminationIndicator';
import TribeHistoryCircles from '~/components/shared/castaways/tribeHistoryCircles';

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
            <TribeHistoryCircles
              tribeTimeline={tribeTimeline ?? []}
              showAll={castaway?.eliminatedEpisode !== null} />
            {castaway?.eliminatedEpisode && (
              <EliminationIndicator episode={castaway.eliminatedEpisode} />
            )}
          </div>
        </div>
      </TableCell>
    </>
  );
}

