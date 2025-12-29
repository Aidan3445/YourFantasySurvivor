'use client';

import {
  Table, TableCaption, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { cn } from '~/lib/utils';
import { Flame } from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import ScorboardBody from '~/components/home/scoreboard/body';
import SelectSeason from '~/components/home/scoreboard/selectSeason';
import { type SeasonsDataQuery } from '~/types/seasons';
import { compileScores } from '~/lib/scores';
import { twentyFourColors } from '~/lib/colors';
import { type BaseEventRules } from '~/types/leagues';

export interface ScoreboardTableProps {
  scoreData: SeasonsDataQuery[];
  someHidden?: boolean;
  overrideBaseRules?: BaseEventRules;
}

export default function ScoreboardTable({ scoreData, someHidden, overrideBaseRules }: ScoreboardTableProps) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  // Calculate scores only for the selected season
  const selectedSeasonData = useMemo(() => {
    const data = scoreData[selectedSeasonIndex];
    if (!data) return null;

    const { Castaway: castawayScores } = compileScores(
      data.baseEvents,
      data.eliminations,
      data.tribesTimeline,
      data.keyEpisodes,
      undefined,
      undefined,
      undefined,
      overrideBaseRules ? {
        base: overrideBaseRules,
        basePrediction: null,
        custom: [],
        shauhinMode: null
      } : null
    ).scores;

    const sortedCastaways = Object.entries(castawayScores)
      .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0))
      .map(([castawayId, scores]) => [Number(castawayId), scores] as [number, number[]]);

    const castawayColors: Record<string, string> =
      data.castaways.sort(({ fullName: a }, { fullName: b }) => a.localeCompare(b))
        .reduce((acc, { castawayId }, index) => {
          acc[castawayId] = twentyFourColors[index % twentyFourColors.length]!;
          return acc;
        }, {} as Record<string, string>);

    const castawaySplitIndex = Math.ceil(sortedCastaways.length / 2);

    return {
      sortedCastaways,
      castawayColors,
      castawaySplitIndex,
      data
    };
  }, [scoreData, selectedSeasonIndex, overrideBaseRules]);

  // Calculate allZero based on selected season data
  const allZero = useMemo(() => {
    return selectedSeasonData?.sortedCastaways.every(([_, scores]) => scores.every(score => score === 0)) ?? true;
  }, [selectedSeasonData]);

  // Season selection handler
  const selectSeason = useCallback((seasonName: string) => {
    const index = scoreData.findIndex(s => s.season.name === seasonName);
    if (index !== -1) {
      setSelectedSeasonIndex(index);
    }
  }, [scoreData]);

  // Reset to first season if current selection is invalid
  useEffect(() => {
    if (selectedSeasonIndex >= scoreData.length && scoreData.length > 0) {
      setSelectedSeasonIndex(0);
    }
  }, [scoreData, selectedSeasonIndex]);

  if (!selectedSeasonData) {
    return <div className='text-center py-6'>No seasons available.</div>;
  }

  return (
    <ScrollArea className='bg-card rounded-xl gap-0 mb-2'>
      <Table>
        <TableCaption className='sr-only'>Castaway Scoreboard Table</TableCaption>
        <TableHeader>
          <TableRow className={cn('px-4 bg-white hover:bg-white')}>
            {!allZero ? [0, 1].map((a) => (
              <Fragment key={a}>
                <TableHead className='text-center w-0'>Place</TableHead>
                <TableHead className='text-center w-0 text-nowrap'>
                  Points
                  <Flame className='align-top inline w-4 h-4 stroke-muted-foreground' />
                </TableHead>
                <TableHead className='text-center'>
                  {a === 0 ? 'Castaway' : (
                    <>
                      {selectedSeasonData.data.season.name}
                      <SelectSeason
                        seasons={scoreData.map(s => ({
                          value: s.season.name,
                          label: s.season.name,
                        }))}
                        value={selectedSeasonData.data.season.name}
                        setValue={selectSeason}
                        someHidden={someHidden}
                      />
                    </>
                  )}
                </TableHead>
              </Fragment>
            )) : (
              <TableHead className='text-center' colSpan={2}>
                {selectedSeasonData.data.season.name} Castaways
                <SelectSeason
                  seasons={scoreData.map(s => ({
                    value: s.season.name,
                    label: s.season.name,
                  }))}
                  value={selectedSeasonData.data.season.name}
                  setValue={selectSeason}
                  someHidden={someHidden}
                />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <ScorboardBody
          allZero={allZero}
          sortedCastaways={selectedSeasonData.sortedCastaways}
          castawayColors={selectedSeasonData.castawayColors}
          castawaySplitIndex={selectedSeasonData.castawaySplitIndex}
          data={selectedSeasonData.data}
        />
      </Table>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
}
