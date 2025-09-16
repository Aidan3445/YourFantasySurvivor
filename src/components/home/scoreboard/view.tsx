import ScoreboardTable from '~/components/home/scoreboard/table';
import getSeasonsData from '~/services/seasons/query/seasonsData';

export async function CastawayScoreboard() {
  const scoreData = await getSeasonsData(true);

  if (scoreData.length === 0) {
    return (
      <div className='text-center py-6'>
        <p className='text-muted-foreground mb-4'>
          No active leagues with scoring data.
        </p>
      </div>
    );
  }

  const mostRecent6 = scoreData
    .filter(s => s.tribes.length > 0)
    .sort((a, b) => b.season.premiereDate.getTime() - a.season.premiereDate.getTime())
    .slice(0, 6);

  return (
    <ScoreboardTable scoreData={mostRecent6} someHidden={scoreData.length > 6} />
  );
}

