'use client';

import PredictionCards from '~/components/leagues/actions/events/predictions/cards';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { Flame } from 'lucide-react';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useActionDetails';
import { useMemo } from 'react';

interface MakePredictionsProps {
  wallet?: number;
}

export default function MakePredictions({ wallet }: MakePredictionsProps) {
  const { actionDetails, predictionRuleCount, keyEpisodes, predictionsMade, rules } = useLeagueActionDetails();


  const betTotal = useMemo(() => predictionsMade.reduce((acc, pred) =>
    acc + (pred?.bet ?? 0), 0), [predictionsMade]);

  const castaways = useMemo(() =>
    Object.values(actionDetails ?? {})
      .flatMap(({ castaways }) => castaways.map(c => c.castaway)), [actionDetails]);
  const tribes = useMemo(() =>
    Object.values(actionDetails ?? {}).map(({ tribe }) => tribe), [actionDetails]);

  const balance = useMemo(() => (wallet ?? 0) - betTotal, [wallet, betTotal]);

  if (predictionRuleCount === 0 || !keyEpisodes?.nextEpisode) return null;

  return (
    <div className='text-center bg-card rounded-lg w-full relative overflow-clip'>
      {rules?.shauhinMode?.enabled && rules.shauhinMode.enabledBets.length > 0 &&
        <div className='absolute top-2 right-4 text-sm italic text-muted-foreground'>
          Bet Balance: {balance}<Flame className='inline align-top w-4 h-min stroke-muted-foreground' />
        </div >
      }
      {
        keyEpisodes.nextEpisode.airStatus === 'Airing' ?
          <h1 className='text-3xl'>
            Predictions are locked until the episode ends.
          </h1> :
          <h1 className='text-3xl mt-8 lg:mt-0'>{'This Week\'s Prediction'}{predictionRuleCount > 1 ? 's' : ''}</h1>
      }
      <span className='flex flex-wrap justify-center items-center gap-x-4 text-muted-foreground text-sm pb-1' >
        <span className='text-nowrap'>
          {keyEpisodes.nextEpisode.episodeNumber}: {keyEpisodes.nextEpisode.title}
        </span>
        <AirStatus airDate={new Date(keyEpisodes.nextEpisode.airDate)} airStatus={keyEpisodes.nextEpisode.airStatus} />
      </span>
      {
        keyEpisodes.nextEpisode.airStatus === 'Upcoming' && (
          <PredictionCards
            predictionRuleCount={predictionRuleCount}
            rules={rules}
            predictionsMade={predictionsMade}
            castaways={castaways}
            tribes={tribes} />
        )
      }
    </div >
  );
}
