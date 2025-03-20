import { QUERIES } from '~/app/api/leagues/query';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { PredictionCards } from '../draft/makePredictions';
import { AirStatus } from './recentActivity';
import { type EpisodeNumber } from '~/server/db/defs/episodes';
import { type Prediction } from '~/server/db/defs/events';
import { cn } from '~/lib/utils';
import { Flame } from 'lucide-react';
import { BounceyCarousel } from '~/components/ui/carousel';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table';


interface PredictionsProps {
  leagueHash: LeagueHash;
}

export default async function Predictions({ leagueHash }: PredictionsProps) {

  const [week, member] = await Promise.all([
    QUERIES.getThisWeeksPredictions(leagueHash),
    QUERIES.getMyPredictions(leagueHash),
  ]);

  return (
    <div className='w-full space-y-4'>
      <WeeklyPredictions weekly={week} />
      <MemberPredictions predictions={member} />
    </div>
  );
}

interface WeeklyPredictionsProps {
  weekly: Awaited<ReturnType<typeof QUERIES.getThisWeeksPredictions>>;
}

function WeeklyPredictions({ weekly }: WeeklyPredictionsProps) {
  if (!weekly) return null;
  const { predictions, castaways, tribes, nextEpisode } = weekly;

  if (predictions.length === 0) return null;

  return (
    <div className='text-center bg-card rounded-lg w-full'>
      <h1 className='text-3xl'>{'This Week\'s Prediction'}{predictions.length > 1 ? 's' : ''}</h1>
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

interface MemberPredictionsProps {
  predictions: Record<EpisodeNumber, Prediction[]>;
}

function MemberPredictions({ predictions }: MemberPredictionsProps) {
  if (Object.keys(predictions).length === 0) return null;

  const stats = Object.values(predictions).reduce((acc, preds) => {
    preds.forEach((pred) => {
      if (pred.results.some((res) =>
        res.referenceId === pred.prediction.referenceId &&
        res.referenceType === pred.prediction.referenceType)) {
        acc.count.correct++;
        acc.points.earned += pred.points;
      }
      acc.count.total++;
      acc.points.possible += pred.points;
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
    }
  });

  if (stats.count.total >= 1) {
    const prediction = Object.entries(predictions)[0];
    if (!prediction) return null;

    const [episode, preds] = prediction;
    return (
      <div className='text-center bg-card rounded-lg md:w-[calc(100svw-8rem)] lg:w-[calc(100svw-19rem)]'>
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
    <div className='text-center bg-card rounded-lg md:w-[calc(100svw-8rem)] lg:w-[calc(100svw-19rem)]'>
      <h1 className='text-3xl'>Prediction History</h1>
      <span className='flex justify-center items-center gap-2 text-sm'>
        <p className=' text-muted-foreground'>Accuracy: {stats.count.correct}/{stats.count.total}</p>
        <p className=' text-muted-foreground'>Points: {stats.points.earned}/{stats.points.possible}</p>
      </span>
      <BounceyCarousel items={Object.entries(predictions).toReversed().map(([episode, preds]) => ({
        header: (<h2 className='text-2xl leading-loose'>{`Episode ${episode}`}</h2>),
        content: (<PredctionTable predictions={preds} />),
        footer: null,
      }))} />
    </div>
  );
}

interface PredictionTableProps {
  predictions: Prediction[];
}

function PredctionTable({ predictions }: PredictionTableProps) {
  return (
    <Table>
      <TableCaption className='sr-only'>Member Predictions</TableCaption>
      <TableHeader>
        <TableRow className='px-4 bg-white pointer-events-none'>
          <TableHead className='text-center'>Event</TableHead>
          <TableHead className='text-center'>Points</TableHead>
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
              <TableRow key={pred.leagueEventRuleId} className='bg-b3'>
                <TableCell>
                  <div className='flex flex-col'>
                    {pred.eventName}
                    <span className='text-xs italic'>
                      {pred.timing.join(' - ')}
                    </span>
                  </div>
                </TableCell>
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
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
