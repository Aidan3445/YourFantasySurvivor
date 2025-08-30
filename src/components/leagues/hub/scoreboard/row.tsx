'use client';

import { TableCell, TableRow } from '~/components/common/table';
import { useLeague } from '~/hooks/useLeague';
import type { CastawayDetails, CastawayName } from '~/types/castaways';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import ColorRow from '~/components/common/colorRow';
import { MoveRight, Circle, Flame, History, Skull } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useIsMobile } from '~/hooks/useMobile';
import { cn } from '~/lib/utils';
import { Separator } from '~/components/common/separator';
import { getContrastingColor } from '@uiw/color-convert';
import { type LeagueHash } from '~/types/leagues';

interface MemberRowProps {
  place: number;
  member: LeagueMemberDisplayName;
  points: number;
  survivor: CastawayDetails;
  color: string;
  overrideLeagueHash?: LeagueHash;
  doubleBelow?: boolean;
}

export default function MemberRow({ place, member, points, survivor, color, doubleBelow, overrideLeagueHash }: MemberRowProps) {
  const { leagueData, league } = useLeague({ overrideLeagueHash });
  const isMobile = useIsMobile();

  const condensedTimeline = (leagueData.selectionTimeline.memberCastaways[member] ?? []).reduce((acc, castaway, index) => {
    if (castaway === null) return acc;

    const prev = acc[acc.length - 1];
    if (prev) {
      acc[acc.length - 1] = { ...prev, end: index - 1 };
    }

    if (acc[acc.length - 1]?.fullName === castaway) {
      acc[acc.length - 1]!.end = index;
      return acc;
    }
    return [...acc, {
      fullName: castaway,
      start: acc.length === 0 ? 'Draft' : index,
      end: leagueData.castaways.find((c) => c.fullName === castaway)?.eliminatedEpisode
    }];
  }, [] as { fullName: CastawayName, start: number | string, end?: number | null }[]);

  return (
    <TableRow className={cn(doubleBelow && 'border-double border-b-3')}>
      <TableCell className='px-1'>
        <ColorRow className='justify-center p-0' color={color}>
          {place}
        </ColorRow>
      </TableCell >
      <TableCell className='px-1'>
        <ColorRow className='justify-center p-0' color={color}>
          {points}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow
          className={cn('justify-center',
            member === league.members.loggedIn?.displayName &&
            'border-white border-2 font-bold leading-snug')}
          color={color}>
          {member}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow className='justify-center pr-0' color={survivor.eliminatedEpisode
          ? '#AAAAAA' : survivor.startingTribe.tribeColor}>
          {isMobile ? survivor.shortName : survivor.fullName}
          <div className='ml-auto flex gap-0.5'>
            {survivor.tribes.length > 1 && survivor.tribes.map((tribe) => (
              <Popover key={`${tribe.tribeName}-${tribe.episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {tribe.episode}
                </PopoverContent>
              </Popover>
            ))}
            <Popover>
              <PopoverTrigger className='ml-2 mr-1'>
                <History
                  size={16}
                  color={survivor.eliminatedEpisode
                    ? 'black'
                    : getContrastingColor(survivor.startingTribe.tribeColor)}
                  className='cursor-help' />
              </PopoverTrigger>
              <PopoverContent
                className='p-1 space-y-1 pt-0 grid grid-cols-[max-content_1fr] gap-x-2 w-full'
                align='end'>
                <PopoverArrow />
                <div className='text-center'>Survivor</div>
                <div className='text-center'>Episodes</div>
                <Separator className='col-span-2' />
                {condensedTimeline.map((castaway, index) => (
                  <span key={index} className='grid col-span-2 grid-cols-subgrid'>
                    <ColorRow
                      className='px-1 justify-center'
                      color={leagueData.castaways
                        .find((c) => c.fullName === castaway.fullName)?.startingTribe.tribeColor ?? '#AAAAAA'}>
                      {castaway.fullName}
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap'>
                      {castaway.start}
                      <MoveRight className='w-4 h-4' />
                      {castaway.end ? `${castaway.end}` :
                        leagueData.episodes.find((e) => e.isFinale && e.airStatus !== 'Upcoming') ?
                          'Finale' : 'Present'}
                    </div>
                  </span>
                ))}
              </PopoverContent>
            </Popover>
            {league.settings.survivalCap > 0 && (
              <Popover>
                <PopoverTrigger>
                  <div className='ml-1 w-4 flex justify-center' style={{
                    color: survivor.eliminatedEpisode
                      ? 'black'
                      : getContrastingColor(survivor.startingTribe.tribeColor)
                  }}>
                    {Math.min(leagueData.currentStreaks[member]!, league.settings.survivalCap) ||
                      <Skull
                        size={16}
                        color={survivor.eliminatedEpisode
                          ? 'black'
                          : getContrastingColor(survivor.startingTribe.tribeColor)} />}
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {`Survival streak: ${leagueData.currentStreaks[member] ?? 0}`}
                  <Separator className='my-1' />
                  {`Point cap: ${league.settings.survivalCap}`}
                  <Flame className='align-baseline inline w-4 h-4' />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </ColorRow>
      </TableCell>
    </TableRow >
  );
}
