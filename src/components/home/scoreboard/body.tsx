'use client';

import { TableBody, TableRow } from '~/components/common/table';
import CastawayEntry from '~/components/home/scoreboard/entry';
import { type SeasonsDataQuery } from '~/types/seasons';
import { type Tribe } from '~/types/tribes';

export interface BodyProps {
  sortedCastaways: [number, number[]][];
  castawayColors: Record<string, string>;
  castawaySplitIndex: number;
  data: SeasonsDataQuery;
  allZero?: boolean;
}

export default function ScorboardBody({
  sortedCastaways, castawayColors, castawaySplitIndex, data, allZero
}: BodyProps) {
  const getTribeTimeline = (castawayId: number) => {
    return Object.entries(data.tribesTimeline)
      .map(([episode, tribeUpdates]) => {
        const update = Object.entries(tribeUpdates)
          .find(([_, castawayIds]) => castawayIds.includes(castawayId));
        if (update) {
          const tribe = data.tribes.find(t => t.tribeId === Number(update[0]));
          return { episode: Number(episode), tribe: tribe };
        }
        return null;
      })
      .filter((entry): entry is { episode: number; tribe: Tribe; } => entry !== null)
      .sort((a, b) => a.episode - b.episode);
  };

  return (
    <TableBody>
      {sortedCastaways.slice(0, castawaySplitIndex).map(([castawayId, scores], index) => {
        const totalPoints = scores.slice().pop() ?? 0;
        const color = castawayColors[castawayId] ?? '#ffffff';
        const castaway = data.castaways.find(c => c.castawayId === Number(castawayId));
        const tribeTimeline = getTribeTimeline(castawayId);

        // Find the corresponding castaway and scores for the second column
        const [secondCastawayId, secondScores] = sortedCastaways[index + castawaySplitIndex] ?? [];
        let secondCastaway;
        let secondTotalPoints;
        let secondColor;
        let secondTribeTimeline;
        if (secondCastawayId && secondScores) {
          secondCastaway = secondCastawayId ? data.castaways.find(c => c.castawayId === Number(secondCastawayId)) : undefined;
          secondTotalPoints = secondScores?.slice().pop() ?? 0;
          secondColor = secondCastawayId ? (castawayColors[secondCastawayId] ?? '#ffffff') : '';
          secondTribeTimeline = secondCastawayId ? getTribeTimeline(secondCastawayId) : [];
        }

        return (
          <TableRow key={`${castawayId}-${secondCastawayId ?? 'empty'}`}>
            <CastawayEntry
              allZero={allZero}
              place={index + 1}
              castaway={castaway}
              points={totalPoints}
              color={color}
              tribeTimeline={tribeTimeline}
            />
            {secondCastawayId && secondScores && (
              <CastawayEntry
                allZero={allZero}
                place={index + 1 + castawaySplitIndex}
                castaway={secondCastaway}
                points={secondTotalPoints}
                color={secondColor}
                tribeTimeline={secondTribeTimeline}
              />
            )}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
