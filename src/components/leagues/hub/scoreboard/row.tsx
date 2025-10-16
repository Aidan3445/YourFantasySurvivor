'use client';

import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import { MoveRight, Circle, Flame, History, Skull } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { cn, getTribeTimeline } from '~/lib/utils';
import { Separator } from '~/components/common/separator';
import { getContrastingColor } from '@uiw/color-convert';
import { type LeagueMember } from '~/types/leagueMembers';
import { type EnrichedCastaway } from '~/types/castaways';
import { useMemo } from 'react';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { useTribes } from '~/hooks/seasons/useTribes';

interface MemberRowProps {
  place: number;
  member: LeagueMember;
  currentStreak?: number;
  selectionList?: (EnrichedCastaway | null)[];
  points: number;
  castaway?: EnrichedCastaway;
  color: string;
  overrideHash?: string;
  doubleBelow?: boolean;
}

export default function MemberRow({
  place,
  member,
  currentStreak,
  selectionList,
  points,
  castaway,
  color,
  doubleBelow,
  overrideHash
}: MemberRowProps) {
  const { data: tribesTimeline } = useTribesTimeline(castaway?.seasonId ?? null);
  const { data: tribes } = useTribes(castaway?.seasonId ?? null);
  const { data: leagueSettings } = useLeagueSettings(overrideHash);
  const isMobile = useIsMobile();

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
            member.loggedIn &&
            'border-white border-2 font-bold leading-snug')}
          color={color}>
          {member.displayName}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow
          className='justify-center pr-0'
          color={castaway?.eliminatedEpisode ? '#AAAAAA' : castaway?.tribe?.color}>
          {isMobile ? castaway?.shortName : castaway?.fullName}
          <div className='ml-auto flex gap-0.5'>
            {(() => {
              const tribeTimeline = getTribeTimeline(
                castaway?.castawayId ?? -1,
                tribesTimeline ?? {},
                tribes ?? []
              );
              return tribeTimeline && (tribeTimeline.length > 1 || castaway?.eliminatedEpisode) && tribeTimeline.map(({ episode, tribe }) => (
                <Popover key={`${tribe.tribeName}-${episode}`}>
                  <PopoverTrigger>
                    <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                  </PopoverTrigger>
                  <PopoverContent className='w-min text-nowrap p-1' align='end'>
                    <PopoverArrow />
                    {tribe.tribeName} - Episode {episode}
                  </PopoverContent>
                </Popover>
              ));
            })()
            }
            <Popover>
              <PopoverTrigger className='ml-2 mr-1'>
                <History
                  size={16}
                  color={castaway?.eliminatedEpisode
                    ? 'black'
                    : getContrastingColor(castaway?.tribe?.color ?? '#AAAAAA')}
                  className='cursor-help' />
              </PopoverTrigger>
              <PopoverContent
                className='p-1 space-y-1 pt-0 grid grid-cols-[max-content_1fr] gap-x-2 w-full'
                align='end'>
                <PopoverArrow />
                <div className='text-center'>Survivor</div>
                <div className='text-center'>Episodes</div>
                <Separator className='col-span-2' />
                {condensedTimeline.map(({ castaway, start, end }, index) => (
                  <span key={index} className='grid col-span-2 grid-cols-subgrid'>
                    <ColorRow
                      className='px-1 justify-center'
                      color={castaway.tribe?.color ?? '#AAAAAA'}>
                      {castaway.fullName}
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap'>
                      {start}
                      <MoveRight className='w-4 h-4' />
                      {end ? `${end}` : 'Present'}
                    </div>
                  </span>
                ))}
              </PopoverContent>
            </Popover>
            {leagueSettings && leagueSettings.survivalCap > 0 && (
              <Popover>
                <PopoverTrigger>
                  <div className='ml-1 w-4 flex justify-center' style={{
                    color: castaway?.eliminatedEpisode
                      ? 'black'
                      : getContrastingColor(castaway?.tribe?.color ?? '#AAAAAA')
                  }}>
                    {castaway?.eliminatedEpisode
                      ? <Skull
                        size={16}
                        color={castaway?.eliminatedEpisode
                          ? 'black'
                          : getContrastingColor(castaway?.tribe?.color ?? '#AAAAAA')} />
                      : Math.min(currentStreak ?? Infinity, leagueSettings.survivalCap)}
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {`Survival streak: ${currentStreak ?? 0}`}
                  <Separator className='my-1' />
                  {`Point cap: ${leagueSettings.survivalCap}`}
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
