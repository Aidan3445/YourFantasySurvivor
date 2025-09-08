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

  return (
    <ScoreboardTable scoreData={scoreData} />
  );
}

