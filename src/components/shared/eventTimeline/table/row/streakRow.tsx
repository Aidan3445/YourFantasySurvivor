'use client';

import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import PointsCell from '~/components/shared/eventTimeline/table/pointsCell';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { Separator } from '~/components/common/separator';
import { type LeagueMember } from '~/types/leagueMembers';

interface StreakRowProps {
  streakPointValue: number;
  members: LeagueMember[];
  streaksMap: Record<number, Record<number, number>>;
  episodeNumber: number;
}

export default function StreakRow({
  streakPointValue,
  members,
  streaksMap,
  episodeNumber
}: StreakRowProps) {
  return (
    <TableRow>
      <TableCell className='text-nowrap text-start sr-only'>Streak Bonus</TableCell>
      <PointsCell points={Number(streakPointValue)} />
      <TableCell colSpan={4}>
        <div className='flex flex-wrap gap-2'>
          {members.map(member => (
            <Popover key={member.memberId}>
              <PopoverTrigger>
                <ColorRow
                  className='w-fit text-sm font-medium leading-none'
                  color={member.color}>
                  {member.displayName}
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
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </TableCell>
    </TableRow>

  );
}
