import { type ShauhinModeSettings } from '~/types/events';
import { type leaguesService as QUERIES } from '~/services/leagues';
import PredictionCards from '~/components/leagues/actions/events/predictions/cards';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { Flame } from 'lucide-react';

interface MakePredictionsProps {
  predictions: Awaited<ReturnType<typeof QUERIES.getThisWeeksPredictions>>;
  betRules: ShauhinModeSettings | undefined;
  myScore: number | undefined;
}

export default function MakePredictions({ predictions: weekly, betRules, myScore }: MakePredictionsProps) {
  if (!weekly) return null;
  const {
    basePredictionRules,
    basePredictions,
    customPredictions,
    castaways,
    tribes,
    nextEpisode
  } = weekly;

  const totalPredictionsCount = customPredictions.length + Object.entries(basePredictionRules)
    .filter(([_, rule]) => rule.enabled).length;

  if (totalPredictionsCount === 0 || nextEpisode.airStatus === 'Aired') return null;

  const betTotal = basePredictions.reduce((acc, pred) =>
    acc + (pred?.predictionMade?.bet ?? 0), 0);

  const balance = (myScore ?? 0) - betTotal;

  return (
    <div className='text-center bg-card rounded-lg w-full relative overflow-clip'>
      {betRules?.enabled && betRules?.enabledBets.length > 0 &&
        <div className='absolute top-2 right-4 text-sm italic text-muted-foreground'>
          Bet Balance: {balance}<Flame className='inline align-top w-4 h-min stroke-muted-foreground' />
        </div >
      }
      {
        nextEpisode.airStatus === 'Airing' ?
          <h1 className='text-3xl'>
            Predictions are locked until the episode ends.
          </h1> :
          <h1 className='text-3xl mt-8 lg:mt-0'>{'This Week\'s Prediction'}{totalPredictionsCount > 1 ? 's' : ''}</h1>
      }
      < span className='flex flex-wrap justify-center items-center gap-x-4 text-muted-foreground text-sm pb-1' >
        <span className='text-nowrap'>
          {nextEpisode.episodeNumber}: {nextEpisode.episodeTitle}
        </span>
        <AirStatus airDate={new Date(nextEpisode.episodeAirDate)} airStatus={nextEpisode.airStatus} />
      </span>
      {
        nextEpisode.airStatus === 'Upcoming' && (
          <PredictionCards
            basePredictionRules={basePredictionRules}
            basePredictions={basePredictions}
            customPredictions={customPredictions}
            castaways={castaways}
            tribes={tribes} />
        )
      }
    </div >
  );
}
