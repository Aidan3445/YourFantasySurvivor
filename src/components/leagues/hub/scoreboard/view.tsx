'use client';

import {
  Table, TableBody, TableCaption, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { Flame } from 'lucide-react';
import { cn } from '~/lib/utils';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import MemberRow from '~/components/leagues/hub/scoreboard/row';
import ScoreboardHelp from '~/components/leagues/hub/scoreboard/help';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';

interface ScoreboardProps {
  overrideHash?: string;
  maxRows?: number;
  className?: string;
}

export default function Scoreboard({ overrideHash, maxRows, className }: ScoreboardProps = {}) {
  const {
    sortedMemberScores,
    loggedInIndex,
    leagueSettings,
    selectionTimeline,
    castaways,
    currentStreaks
  } = useLeagueData(overrideHash);

  return (
    <ScrollArea className={cn('bg-card rounded-lg gap-0', className)}>
      <Table>
        <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow className={cn(
            'px-4 bg-white hover:bg-white')}>
            <TableHead className='text-center w-0'>Place</TableHead>
            <TableHead className='text-center w-0 text-nowrap'>
              Points
              <Flame className='align-top inline w-4 h-4 stroke-muted-foreground' />
            </TableHead>
            <TableHead className='text-center'>Member</TableHead>
            <TableHead className='text-center w-0 relative pr-8'>
              Survivor
              <ScoreboardHelp hasSurvivalCap={leagueSettings?.survivalCap !== undefined} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMemberScores.map(({ member, scores }, index) => {
            if (maxRows && index !== loggedInIndex && (
              loggedInIndex >= maxRows ? index >= maxRows - 1 : index >= maxRows
            )) return null;

            const castawayId = selectionTimeline?.memberCastaways?.[member.memberId]?.slice()
              .pop();
            const castaway = castawayId !== undefined ?
              (castaways?.find((c) => c.castawayId === castawayId)) : undefined;
            const selectionList = selectionTimeline?.memberCastaways?.[member.memberId]?.map(
              (id) => castaways?.find((c) => c.castawayId === id) ?? null) ?? [];

            return (
              <MemberRow
                key={index}
                place={index + 1}
                member={member}
                currentStreak={currentStreaks?.[member.memberId] ?? 0}
                selectionList={selectionList}
                points={scores.slice().pop() ?? 0}
                castaway={castaway}
                color={member.color}
                doubleBelow={!!maxRows && maxRows - 1 !== loggedInIndex && maxRows - 2 === index}
                overrideHash={overrideHash} />
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
  );
}
