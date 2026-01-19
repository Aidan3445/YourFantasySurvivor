'use client';

import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import PointsCell from '~/components/shared/eventTimeline/table/row/pointsCell';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { Separator } from '~/components/common/separator';
import { type LeagueMember } from '~/types/leagueMembers';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface StreakRowProps {
  streakPointValue: number;
  members: LeagueMember[];
  streaksMap: Record<number, Record<number, number>>; // memberId -> episodeNumber -> streakCount
  episodeNumber: number;
  shotInTheDarkStatus?: Record<number, { episodeNumber: number, status: 'pending' | 'saved' | 'wasted' } | null>;
}

export default function StreakRow({
  streakPointValue,
  members,
  streaksMap,
  episodeNumber,
  shotInTheDarkStatus
}: StreakRowProps) {
  return (
    <TableRow>
      <TableCell className='text-nowrap text-start sr-only'>Streak Bonus</TableCell>
      <PointsCell points={Number(streakPointValue)} />
      <TableCell colSpan={4}>
        <div className='flex flex-wrap gap-2'>
          {members.map(member => {
            const shotStatus = shotInTheDarkStatus?.[member.memberId];
            const shotUsedThisEpisode = shotStatus?.episodeNumber === episodeNumber;

            return (
              <Popover key={member.memberId}>
                <PopoverTrigger>
                  <ColorRow
                    className='w-fit text-sm font-medium leading-none px-1 gap-1'
                    color={member.color}>
                    {member.displayName}
                    {shotUsedThisEpisode && shotStatus.status === 'saved' && (
                      <ShieldCheck className='w-4 h-4 stroke-green-600' />
                    )}
                    {shotUsedThisEpisode && shotStatus.status === 'wasted' && (
                      <ShieldAlert className='w-4 h-4 stroke-destructive' />
                    )}
                  </ColorRow>
                </PopoverTrigger>
                <PopoverContent className='w-max border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card p-2'>
                  <PopoverArrow className='fill-primary' />
                  <div className='text-sm font-semibold uppercase tracking-wide text-center'>
                    Survival Streak
                  </div>
                  <Separator className='mb-2 bg-primary/20' />
                  <div className='text-sm'>
                    Total streak: {streaksMap[member.memberId]?.[episodeNumber] ?? 0}
                  </div>
                  {shotUsedThisEpisode && (
                    <>
                      <Separator className='my-2 bg-primary/20' />
                      <div className='text-xs flex items-center gap-1'>
                        {shotStatus.status === 'saved' ? (
                          <>
                            <ShieldCheck className='w-3 h-3 stroke-green-600' />
                            <span className='text-green-600 font-semibold'>Shot in the Dark saved their streak</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className='w-3 h-3 stroke-destructive' />
                            <span className='text-destructive font-semibold'>Shot in the Dark was wasted</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </TableCell>
    </TableRow>

  );
}
