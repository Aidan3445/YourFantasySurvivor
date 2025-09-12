'use client';

import { useMemo } from 'react';
import { CoverCarousel } from '~/components/common/carousel';
import PredctionTable from '~/components/leagues/hub/activity/predictionHistory/table';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useBaseEvents } from '~/hooks/seasons/useBaseEvents';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { type ScoringBaseEventName, type PredictionWithEvent } from '~/types/events';

export default function PredictionHistory() {
  const { data: league } = useLeague();
  const { data: keyEpisodes } = useKeyEpisodes(league?.seasonId ?? null);
  const { data: rules } = useLeagueRules();
  const { basePredictionsMade, customPredictionsMade } = usePredictionsMade();
  const { data: customEvents } = useCustomEvents();
  const { data: baseEvents } = useBaseEvents(league?.seasonId ?? null);

  const predictionsWithEvents = useMemo(() => {
    const predictions: Record<number, PredictionWithEvent[]> = {};
    if (!keyEpisodes?.previousEpisode) return predictions;

    if (baseEvents) {
      // note we have two different episode numbers available to us here:
      // * prediction.eventNumber is the episode when the prediction was made
      // * event.episodeNumber is the episode when the event occurs (if there is one)
      // for weekly events these are the same, but for sole survivor they may differ
      Object.entries(basePredictionsMade).forEach(([episodeNumber, predictionMap]) => {
        const episodeNum = Number(episodeNumber);
        if (episodeNum > keyEpisodes.previousEpisode!.episodeNumber) return;

        const predsWithEvents = predictionMap.map(pred => {
          const rule = rules?.basePrediction?.[pred.eventName as ScoringBaseEventName];
          const t = {
            ...pred,
            points: rule?.points ?? 0,
            event: Object.values(baseEvents ?? {})
              .map(epEvents => Object.values(epEvents)
                .find(event => event.eventId === pred.pending))
              .find(e => e !== undefined),
            timing: rule?.timing ?? []
          };

          if (pred.pending === 564) {
            console.log({ pred, t, rule, baseEvents });
          }

          return t;

        });
        if (predsWithEvents.length === 0) return;
        predictions[episodeNum] ??= [];
        predictions[episodeNum].push(...predsWithEvents);
      });
    }


    if (!customEvents?.events) return predictions;

    Object.entries(customPredictionsMade).forEach(([episodeNumber, preds]) => {
      const episodeNum = Number(episodeNumber);
      if (episodeNum > keyEpisodes.previousEpisode!.episodeNumber) return;

      const predsWithEvents = preds.map(pred => {
        const rule = rules?.custom.find(rule => rule.eventName === pred.eventName);
        const t = {
          ...pred,
          points: rule?.points ?? 0,
          event: Object.values(customEvents.events ?? {})
            .map(epEvents => Object.values(epEvents)
              .find(event => event.eventId === pred.pending))
            .find(e => e !== undefined),
          timing: rule?.timing ?? []
        };

        if (pred.pending === 564) {
          console.log({ pred, t, rule, customEvents });
        }

        return t;
      });
      if (predsWithEvents.length === 0) return;
      predictions[episodeNum] ??= [];
      predictions[episodeNum].push(...predsWithEvents);
    });

    return predictions;
  }, [
    keyEpisodes?.previousEpisode,
    baseEvents,
    customEvents,
    customPredictionsMade,
    basePredictionsMade,
    rules?.basePrediction,
    rules?.custom
  ]);

  console.log({ predictionsWithEvents });

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
        content: (<PredctionTable predictions={preds} />)
      }))} />
    </div>
  );
}
