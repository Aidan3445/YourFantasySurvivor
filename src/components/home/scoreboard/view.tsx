import { compileScores } from '~/lib/scores';
import { newtwentyColors } from '~/lib/colors';
import ScoreboardTable from '~/components/home/scoreboard/table';
import getSeasonsData from '~/services/seasons/query/seasonsData';

export async function CastawayScoreboard() {
  const scoreData = await getSeasonsData(false);

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
      data.eliminations,
      data.tribesTimeline
    ).scores;

    const sortedCastaways = Object.entries(castawayScores)
      .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

    const castawayColors: Record<string, string> =
      scoreData[0]!.castaways.sort(({ fullName: a }, { fullName: b }) => a.localeCompare(b))
        .reduce((acc, { fullName }, index) => {
          acc[fullName] = newtwentyColors[index % newtwentyColors.length]!;
          return acc;
        }, {} as Record<string, string>);

    const castawaySplitIndex = Math.ceil(sortedCastaways.length / 2);

    return { sortedCastaways, castawayColors, castawaySplitIndex, data };
  });

  return (
    <ScoreboardTable scoresBySeason={scoresBySeason} />
  );
}

