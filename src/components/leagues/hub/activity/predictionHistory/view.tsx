'use client';

import { useMemo } from 'react';
import { CoverCarousel } from '~/components/common/carousel';
import PredctionTable from '~/components/leagues/hub/activity/predictionHistory/table';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useBaseEvents } from '~/hooks/seasons/useBaseEvents';
import { type ScoringBaseEventName, type PredictionWithEvent } from '~/types/events';

export default function PredictionHistory() {
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { basePredictionsMade, customPredictionsMade } = usePredictionsMade();
  const { data: customEvents } = useCustomEvents();
  const { data: baseEvents } = useBaseEvents(league?.seasonId ?? null);

  const predictionsWithEvents = useMemo(() => {
    const predictions: Record<number, PredictionWithEvent[]> = {};
    if (baseEvents) {
      // note we have two different episode numbers available to us here:
      // * prediction.eventNumber is the episode when the prediction was made
      // * event.episodeNumber is the episode when the event occurs (if there is one)
      // for weekly events these are the same, but for sole survivor they may differ
      Object.entries(basePredictionsMade).forEach(([episodeNumber, predictionMap]) => {
        const predsWithEvents = predictionMap.map(pred => {
          const rule = rules?.basePrediction?.[pred.eventName as ScoringBaseEventName];
          return {
            ...pred,
            points: rule?.points ?? 0,
            event: Object.values(baseEvents[Number(episodeNumber)] ?? {})
              .find((event) => event.eventName === pred.eventName),
            timing: rule?.timing ?? []

          };
        });
        if (predsWithEvents.length === 0) return;
        predictions[Number(episodeNumber)] ??= [];
        predictions[Number(episodeNumber)]!.push(...predsWithEvents);
      });
    }


    if (!customEvents?.events) return predictions;

    Object.entries(customPredictionsMade).forEach(([episodeNumber, preds]) => {
      const predsWithEvents = preds.map(pred => {
        const rule = rules?.custom.find(rule => rule.eventName === pred.eventName);
        return {
          ...pred,
          points: rule?.points ?? 0,
          event: Object.entries(customEvents.events)
            .find(([_, events]) => Object.values(events)
              .find(e => e.eventName === pred.eventName))?.[1]?.[1],
          timing: rule?.timing ?? []
        };
      });
      if (predsWithEvents.length === 0) return;
      predictions[Number(episodeNumber)] ??= [];
      predictions[Number(episodeNumber)]!.push(...predsWithEvents);
    });

    return predictions;
  }, [basePredictionsMade, baseEvents, customPredictionsMade, customEvents?.events, rules]);

  const stats = Object.values(predictionsWithEvents).reduce((acc, pred) => {
    pred.forEach(p => {
      acc.count.episodes.add(p.episodeNumber);
      if (p.pending) return acc;
      if (p.hit) {
        acc.count.correct++;
        acc.points.earned += p.points;
        acc.points.earnedBets += p.bet ?? 0;
      }
      acc.count.total++;
      acc.points.possible += p.points;
      acc.points.possibleBets += p.bet ?? 0;
    });
    return acc;
  }, {
    count: {
      correct: 0,
      total: 0,
      episodes: new Set<number>(),
    },
    points: {
      earned: 0,
      possible: 0,
      earnedBets: 0,
      possibleBets: 0,
    }
  });

  if (stats.count.total === 0) return null;

  if (stats.count.episodes.size === 1) {
    const prediction = Object.entries(predictionsWithEvents)[0];
    if (!prediction) return null;

    const [episode, preds] = prediction;
    return (
      <div className='text-center bg-card rounded-lg w-full place-items-center'>
        <h1 className='text-3xl'>Prediction History</h1>
        <span className='flex justify-center items-center gap-2 text-sm'>
          <p className=' text-muted-foreground'>Accuracy: {stats.count.correct}/{stats.count.total}</p>
          <p className=' text-muted-foreground'>Points: {stats.points.earned}/{stats.points.possible}</p>
        </span>
        <article className='flex flex-col my-4 text-center overflow-hidden drop-shadow-md bg-secondary rounded-md overflow-x-clip p-0 mb-4 origin-top h-fit overflow-y-clip w-[90%] lg:w-1/2'>
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
      <CoverCarousel items={Object.entries(predictionsWithEvents).toReversed().map(([episode, preds]) => ({
        header: (<h2 className='text-2xl leading-loose'>{`Episode ${episode}`}</h2>),
        content: (<PredctionTable predictions={(() => {
          console.log('episode', episode, preds);
          return preds;
        })()} />)
      }))} />
    </div>
  );
}
