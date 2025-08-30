import { seasonsService as SEASON_QUERIES } from '~/services/seasons';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/common/table';

import { compileScores } from '~/lib/scores';
import { defaultBaseRules } from '~/types/events';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { cn } from '~/lib/utils';
import { Circle, Flame, FlameKindling } from 'lucide-react';
import { type CastawayDetails, type CastawayName } from '~/types/castaways';
import { newtwentyColors } from '~/lib/colors';
import { ColorRow } from '~/components/leagues/predraft/draftOrder';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { Fragment } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';

export async function GlobalCastawayScoreboard() {
  const scoreData = await SEASON_QUERIES.getSeasonScoreData();

  if (scoreData.length === 0) {
    return (
      <div className='text-center py-6'>
        <p className='text-muted-foreground mb-4'>
          No active leagues with scoring data.
        </p>
      </div>
    );
  }

  const scoresBySeason = scoreData.map((data) => {
    const { Castaway: castawayScores } = compileScores(
      data.baseEvents,
      defaultBaseRules,
      data.tribesTimeline,
      data.eliminations,
    ).scores;

    const sortedCastaways = Object.entries(castawayScores)
      .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

    const castawayColors: Record<CastawayName, string> =
      scoreData[0]!.castaways.sort(({ fullName: a }, { fullName: b }) => a.localeCompare(b))
        .reduce((acc, { fullName }, index) => {
          acc[fullName] = newtwentyColors[index % newtwentyColors.length]!;
          return acc;
        }, {} as Record<CastawayName, string>);

    const castawaySplitIndex = Math.ceil(sortedCastaways.length / 2);

    return { sortedCastaways, castawayColors, castawaySplitIndex, data };
  });


  return (
    <Tabs defaultValue={`season-${scoresBySeason[0]!.data.season.seasonId}`} className='w-full'>
      <TabsList>
        {scoresBySeason.map(({ data: { season: { seasonId } } }) => (
          <TabsTrigger key={seasonId} value={`season-${seasonId}`} className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>
            Season {seasonId}
          </TabsTrigger>
        ))}
      </TabsList>
      {scoresBySeason.map(({ sortedCastaways, castawayColors, castawaySplitIndex, data }) => (
        <TabsContent
          key={data.season.seasonId}
          value={`season-${data.season.seasonId}`}
          className='mt-4'>
          <SeasonScoreboard
            sortedCastaways={sortedCastaways}
            castawayColors={castawayColors}
            castawaySplitIndex={castawaySplitIndex}
            scoreData={data}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

interface SeasonScoreboardProps {
  sortedCastaways: [CastawayName, number[]][];
  castawayColors: Record<CastawayName, string>;
  castawaySplitIndex: number;
  scoreData: Awaited<ReturnType<typeof SEASON_QUERIES.getSeasonScoreData>>[0];
}

function SeasonScoreboard({ sortedCastaways, castawayColors, castawaySplitIndex, scoreData }: SeasonScoreboardProps) {
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
                <TableHead className='text-center'>Castaway</TableHead>
              </Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCastaways.slice(0, castawaySplitIndex).map(([castawayName, scores], index) => {
            const totalPoints = scores.slice().pop() ?? 0;
            const color = castawayColors[castawayName] ?? '#ffffff';
            const castaway = scoreData.castaways.find(c => c.fullName === castawayName);

            const [secondCastawayName, secondScores] = sortedCastaways[index + castawaySplitIndex] ?? [];

            return (
              <TableRow key={`${castawayName}-${secondCastawayName ?? 'empty'}`}>
                <CastawayRow
                  place={index + 1}
                  castaway={castaway}
                  points={totalPoints}
                  color={color}
                />
                {secondCastawayName && secondScores && (
                  <CastawayRow
                    place={index + 1 + castawaySplitIndex}
                    castaway={scoreData.castaways.find(c => c.fullName === secondCastawayName)}
                    points={secondScores.slice().pop() ?? 0}
                    color={castawayColors[secondCastawayName] ?? '#ffffff'}
                  />
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
}

interface CastawayRowProps {
  place: number;
  castaway?: CastawayDetails;
  points: number;
  color: string;
}

function CastawayRow({ place, castaway, points, color }: CastawayRowProps) {
  return (
    <>
      <TableCell className='px-1'>
        <ColorRow color={color} className='justify-center p-0'>
          {place}
        </ColorRow>
      </TableCell>
      <TableCell className='px-1'>
        <ColorRow color={color} className='justify-center p-0'>
          {points}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow
          className='justify-center gap-0'
          color={castaway?.eliminatedEpisode ? '#AAAAAA' : castaway?.startingTribe.tribeColor ?? color}>
          {castaway?.fullName ?? 'Jeff Probst'}
          {castaway?.eliminatedEpisode && (
            <Popover>
              <PopoverTrigger>
                <span className='ml-1 text-muted-foreground cursor-help'>
                  <FlameKindling className='align-text-bottom inline w-4 h-4' />
                  ({castaway.eliminatedEpisode})
                </span>
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1' align='end'>
                <PopoverArrow />
                Eliminated Episode {castaway.eliminatedEpisode}
              </PopoverContent>
            </Popover>
          )}
          <div className='ml-auto flex gap-0.5'>
            {castaway && castaway.tribes.length > 1 && castaway.tribes.map((tribe) => (
              <Popover key={`${tribe.tribeName}-${tribe.episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {tribe.episode}
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </ColorRow>
      </TableCell>
    </>
  );
}


