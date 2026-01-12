'use client';

import {
  Table, TableCaption, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { Card, CardContent } from '~/components/common/card';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ScorboardBody from '~/components/home/scoreboard/body';
import SelectSeason from '~/components/home/scoreboard/selectSeason';
import { type SeasonsDataQuery } from '~/types/seasons';
import { compileScores } from '~/lib/scores';
import { type BaseEventRules } from '~/types/leagues';
import Image from 'next/image';

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

    const castawaySplitIndex = Math.ceil(sortedCastaways.length / 2);

    return {
      sortedCastaways,
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
    return (
      <div className='flex flex-col items-center justify-center gap-4'>
        <p className='text-primary'>Loading season...</p>
        <Image
          src='/Logo.png'
          alt='Loading'
          width={100}
          height={100}
          className='animate-loading-spin w-auto h-auto'
        />
      </div>
    );
  }

  return (
    <Card className='bg-card border-border/50 shadow-sm'>
      <CardContent>
        <div>
          {/* Section Header */}
          <div className='flex justify-between'>
            <div>
              <h2 className='text-left text-3xl md:text-4xl font-light tracking-tight leading-none'>
                {selectedSeasonIndex === 0
                  ? (allZero ? 'Castaways' : 'Current Standings')
                  : 'Season Standings'}
              </h2>
              <div className='flex items-center gap-2 leading-none ml-0.5'>
                <span className='text-left text-sm text-muted-foreground'>
                  {selectedSeasonData.data.season.name}
                </span>
                {scoreData.length > 1 && (
                  <SelectSeason
                    seasons={scoreData.map(s => ({
                      value: s.season.name,
                      label: s.season.name,
                    }))}
                    value={selectedSeasonData.data.season.name}
                    setValue={selectSeason}
                    someHidden={someHidden}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Scoreboard List */}
          <ScrollArea className='gap-0'>
            <Table>
              <TableCaption className='sr-only'>Castaway Scoreboard Table</TableCaption>
              <TableHeader className='select-none'>
                <TableRow>
                  {!allZero && (
                    <>
                      <TableHead>Place</TableHead>
                      <TableHead>Points</TableHead>
                    </>
                  )}
                  <TableHead>Castaway</TableHead>
                  {!allZero && (
                    <>
                      <TableHead>Place</TableHead>
                      <TableHead>Points</TableHead>
                    </>
                  )}
                  <TableHead>Castaway</TableHead>
                </TableRow>
              </TableHeader>
              <ScorboardBody
                allZero={allZero}
                sortedCastaways={selectedSeasonData.sortedCastaways}
                castawaySplitIndex={selectedSeasonData.castawaySplitIndex}
                data={selectedSeasonData.data} />
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
