'use client';

import {
  Table, TableCaption, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { cn } from '~/lib/utils';
import { Flame } from 'lucide-react';
import { Fragment, useState } from 'react';
import ScorboardBody from '~/components/home/scoreboard/body';
import SelectSeason from '~/components/home/scoreboard/selectSeason';
import { type SeasonsDataQuery } from '~/types/seasons';
import { compileScores } from '~/lib/scores';
import { newtwentyColors } from '~/lib/colors';

export interface ScoreboardTableProps {
  scoreData: SeasonsDataQuery[];
}

export default function ScoreboardTable({ scoreData }: ScoreboardTableProps) {
  const scoresBySeason = scoreData.map((data) => {
    const { Castaway: castawayScores } = compileScores(
      data.baseEvents,
      data.eliminations,
      data.tribesTimeline
    ).scores;

    const sortedCastaways = Object.entries(castawayScores)
      .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0))
      .map(([castawayId, scores]) => [Number(castawayId), scores] as [number, number[]]);

    const castawayColors: Record<string, string> =
      scoreData[0]!.castaways.sort(({ fullName: a }, { fullName: b }) => a.localeCompare(b))
        .reduce((acc, { castawayId }, index) => {
          acc[castawayId] = newtwentyColors[index % newtwentyColors.length]!;
          return acc;
        }, {} as Record<string, string>);

    const castawaySplitIndex = Math.ceil(sortedCastaways.length / 2);

    return { sortedCastaways, castawayColors, castawaySplitIndex, data };
  });

  const [selectedSeason, setSelectedSeason] = useState(scoresBySeason[0]);

  if (!selectedSeason) return <div className='text-center py-6'>No seasons available.</div>;

  const selectSeason = (seasonId: string) => {
    const season = scoresBySeason.find(s => s.data.season.seasonId === +seasonId);
    if (season) {
      setSelectedSeason(season);
    }
  };

  return (
    <ScrollArea className='bg-card rounded-xl gap-0'>
      <Table>
        <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow className={cn(
            'px-4 bg-white hover:bg-white')}>
            {[0, 1].map((a) => (
              <Fragment key={a}>
                <TableHead className='text-center w-0'>Place</TableHead>
                <TableHead className='text-center w-0 text-nowrap'>
                  Points
                  <Flame className='align-top inline w-4 h-4 stroke-muted-foreground' />
                </TableHead>
                <TableHead className='text-center'>
                  Castaway
                  {a === 1 && (
                    <SelectSeason
                      seasons={scoresBySeason.map(s => ({
                        value: String(s.data.season.seasonId),
                        label: s.data.season.name,
                      }))}
                      value={String(selectedSeason.data.season.seasonId)}
                      setValue={selectSeason}
                    />
                  )}
                </TableHead>
              </Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <ScorboardBody
          sortedCastaways={selectedSeason.sortedCastaways}
          castawayColors={selectedSeason.castawayColors}
          castawaySplitIndex={selectedSeason.castawaySplitIndex}
          data={selectedSeason.data}
        />
      </Table>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
}

