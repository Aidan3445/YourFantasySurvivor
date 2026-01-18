'use client';

import {
  Table, TableBody, TableCaption, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { cn } from '~/lib/utils';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import MemberRow from '~/components/leagues/hub/scoreboard/row';
import ScoreboardHelp from '~/components/leagues/hub/scoreboard/help';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { type EnrichedCastaway } from '~/types/castaways';

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
    currentStreaks,
    leagueRules,
    keyEpisodes,
    shotInTheDarkStatus
  } = useLeagueData(overrideHash);

  const episodeNum = keyEpisodes?.nextEpisode?.episodeNumber ?? Infinity;

  return (
    <div className='w-full'>
      <ScrollArea className={cn('bg-card gap-0', className)}>
        <Table>
          <TableCaption className='sr-only'>League Member Scoreboard</TableCaption>
          <TableHeader>
            <TableRow className='bg-white border-b-2 border-primary/20 hover:bg-white/80'>
              <TableHead className='text-left w-0 font-bold uppercase tracking-wider text-xs px-3'>Place</TableHead>
              <TableHead className='text-left w-0 text-nowrap font-bold uppercase tracking-wider text-xs px-3'>
                Points
              </TableHead>
              <TableHead className='text-left font-bold uppercase tracking-wider text-xs px-3'>Member</TableHead>
              <TableHead className='text-left w-0 relative pr-8 font-bold uppercase tracking-wider text-xs px-3'>
                Survivor
              </TableHead>
              {leagueSettings?.secondaryPickEnabled && (
                <TableHead className='text-left w-0 relative pr-8 font-bold uppercase tracking-wider text-xs px-3'>
                  Secondary
                </TableHead>
              )}
              <TableHead className='w-0'>
                <ScoreboardHelp
                  hasSurvivalCap={leagueSettings?.survivalCap !== undefined}
                  secondaryPicks={leagueSettings?.secondaryPickEnabled} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMemberScores.map(({ member, scores }, index) => {
              if (maxRows && index !== loggedInIndex && (
                loggedInIndex >= maxRows ? index >= maxRows - 1 : index >= maxRows
              )) return null;

              const castawayId = selectionTimeline?.memberCastaways?.[member.memberId]?.
                slice(0, episodeNum + 1).pop();
              const castaway = castawayId !== undefined ?
                (castaways?.find((c) => c.castawayId === castawayId)) : undefined;
              const selectionList = selectionTimeline?.memberCastaways?.[member.memberId]?.map(
                (id) => castaways?.find((c) => c.castawayId === id) ?? null) ?? [];
              let secondaryPick: EnrichedCastaway | null | undefined = undefined;
              const findSecondaryPick = castaways?.find((c) =>
                c.castawayId === selectionTimeline?.secondaryPicks?.[member.memberId]?.[episodeNum]);
              if (findSecondaryPick) {
                secondaryPick = findSecondaryPick;
              } else if (!leagueRules?.secondaryPick?.publicPicks && loggedInIndex !== index) {
                secondaryPick = null;
              }

              // place is index + 1 - number of members above them with same score
              const numberSameScore = sortedMemberScores.slice(0, index)
                .filter(({ scores: s }) => (s.slice().pop() ?? 0) === (scores.slice().pop() ?? 0))
                .length;
              const place = index + 1 - numberSameScore;

              return (
                <MemberRow
                  key={index}
                  place={place}
                  member={member}
                  currentStreak={currentStreaks?.[member.memberId] ?? 0}
                  castaway={castaway}
                  selectionList={selectionList}
                  secondaryPick={secondaryPick}
                  secondaryPickList={selectionTimeline?.secondaryPicks?.[member.memberId]?.map(
                    (id) => castaways?.find((c) => c.castawayId === id) ?? null) ?? []}
                  points={scores.slice().pop() ?? 0}
                  color={member.color}
                  doubleBelow={!!maxRows && maxRows <= loggedInIndex && maxRows - 2 === index}
                  overrideHash={overrideHash}
                  shotInTheDarkStatus={shotInTheDarkStatus?.[member.memberId]} />
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar hidden orientation='horizontal' />
      </ScrollArea>
    </div>
  );
}
