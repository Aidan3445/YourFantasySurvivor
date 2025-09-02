'use client';

import {
  Table, TableBody, TableCaption, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { useLeague } from '~/hooks/useLeague';
import { Flame } from 'lucide-react';
import { cn } from '~/lib/utils';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { type LeagueHash } from '~/types/deprecated/leagues';
import MemberRow from '~/components/leagues/hub/scoreboard/row';
import ScoreboardHelp from '~/components/leagues/hub/scoreboard/help';

interface ScoreboardProps {
  overrideLeagueHash?: LeagueHash;
  maxRows?: number;
}

export default function Scoreboard({ overrideLeagueHash, maxRows }: ScoreboardProps = {}) {
  const { leagueData, league } = useLeague({ overrideLeagueHash });
  const sortedMemberScores = Object.entries(leagueData.scores.Member)
    .sort(([_, scoresA], [__, scoresB]) =>
      (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

  const loggedInIndex = sortedMemberScores.findIndex(([member]) =>
    member === league.members.loggedIn?.displayName
  );

  return (
    <ScrollArea className='bg-card rounded-lg gap-0'>
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
              <ScoreboardHelp hasSurvivalCap={league.settings.survivalCap > 0} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMemberScores.map(([member, scores], index) => {
            if (maxRows && index !== loggedInIndex && (
              loggedInIndex >= maxRows ? index >= maxRows - 1 : index >= maxRows
            )) return null;

            const color = league.members.list
              .find((m) => m.displayName === member)?.color ?? '#ffffff';
            const survivorName = leagueData.selectionTimeline.memberCastaways[member]?.slice()
              .pop() ?? 'None';
            const survivor = leagueData.castaways.find((c) => c.fullName === survivorName)!;

            return (
              <MemberRow
                key={index}
                place={index + 1}
                member={member}
                points={scores.slice().pop() ?? 0}
                survivor={survivor}
                color={color}
                overrideLeagueHash={overrideLeagueHash}
                doubleBelow={maxRows ? loggedInIndex > maxRows && index >= (maxRows - 2) : false}
              />
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
  );
}
