'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { useLeague } from '~/hooks/useLeague';
import type { CastawayDetails, CastawayName } from '~/server/db/defs/castaways';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';
import { ColorRow } from '../draftOrder';
import { Circle, History } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useIsMobile } from '~/hooks/useMobile';
import { useState } from 'react';
import { cn } from '~/lib/utils';

export default function Scoreboard() {
  const { leagueData, league } = useLeague();
  const [selectedMembers] = useState<LeagueMemberDisplayName[]>([]);

  const sortedMemberScores = Object.entries(leagueData.scores.Member)
    .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

  return (
    <Table className='bg-card rounded-lg overflow-clip gap-0'>
      <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow className={cn(
          'px-4 bg-white pointer-events-none',
          selectedMembers.length > 0 && 'pointer-events-auto')}>
          <TableHead className='text-center w-0'>Place</TableHead>
          <TableHead className='text-center w-0'>Points</TableHead>
          <TableHead className='text-center'>Member</TableHead>
          <TableHead className='text-center w-0'>Survivor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedMemberScores.map(([member, scores], index) => {
          const color = league.members.list.find((m) => m.displayName === member)?.color ?? '#ffffff';
          const survivorName = leagueData.selectionTimeline.memberCastaways[member]?.slice().pop() ?? 'None';
          const survivor = leagueData.castaways.find((c) => c.fullName === survivorName)!;
          return (
            <MemberRow
              key={index}
              place={index + 1}
              member={member}
              points={scores.slice().pop() ?? 0}
              survivor={survivor}
              color={color} />
          );
        })}
      </TableBody>
    </Table>
  );
}

interface MemberRowProps {
  place: number;
  member: LeagueMemberDisplayName;
  points: number;
  survivor: CastawayDetails;
  color: string;
}

function MemberRow({ place, member, points, survivor, color }: MemberRowProps) {
  const { leagueData } = useLeague();
  const isMobile = useIsMobile();

  const condensedTimeline = (leagueData.selectionTimeline.memberCastaways[member] ?? []).reduce((acc, castaway) => {
    if (castaway === null) return acc;
    if (acc.length === 0) return [castaway];
    if (acc[acc.length - 1] === castaway) return acc;
    return [...acc, castaway];
  }, [] as CastawayName[]);


  return (
    <TableRow>
      <TableCell>
        <ColorRow className='justify-center p-0' color={color}>
          {place}
        </ColorRow>
      </TableCell>
      <TableCell>
        <ColorRow className='justify-center p-0' color={color}>
          {points}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap'>
        <ColorRow className='justify-center' color={color}>
          {member}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap'>
        <ColorRow className='justify-center' color={survivor.eliminatedEpisode
          ? '#AAAAAA' : survivor.startingTribe.tribeColor}>
          {isMobile ? survivor.shortName : survivor.fullName}
          <div className='ml-auto flex gap-0.5'>
            {survivor.tribes.length > 1 && survivor.tribes.map((tribe) => (
              <Popover key={tribe.tribeName}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {tribe.episode}
                </PopoverContent>
              </Popover>
            ))}
            <Popover>
              <PopoverTrigger className='ml-2'>
                <History size={16} />
              </PopoverTrigger>
              <PopoverContent className='w-min p-1 space-y-1 pt-0'>
                <PopoverArrow />
                {condensedTimeline.map((castaway, index) => (
                  <ColorRow key={index} color={leagueData.castaways.find((c) => c.fullName === castaway)?.startingTribe.tribeColor ?? '#AAAAAA'}>
                    {castaway}
                  </ColorRow>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </ColorRow>
      </TableCell>
    </TableRow>
  );
}
