'use client';

import PredictionCards from '~/components/leagues/actions/events/predictions/cards';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { Flame } from 'lucide-react';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useActionDetails';
import { useMemo, useState } from 'react';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { cn } from '~/lib/utils';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';

export default function MakePredictions() {
  const { scores, leagueMembers } = useLeagueData();
  const { actionDetails, predictionRuleCount, keyEpisodes, predictionsMade, rules } = useLeagueActionDetails();
  const { basePredictionsMade } = usePredictionsMade();

  const castaways = useMemo(() =>
    Object.values(actionDetails ?? {})
      .flatMap(({ castaways }) => castaways.map(c => c.castaway)), [actionDetails]);
  const tribes = useMemo(() =>
    Object.values(actionDetails ?? {}).map(({ tribe }) => tribe), [actionDetails]);

  const [formBetTotal, setFormBetTotal] = useState(0);
  const pendingBetTotal = useMemo(() =>
    Object.values(basePredictionsMade ?? {})
      .flatMap(preds => preds)
      .filter(p => p.eventId === null && (p.bet ?? 0) > 0)
      .reduce((total, p) => total + (p.bet ?? 0), 0),
    [basePredictionsMade]);
  const submittedBetTotal = useMemo(() => predictionsMade
    .reduce((total, p) => total +
      (p.eventId !== null
        ? 0
        : (p.bet ?? 0)), 0), [predictionsMade]);
  const balance = useMemo(() =>
    (scores?.Member[leagueMembers?.loggedIn?.memberId ?? -1]?.slice().pop() ?? 0) - submittedBetTotal - pendingBetTotal,
    [scores?.Member, leagueMembers?.loggedIn?.memberId, submittedBetTotal, pendingBetTotal]);

  if (predictionRuleCount === 0 || !keyEpisodes?.nextEpisode) return null;

  return (
    <div className='text-center bg-card rounded-lg w-full relative overflow-clip'>
      {rules?.shauhinMode?.enabled && rules.shauhinMode.enabledBets.length > 0 &&
        <div className='absolute top-2 right-4 text-sm italic text-muted-foreground text-right'>
          Bet Balance: {balance}<Flame className='inline align-top w-4 h-min stroke-muted-foreground' />
          {formBetTotal !== submittedBetTotal && <>
            <br />
            <span className={cn('text-xs rounded-sm text-muted-foreground p-0.5 bg-amber-400', {
              'bg-red-400': balance - formBetTotal < 0,
              'bg-green-400': formBetTotal < submittedBetTotal
            })}>
              Pending Balance: {balance - formBetTotal}<Flame className='inline mb-1 w-4 h-min stroke-muted-foreground' />
            </span>
          </>}
          <div className='flex-col'>
            form{formBetTotal} -
            bal{balance} -
            pts{scores?.Member[leagueMembers?.loggedIn?.memberId ?? -1]?.slice().pop()} -
            sub{submittedBetTotal} -
            pen{pendingBetTotal}
          </div>
        </div>
      }
      {
        keyEpisodes.previousEpisode?.airStatus === 'Airing' ?
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
        keyEpisodes.nextEpisode.airStatus === 'Upcoming' &&
        keyEpisodes.previousEpisode?.airStatus !== 'Airing' && (
          <PredictionCards
            predictionRuleCount={predictionRuleCount}
            rules={rules}
            predictionsMade={predictionsMade}
            castaways={castaways}
            tribes={tribes}
            wallet={balance}
            totalBet={formBetTotal}
            setBetTotal={setFormBetTotal} />
        )}
    </div>
  );
}
