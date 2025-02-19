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
import { type CastawayName } from '~/server/db/defs/castaways';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';

export default function Scoreboard() {
  const { leagueData } = useLeague();

  const sortedMemberScores = Object.entries(leagueData.scores.Member)
    .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

  return (
    <section className='w-full bg-card rounded-lg'>
      <Table>
        <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow className='bg-white px-4 gap-4 rounded-md items-center text-nowrap'>
            <TableHead className=' rounded-tl-md'>Place</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Member</TableHead>
            <TableHead className='text-right rounded-tr-md text-nowrap'>Survivor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMemberScores.map(([member, scores], index) => (
            <MemberRow
              key={index}
              place={index + 1}
              member={member}
              points={scores.slice().pop() ?? 0}
              survivor={leagueData.selectionTimeline.memberCastaways[member]?.slice().pop() ?? 'None'}
            />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

interface MemberRowProps {
  place: number;
  member: LeagueMemberDisplayName;
  points: number;
  survivor: CastawayName;
  //color: string;
}

function MemberRow(
  { place, member, points, survivor }: MemberRowProps
) {
  return (
    <TableRow>
      <TableCell className='rounded-bl-md'>{place}</TableCell>
      <TableCell>{points}</TableCell>
      <TableCell>{member}</TableCell>
      <TableCell className='text-right rounded-br-md'>{survivor}</TableCell>
    </TableRow>
  );
}
