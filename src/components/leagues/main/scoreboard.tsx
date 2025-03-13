'use client';

import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table';
import { useLeague } from '~/hooks/useLeague';
import type { CastawayDetails, CastawayName } from '~/server/db/defs/castaways';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';
import { ColorRow } from '../draftOrder';
import { MoveRight, Circle, Flame, History, Skull } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useIsMobile } from '~/hooks/useMobile';
import { useState } from 'react';
import { cn } from '~/lib/utils';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Separator } from '~/components/ui/separator';

export default function Scoreboard() {
  const { leagueData, league } = useLeague();
  const [selectedMembers] = useState<LeagueMemberDisplayName[]>([]);

  const sortedMemberScores = Object.entries(leagueData.scores.Member)
    .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

  return (
    <ScrollArea className='bg-card rounded-lg gap-0'>
      <Table>
        <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow className={cn(
            'px-4 bg-white pointer-events-none',
            selectedMembers.length > 0 && 'pointer-events-auto')}>
            <TableHead className='text-center w-0'>Place</TableHead>
            <TableHead className='text-center w-0 text-nowrap'>
              Points
              <Flame className='align-top inline w-4 h-4 stroke-muted-foreground' />
            </TableHead>
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
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
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
  const { leagueData, league } = useLeague();
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
        <ColorRow className='justify-center pr-0' color={survivor.eliminatedEpisode
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
              <PopoverContent className='p-1 space-y-1 pt-0 grid grid-cols-[max-content,1fr] gap-x-2 w-full'>
                <PopoverArrow />
                <div className='text-center'>Survivor</div>
                <div className='text-center'>Episodes</div>
                <Separator className='col-span-2' />
                {condensedTimeline.map((castaway, index) => (
                  <>
                    <ColorRow className='px-1 justify-center' key={index} color={leagueData.castaways.find((c) => c.fullName === castaway.fullName)?.startingTribe.tribeColor ?? '#AAAAAA'}>
                      {castaway.fullName}
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap' key={`e-${index}`}>
                      {typeof castaway.start === 'number' ?
                        castaway.start : castaway.start}
                      <MoveRight className='w-4 h-4' />
                      {castaway.end ? `${castaway.end}` :
                        leagueData.episodes.find((e) => e.isFinale && e.airStatus !== 'Upcoming') ?
                          'Finale' : 'Present'}
                    </div>
                  </>
                ))}
              </PopoverContent>
            </Popover>
            {league.settings.survivalCap > 0 && (
              <div className='ml-1 w-4 flex justify-center'>
                {leagueData.currentStreaks[member]! || <Skull size={16} />}
              </div>
            )}
          </div>
        </ColorRow>
      </TableCell>
    </TableRow>
  );
}
