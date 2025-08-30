import { TableBody, TableRow } from '~/components/common/table';
import { type CastawayDetails } from '~/types/castaways';
import CastawayEntry from '~/components/home/scoreboard/entry';

export interface BodyProps {
  sortedCastaways: [string, number[]][];
  castawayColors: Record<string, string>;
  castawaySplitIndex: number;
  data: {
    castaways: CastawayDetails[];
    season: {
      seasonId: number;
    };
  };
}

export default function ScorboardBody({
  sortedCastaways, castawayColors, castawaySplitIndex, data
}: BodyProps) {
  return (
    <TableBody>
      {sortedCastaways.slice(0, castawaySplitIndex).map(([castawayName, scores], index) => {
        const totalPoints = scores.slice().pop() ?? 0;
        const color = castawayColors[castawayName] ?? '#ffffff';
        const castaway = data.castaways.find(c => c.fullName === castawayName);

        const [secondCastawayName, secondScores] = sortedCastaways[index + castawaySplitIndex] ?? [];

        return (
          <TableRow key={`${castawayName}-${secondCastawayName ?? 'empty'}`}>
            <CastawayEntry
              place={index + 1}
              castaway={castaway}
              points={totalPoints}
              color={color}
            />
            {secondCastawayName && secondScores && (
              <CastawayEntry
                place={index + 1 + castawaySplitIndex}
                castaway={data.castaways.find(c => c.fullName === secondCastawayName)}
                points={secondScores.slice().pop() ?? 0}
                color={castawayColors[secondCastawayName] ?? '#ffffff'}
              />
            )}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
