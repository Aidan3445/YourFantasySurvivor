import { getThisWeeksPredictions } from '~/app/api/leagues/query';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { PredictionCards } from '../draft/makePredictions';

interface PredictionsProps {
  leagueHash: LeagueHash;
}

export default async function Predictions({ leagueHash }: PredictionsProps) {
  const res = await getThisWeeksPredictions(leagueHash);
  if (!res) return null;

  const { predictions, castaways, tribes } = res;

  if (predictions.length === 0) return null;

  return (
    <div className='px-4 text-center'>
      <h1 className='text-3xl'>{'This Week\'s Prediction'}{predictions.length > 1 ? 's!' : '!'}</h1>
      <PredictionCards
        predictions={predictions}
        castaways={castaways}
        tribes={tribes} />
    </div>
  );
}
