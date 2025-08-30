'use client';

import { type QUERIES } from '~/app/api/leagues/query';
import { PredictionCards } from '../draft/makePredictions';
import { AirStatus } from './recentActivity';
import { type EpisodeNumber } from '~/server/db/defs/episodes';
import { type ShauhinModeSettings, type Prediction, BaseEventFullName } from '~/server/db/defs/events';
import { cn } from '~/lib/utils';
import { Flame } from 'lucide-react';
import { CoverCarousel } from '~/components/common/carousel';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { usePredictions } from '~/hooks/usePredictions';
import { useLeague } from '~/hooks/useLeague';

export default function Predictions() {
  const { leagueData, league } = useLeague();
  const { predictions, history, betRules } = usePredictions();

  const displayName = league?.members?.loggedIn?.displayName;

  if (!displayName) return null;

  const myScore = [...leagueData.scores.Member[displayName]!].pop();

  return (
    <>
      <MakePredictions predictions={predictions} betRules={betRules} myScore={myScore} />
      <PredictionHistory history={history} />
    </>
  );
}

interface WeeklyPredictionsProps {
  predictions: Awaited<ReturnType<typeof QUERIES.getThisWeeksPredictions>>;
  betRules: ShauhinModeSettings | undefined;
  myScore: number | undefined;
}

function MakePredictions({ predictions: weekly, betRules, myScore }: WeeklyPredictionsProps) {
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

interface MemberPredictionsProps {
  history?: Record<EpisodeNumber, Prediction[]>;
}

function PredictionHistory({ history }: MemberPredictionsProps) {
  const predictions = history ?? {};

  const stats = Object.values(predictions).reduce((acc, preds) => {
    preds.forEach((pred) => {
      if (pred.results.some((res) =>
        res.referenceId === pred.prediction.referenceId &&
        res.referenceType === pred.prediction.referenceType)) {
        acc.count.correct++;
        acc.points.earned += pred.points;
        acc.points.earnedBets += pred.prediction.bet ?? 0;
      }
      acc.count.total++;
      acc.points.possible += pred.points;
      acc.points.possibleBets += pred.prediction.bet ?? 0;
    });
    return acc;
  }, {
    count: {
      correct: 0,
      total: 0,
    },
    points: {
      earned: 0,
      possible: 0,
      earnedBets: 0,
      possibleBets: 0,
    }
  });

  if (stats.count.total === 1) {
    const prediction = Object.entries(predictions)[0];
    if (!prediction) return null;

    const [episode, preds] = prediction;
    return (
      <div className='text-center bg-card rounded-lg'>
        <h1 className='text-3xl'>Prediction History</h1>
        <span className='flex justify-center items-center gap-2 text-sm'>
          <p className=' text-muted-foreground'>Accuracy: {stats.count.correct}/{stats.count.total}</p>
          <p className=' text-muted-foreground'>Points: {stats.points.earned}/{stats.points.possible}</p>
        </span>
        <article className='flex flex-col bg-card rounded-lg my-4 text-center overflow-hidden'>
          <h2 className='text-2xl'>{`Episode ${episode}`}</h2>
          <PredctionTable predictions={preds} />
        </article>
      </div>
    );
  }

  return (
    <div className='text-center bg-card rounded-lg w-full overflow-clip'>
      <h1 className='text-3xl'>Prediction History</h1>
      <span className='flex justify-center items-center gap-2 text-sm'>
        <p className=' text-muted-foreground'>Accuracy: {stats.count.correct}/{stats.count.total}</p>
        <p className=' text-muted-foreground'>Points: {stats.points.earned}/{stats.points.possible}</p>
      </span>
      <CoverCarousel items={Object.entries(predictions).toReversed().map(([episode, preds]) => ({
        header: (<h2 className='text-2xl leading-loose'>{`Episode ${episode}`}</h2>),
        content: (<PredctionTable predictions={preds} />),
      }))} />
    </div>
  );
}

interface PredictionTableProps {
  predictions: Prediction[];
}

function PredctionTable({ predictions }: PredictionTableProps) {
  const hasBets = predictions.some((pred) => pred.prediction.bet && pred.prediction.bet > 0);

  return (
    <Table className='transform-gpu will-change-transform'>
      <TableCaption className='sr-only'>Member Predictions</TableCaption>
      <TableHeader>
        <TableRow className='px-4 bg-white pointer-events-none'>
          <TableHead className='text-center'>Event</TableHead>
          <TableHead className='text-center'>Points</TableHead>
          {hasBets && <TableHead className='text-center'>Bet</TableHead>}
          <TableHead className='text-center'>Prediction</TableHead>
          <TableHead className='text-center'>Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {predictions.sort((a) => a.timing.some((t) => t.startsWith('Weekly')) ? 1 : -1)
          .map((pred) => {
            const hit = pred.results.some((res) =>
              res.referenceId === pred.prediction.referenceId &&
              res.referenceType === pred.prediction.referenceType);
            return (
              <TableRow key={pred.leagueEventRuleId ?? pred.eventName} className='bg-b3'>
                <TableCell>
                  <div className='flex flex-col text-nowrap'>
                    {BaseEventFullName[pred.eventName as keyof typeof BaseEventFullName] ??
                      pred.eventName}
                    <span className='text-xs italic'>
                      {pred.timing.join(' - ')}
                    </span>
                  </div >
                </TableCell >
                <TableCell>
                  <span className={cn('text-sm text-center',
                    hit ?
                      pred.points > 0 ? 'text-green-800' : 'text-red-800' :
                      'text-muted-foreground')}>
                    {pred.points > 0 && hit ? `+${pred.points}` : pred.points}
                    <Flame className={cn(
                      'inline align-top w-4 h-min',
                      hit ?
                        pred.points > 0 ? 'stroke-green-800' : 'stroke-red-800' :
                        'stroke-muted-foreground'
                    )} />
                  </span>
                </TableCell>
                {
                  hasBets &&
                  <TableCell>
                    {pred.prediction.bet && pred.prediction.bet > 0 ? (
                      hit ? (
                        <span className='text-sm text-center text-green-800'>
                          +{pred.prediction.bet}
                          <Flame className='inline align-top w-4 h-min stroke-green-800' />
                        </span>
                      ) : (
                        <span className='text-sm text-center text-red-800'>
                          -{pred.prediction.bet}
                          <Flame className='inline align-top w-4 h-min stroke-red-800' />
                        </span>
                      )
                    ) : <span className='text-sm text-center text-muted-foreground'>-</span>
                    }
                  </TableCell>
                }
                <TableCell>
                  <div className='md:hidden'>{pred.prediction.castawayShort ?? pred.prediction.tribe}</div>
                  <div className='hidden md:block'>{pred.prediction.castaway ?? pred.prediction.tribe}</div>
                </TableCell>
                <TableCell>
                  <div className='md:hidden'>
                    {pred.results.map((res) => res.castawayShort ?? res.tribe)
                      .join(', ') ||
                      <div className='text-muted-foreground'>TBD</div>
                    }
                  </div>
                  <div className='hidden md:block'>
                    {pred.results.map((res) => res.castaway ?? res.tribe)
                      .join(', ') ||
                      <div className='text-muted-foreground'>TBD</div>
                    }
                  </div>
                </TableCell>
              </TableRow >
            );
          })}
      </TableBody >
    </Table >
  );
}
