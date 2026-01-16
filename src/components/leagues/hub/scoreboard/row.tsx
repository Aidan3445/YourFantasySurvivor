'use client';

import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import { MoveRight, Flame, History, Skull } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { cn, getTribeTimeline } from '~/lib/utils';
import { Separator } from '~/components/common/separator';
import { type LeagueMember } from '~/types/leagueMembers';
import { type EnrichedCastaway } from '~/types/castaways';
import { useMemo } from 'react';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { useTribes } from '~/hooks/seasons/useTribes';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import TribeHistoryCircles from '~/components/shared/castaways/tribeHistoryCircles';
import EliminationIndicator from '~/components/shared/castaways/eliminationIndicator';

interface MemberRowProps {
  place: number;
  member: LeagueMember;
  currentStreak?: number;
  castaway?: EnrichedCastaway;
  selectionList?: (EnrichedCastaway | null)[];
  secondaryPick?: EnrichedCastaway | null;
  secondaryPickList?: (EnrichedCastaway | null)[];
  points: number;
  color: string;
  overrideHash?: string;
  doubleBelow?: boolean;
}

export default function MemberRow({
  place,
  member,
  currentStreak,
  castaway,
  selectionList,
  secondaryPick,
  secondaryPickList,
  points,
  color,
  doubleBelow,
  overrideHash
}: MemberRowProps) {
  const { data: tribesTimeline } = useTribesTimeline(castaway?.seasonId ?? null);
  const { data: tribes } = useTribes(castaway?.seasonId ?? null);
  const { data: leagueSettings } = useLeagueSettings(overrideHash);
  const isMobile = useIsMobile();

  const tribeTimeline = useMemo(() => getTribeTimeline(
    castaway?.castawayId ?? -1,
    tribesTimeline ?? {},
    tribes ?? []
  ), [castaway?.castawayId, tribesTimeline, tribes]);

  const condensedTimeline = useMemo(() => (selectionList ?? [])
    .reduce((acc, castaway, index) => {
      if (castaway === null) return acc;

      const prev = acc[acc.length - 1];
      if (prev) {
        acc[acc.length - 1] = { ...prev, end: index - 1 };
      }

      if (acc[acc.length - 1]?.castaway?.fullName === castaway.fullName) {
        acc[acc.length - 1]!.end = index;
        return acc;
      }
      return [...acc, {
        castaway,
        start: acc.length === 0 ? 'Draft' : index,
        end: castaway.eliminatedEpisode
      }];
    }, [] as { castaway: EnrichedCastaway, start: number | string, end: number | null }[]),
    [selectionList]);

  const isTopThree = place <= 3;
  const rankBadgeColor = place === 1 ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40'
    : place === 2 ? 'bg-gray-400/20 text-gray-600 border-gray-400/40'
      : place === 3 ? 'bg-amber-700/20 text-amber-700 border-amber-700/40'
        : 'bg-primary/10 text-primary border-primary/30';

  return (
    <TableRow className={cn('hover:bg-primary/5 transition-colors', doubleBelow && 'border-double border-b-3')}>
      <TableCell className='px-3 py-3 w-0 text-left'>
        <div className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-sm border-2 transition-all',
          rankBadgeColor,
          isTopThree && 'shadow-md'
        )}>
          {place}
        </div>
      </TableCell>
      <TableCell>
        <div className='flex justify-center items-center pl-1'>
          <h3 className='leading-none font-black text-lg tabular-nums text-primary'>{points}</h3>
          <Flame className='inline w-5 h-5 stroke-muted-foreground -mt-0.5 mr-auto' />
        </div>
      </TableCell>
      <TableCell className='text-nowrap px-3 py-3 w-0'>
        <div className='flex items-center gap-2'>
          <div className='w-1 h-8 rounded-full shrink-0' style={{ backgroundColor: color }} />
          <span
            className={cn(
              'text-base md:text-lg font-bold transition-all',
              member.loggedIn && 'text-primary'
            )}>
            {member.displayName}
          </span>
        </div>
      </TableCell>
      <TableCell className='text-nowrap px-3 py-3 w-0'>
        <CastawayPopover castaway={castaway}>
          <span
            className={cn(
              'text-base md:text-lg font-bold transition-all hover:text-primary cursor-pointer text-nowrap',
              castaway?.eliminatedEpisode && 'line-through opacity-40 hover:opacity-60'
            )}>
            {isMobile ? castaway?.shortName : castaway?.fullName}
          </span>
        </CastawayPopover>
      </TableCell>
      {leagueSettings?.secondaryPickEnabled && (secondaryPick ? (
        <TableCell className='text-nowrap px-3 py-3 w-0'>
          <CastawayPopover castaway={secondaryPick}>
            <span
              className={cn(
                'text-base md:text-lg font-bold transition-all hover:text-primary cursor-pointer text-nowrap',
                secondaryPick.eliminatedEpisode && 'line-through opacity-40 hover:opacity-60'
              )}>
              {isMobile ? secondaryPick.shortName : secondaryPick.fullName}
            </span>
          </CastawayPopover>
        </TableCell>
      ) : (
        <TableCell className='px-3 py-3 w-0 text-left text-muted-foreground italic'>
          {secondaryPick === null ? 'Hidden' : 'Pending'}...
        </TableCell>
      ))}
      <TableCell className='w-0'>
        <div className='flex gap-1 items-center justify-end'>
          <TribeHistoryCircles
            tribeTimeline={tribeTimeline ?? []}
            showAll={castaway?.eliminatedEpisode !== null} />
          {castaway?.eliminatedEpisode && (
            <EliminationIndicator episode={castaway.eliminatedEpisode} />
          )}
          <Popover>
            <PopoverTrigger className='ml-1'>
              <History
                size={18}
                className='cursor-pointer stroke-muted-foreground hover:stroke-primary transition-colors' />
            </PopoverTrigger>
            <PopoverContent
              className='p-3 space-y-2 border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card w-full'
              align='end'>
              <div className='text-sm font-bold uppercase tracking-wider text-center'>Selection History</div>
              <Separator className='bg-primary/20' />
              <div className='grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm'>
                {condensedTimeline.map(({ castaway, start, end }, index) => (
                  <span key={index} className='grid col-span-2 grid-cols-subgrid'>
                    <ColorRow
                      className='px-2 justify-center font-medium text-sm'
                      color={castaway.tribe?.color ?? '#AAAAAA'}>
                      {castaway.fullName}
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap font-medium'>
                      {start}
                      <MoveRight className='w-4 h-4 shrink-0' />
                      {end ? `${end}` : 'Present'}
                    </div>
                  </span>
                ))}
              </div>
              {leagueSettings?.secondaryPickEnabled && !!secondaryPickList?.slice(1)?.length && (
                <>
                  <Separator className='mt-2 bg-primary/20' />
                  <div className='text-sm font-semibold uppercase tracking-wide text-center'>Secondaries</div>
                  <div className='grid grid-cols-[max-content_1fr] gap-x-1 gap-y-1 text-sm'>
                    {secondaryPickList.slice(1).map((castaway, index) => (
                      <span key={index} className='grid col-span-2 grid-cols-subgrid'>
                        <ColorRow
                          className='px-2 justify-center font-medium text-sm'
                          color={castaway?.tribe?.color ?? '#AAAAAA'}>
                          {castaway?.fullName ?? 'No Pick'}
                        </ColorRow>
                        <div className='flex gap-1 items-center text-nowrap font-medium'>
                          <MoveRight className='w-4 h-4 shrink-0' />
                          {index + 1}
                        </div>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
          {leagueSettings && leagueSettings.survivalCap > 0 && (
            <Popover>
              <PopoverTrigger>
                <div className='ml-1 w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer'>
                  {castaway?.eliminatedEpisode
                    ? <Skull size={18} className='stroke-muted-foreground' />
                    : Math.min(currentStreak ?? Infinity, leagueSettings.survivalCap)}
                </div>
              </PopoverTrigger>
              <PopoverContent
                className='w-min text-nowrap p-3 border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card'
                align='end'>
                <div className='text-sm text-nowrap font-bold uppercase tracking-wider mb-2'>Survival Streak</div>
                <Separator className='mb-2 bg-primary/20' />
                <div className='text-sm space-y-1'>
                  <div className='font-medium'>Current streak: {currentStreak ?? 0}</div>
                  <div className='font-medium tablar-nums'>
                    Point cap: {leagueSettings.survivalCap}
                    <Flame className='inline w-4 h-4 stroke-muted-foreground align-text-top' />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
