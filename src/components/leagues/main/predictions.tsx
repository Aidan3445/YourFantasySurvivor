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

  return (
    <div className='px-4'>
      <PredictionCards
        predictions={[...predictions, ...predictions, ...predictions]}
        castaways={castaways}
        tribes={tribes} />
    </div>
  );
}
