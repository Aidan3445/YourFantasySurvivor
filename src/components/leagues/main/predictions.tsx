import { getThisWeeksPredictions } from '~/app/api/leagues/query';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { PredictionCards } from '../draft/makePredictions';
import { AirStatus } from './recentActivity';

interface PredictionsProps {
  leagueHash: LeagueHash;
}

export default async function Predictions({ leagueHash }: PredictionsProps) {
  const res = await getThisWeeksPredictions(leagueHash);
  if (!res) return null;

  const { predictions, castaways, tribes, nextEpisode } = res;

  if (predictions.length === 0) return null;

  return (
    <div className='text-center bg-card rounded-lg w-full'>
      <h1 className='text-3xl'>{'This Week\'s Prediction'}{predictions.length > 1 ? 's!' : '!'}</h1>
      <span className='flex flex-wrap justify-center items-center gap-x-2 text-muted-foreground text-sm'>
        <span className='text-nowrap'>
          {nextEpisode.episodeNumber}: {nextEpisode.episodeTitle}
        </span>
        <AirStatus airDate={nextEpisode.episodeAirDate} airStatus={nextEpisode.airStatus} />
      </span>
      <PredictionCards
        predictions={predictions}
        castaways={castaways}
        tribes={tribes} />
    </div>
  );
}
