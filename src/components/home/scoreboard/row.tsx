import {
  TableCell,
} from '~/components/common/table';

import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import { cn } from '~/lib/utils';
import EliminationIndicator from '~/components/shared/castaways/eliminationIndicator';
import TribeHistoryCircles from '~/components/shared/castaways/tribeHistoryCircles';
import { PlaceIcon, PointsIcon } from '~/components/icons/generated';
import { rankBadgeColor } from '~/lib/scores';

interface CastawayRowProps {
  place: number;
  castaway?: EnrichedCastaway;
  points?: number;
  tribeTimeline?: { episode: number; tribe: Tribe; }[];
  allZero?: boolean;
}

export default function CastawayRow({ place, castaway, points, tribeTimeline, allZero }: CastawayRowProps) {
  const isTopThree = place <= 3 && !allZero;

  return (
    <>
      {!allZero && (
        <>
          <TableCell className='px-3 py-3 w-0 text-left'>
            <div className='relative'>
              <PlaceIcon
                size={32}
                className={rankBadgeColor(place)} />
              <div className={cn(
                'absolute top-1/2 transform -translate-y-1/2',
                'flex items-center justify-center w-7.5 h-8 font-black rounded-full text-base tracking-tight',
                rankBadgeColor(place),
                isTopThree && 'shadow-md'
              )}>
                {place}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className='flex justify-center items-center pl-1'>
              <h3 className='leading-none font-black text-lg tabular-nums text-primary'>{points}</h3>
              <PointsIcon className='inline w-4 h-4 fill-secondary -mt-0.5 mr-auto' />
            </div>
          </TableCell>
        </>
      )}
      <TableCell className={cn('text-nowrap px-3 py-3 w-1 /2')}>
        <div className='flex items-center gap-2'>
          <CastawayPopover castaway={castaway}>
            <span
              className={cn(
                'text-base text-left md:text-lg font-bold transition-all hover:text-primary cursor-pointer',
                castaway?.eliminatedEpisode && !castaway.redemption?.some((r) => r.secondEliminationEpisode === null) &&
                'line-through opacity-40 hover:opacity-60'
              )}>
              {castaway?.fullName}
            </span>
          </CastawayPopover>
          <div className='ml-auto flex gap-1 items-center'>
            <TribeHistoryCircles tribeTimeline={tribeTimeline ?? []} />
            <EliminationIndicator episode={castaway?.eliminatedEpisode} redemption={castaway?.redemption} />
          </div>
        </div>
      </TableCell>
    </>
  );
}

