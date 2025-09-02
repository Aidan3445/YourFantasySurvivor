import { seasonsService as SEASON_QUERIES } from '~/services/deprecated/seasonsService';
import { compileScores } from '~/lib/scores';
import { defaultBaseRules } from '~/types/events';
import { type CastawayName } from '~/types/castaways';
import { newtwentyColors } from '~/lib/colors';
import ScoreboardTable from '~/components/home/scoreboard/table';

export async function CastawayScoreboard() {
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
    <ScoreboardTable scoresBySeason={scoresBySeason} />
  );
}

