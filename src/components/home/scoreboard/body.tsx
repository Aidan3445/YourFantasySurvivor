'use client';

import { TableBody, TableRow } from '~/components/common/table';
import CastawayEntry from '~/components/home/scoreboard/entry';
import { getTribeTimeline } from '~/lib/utils';
import { type SeasonsDataQuery } from '~/types/seasons';

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
  return (
    <TableBody>
      {sortedCastaways.slice(0, castawaySplitIndex).map(([castawayId, scores], index) => {
        const totalPoints = scores.slice().pop() ?? 0;
        const color = castawayColors[castawayId] ?? '#ffffff';
        const castaway = data.castaways.find(c => c.castawayId === Number(castawayId));
        const tribeTimeline = getTribeTimeline(castawayId, data.tribesTimeline, data.tribes);

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
          secondTribeTimeline = secondCastawayId
            ? getTribeTimeline(secondCastawayId, data.tribesTimeline, data.tribes)
            : [];
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
