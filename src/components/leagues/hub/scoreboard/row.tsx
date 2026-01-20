'use client';

import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import { Flame } from 'lucide-react';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { cn, getTribeTimeline } from '~/lib/utils';
import { type LeagueMember } from '~/types/leagueMembers';
import { type EnrichedCastaway } from '~/types/castaways';
import { useMemo } from 'react';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { useTribes } from '~/hooks/seasons/useTribes';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import TribeHistoryCircles from '~/components/shared/castaways/tribeHistoryCircles';
import EliminationIndicator from '~/components/shared/castaways/eliminationIndicator';
import ShotInTheDarkPending from '~/components/leagues/hub/scoreboard/popover/shotInTheDarkPending';
import SelectionHistory from '~/components/leagues/hub/scoreboard/popover/selectionHistory';
import SurvivalStreaks from '~/components/leagues/hub/scoreboard/popover/survivalStreaks';

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
  shotInTheDarkStatus?: { episodeNumber: number, status: 'pending' | 'saved' | 'wasted' } | null;
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
  overrideHash,
  shotInTheDarkStatus
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

  const isTopThree = place <= 3;
  const rankBadgeColor = place === 1
    ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40 shadow-yellow-500/40'
    : place === 2
      ? 'bg-gray-400/20 text-gray-600 border-gray-400/40 shadow-gray-400/40'
      : place === 3
        ? 'bg-amber-700/20 text-amber-700 border-amber-700/40 shadow-amber-700/40'
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
          <ColorRow
            className='text-base md:text-lg font-bold transition-all px-1'
            loggedIn={member.loggedIn}
            color={color}>
            {member.displayName}
            {shotInTheDarkStatus?.status === 'pending' && (
              <ShotInTheDarkPending loggedIn={member.loggedIn} />
            )}
          </ColorRow>
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
          <TribeHistoryCircles tribeTimeline={tribeTimeline ?? []} />
          {castaway?.eliminatedEpisode && (
            <EliminationIndicator episode={castaway.eliminatedEpisode} />
          )}
          <SelectionHistory selectionList={selectionList} secondaryPickList={secondaryPickList} />
          {leagueSettings && leagueSettings.survivalCap > 0 && (
            <SurvivalStreaks
              survivalCap={leagueSettings.survivalCap}
              castaway={castaway}
              currentStreak={currentStreak}
              shotInTheDarkStatus={shotInTheDarkStatus} />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
