'use client';

import { TableBody, TableRow } from '~/components/common/table';
import CastawayRow from '~/components/home/scoreboard/row';
import { getTribeTimeline } from '~/lib/utils';
import { type SeasonsDataQuery } from '~/types/seasons';

export interface BodyProps {
  sortedCastaways: [number, number[]][];
  castawaySplitIndex: number;
  data: SeasonsDataQuery;
  allZero?: boolean;
}

export default function ScorboardBody({
  sortedCastaways, castawaySplitIndex, data, allZero
}: BodyProps) {
  return (
    <TableBody>
      {sortedCastaways.slice(0, castawaySplitIndex).map(([castawayId, scores], index) => {
        const totalPoints = scores.slice().pop() ?? 0;
        const castaway = data.castaways.find(c => c.castawayId === Number(castawayId));
        const tribeTimeline = getTribeTimeline(castawayId, data.tribesTimeline, data.tribes);

        // Find the corresponding castaway and scores for the second column
        const [secondCastawayId, secondScores] = sortedCastaways[index + castawaySplitIndex] ?? [];
        let secondCastaway;
        let secondTotalPoints;
        let secondTribeTimeline;
        if (secondCastawayId && secondScores) {
          secondCastaway = secondCastawayId ? data.castaways.find(c => c.castawayId === Number(secondCastawayId)) : undefined;
          secondTotalPoints = secondScores?.slice().pop() ?? 0;
          secondTribeTimeline = secondCastawayId
            ? getTribeTimeline(secondCastawayId, data.tribesTimeline, data.tribes)
            : [];
        }

        // place is index + 1 - number of members above them with same score
        const numberSameScore = sortedCastaways.slice(0, index)
          .filter(([_cid, s]) => (s.slice().pop() ?? 0) === (scores.slice().pop() ?? 0))
          .length;
        const place = index + 1 - numberSameScore;

        const secondNumberSameScore = secondScores ? sortedCastaways.slice(0, index + castawaySplitIndex)
          .filter(([_cid, s]) => (s.slice().pop() ?? 0) === (secondScores.slice().pop() ?? 0))
          .length : 0;
        const secondPlace = secondScores ? index + 1 + castawaySplitIndex - secondNumberSameScore : undefined;

        return (
          <TableRow
            key={`${castawayId}-${secondCastawayId ?? 'empty'}`}
            className='border-b border-primary/10 hover:bg-primary/5 hover:border-primary/20 transition-all group'>
            <CastawayRow
              allZero={allZero}
              place={place}
              castaway={castaway}
              points={totalPoints}
              tribeTimeline={tribeTimeline} />
            {secondCastawayId && secondScores && secondPlace && (
              <CastawayRow
                allZero={allZero}
                place={secondPlace}
                castaway={secondCastaway}
                points={secondTotalPoints}
                tribeTimeline={secondTribeTimeline} />
            )}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
