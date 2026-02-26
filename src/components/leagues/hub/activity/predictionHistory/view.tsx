'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/common/card';
import { CoverCarousel } from '~/components/common/carousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import PredctionTable from '~/components/leagues/hub/activity/predictionHistory/table';
import ColorRow from '~/components/shared/colorRow';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeagueRules } from '~/hooks/leagues/useLeagueRules';
import { useBaseEvents } from '~/hooks/seasons/useBaseEvents';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { type ScoringBaseEventName, type PredictionWithEvent } from '~/types/events';

export default function PredictionHistory() {
  const { data: league } = useLeague();
  const { data: keyEpisodes } = useKeyEpisodes(league?.seasonId ?? null);
  const { data: rules } = useLeagueRules();
  const { data: leagueMembers } = useLeagueMembers();
  const [selectedMemberId, setSelectedMemberId] = useState(leagueMembers?.loggedIn?.memberId);
  const { basePredictionsMade, customPredictionsMade } = usePredictionsMade(undefined, selectedMemberId);
  const { data: customEvents } = useCustomEvents();
  const { data: baseEvents } = useBaseEvents(league?.seasonId ?? null);

  const [resetCarousel, setResetCarousel] = useState(false);

  useEffect(() => {
    if (leagueMembers?.loggedIn?.memberId) {
      setSelectedMemberId(leagueMembers.loggedIn.memberId);
    }
  }, [leagueMembers?.loggedIn?.memberId]);

  const predictionsWithEvents = useMemo(() => {
    const predictions: Record<number, PredictionWithEvent[]> = {};
    if (!keyEpisodes?.previousEpisode) return predictions;

    if (baseEvents) {
      // note we have two different episode numbers available to us here:
      // * prediction.eventNumber is the episode when the prediction was made.
      // * event.episodeNumber is the episode when the event occurs (if there is one)
      // for weekly events these are the same, but for sole survivor, fire win, etc they may differ

      Object.entries(basePredictionsMade).forEach(([episodeNumber, predictionMap]) => {
        const episodeNum = Number(episodeNumber);
        if (episodeNum > keyEpisodes.previousEpisode!.episodeNumber) return;

        const predsWithEvents = predictionMap.map(pred => {
          const rule = rules?.basePrediction?.[pred.eventName as ScoringBaseEventName];
          return {
            ...pred,
            points: rule?.points ?? 0,
            event: Object.values(baseEvents ?? {})
              .map(epEvents => Object.values(epEvents)
                .find(event => event.eventId === pred.eventId))
              .find(e => e !== undefined),
            timing: rule?.timing ?? []
          };
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
        return {
          ...pred,
          points: rule?.points ?? 0,
          event: Object.values(customEvents.events ?? {})
            .map(epEvents => Object.values(epEvents)
              .find(event => event.eventId === pred.eventId))
            .find(e => e !== undefined),
          timing: rule?.timing ?? []
        };
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

  const stats = Object.values(predictionsWithEvents).reduce((acc, pred) => {
    pred.forEach(p => {
      acc.count.episodes.add(p.predictionEpisodeNumber);
      if (p.eventId === null) return acc;
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

  if (stats.count.total === 0 || !Object.entries(predictionsWithEvents)[0]) return (
    <Card className='w-full p-0 bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10'>
      {/* Accent Elements */}
      <div className='absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl' />
      <CardHeader>
        <h1 className='text-3xl font-black uppercase tracking-wider'>Prediction History</h1>
        <div className='flex flex-wrap justify-center items-center gap-4 text-sm font-medium mt-2 relative z-10'>
          <div className='flex justify-center items-center gap-4'>
            <p className='text-muted-foreground'>Accuracy:{' '}
              <span className='text-foreground font-bold'>
                {stats.count.correct}/{stats.count.total}
              </span>
            </p>
            <p className='text-muted-foreground'>Points:{' '}
              <span className='text-foreground font-bold'>
                {stats.points.earned}/{stats.points.possible}
              </span>
            </p>
          </div>
          <Select
            value={`${selectedMemberId}`}
            onValueChange={value => {
              setSelectedMemberId(+value);
              setResetCarousel(true);
            }}>
            <SelectTrigger className='w-min'>
              <SelectValue placeholder='Select Member' />
            </SelectTrigger>
            <SelectContent>
              {leagueMembers?.members
                .sort((a, b) => {
                  if (a.loggedIn) return -1;
                  if (b.loggedIn) return 1;
                  return a.displayName.localeCompare(b.displayName);
                })
                .map(member => (
                  <SelectItem key={member.memberId} value={`${member.memberId}`}>
                    <ColorRow color={member.color} className='w-full'>
                      {member.displayName}
                    </ColorRow>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col px-0 my-4 text-center overflow-hidden bg-accent/50 rounded-lg border-2 border-primary/20 overflow-x-clip p-0 mb-4 origin-top h-fit overflow-y-clip w-[90%] relative z-10 mx-auto'>
        <h2 className='text-2xl font-bold uppercase tracking-wider bg-primary/10 py-2'>
          No predictions made yet for this member.
        </h2>
      </CardContent>
    </Card>
  );


  if (stats.count.episodes.size === 1) {
    const prediction = Object.entries(predictionsWithEvents)[0]!;

    const [episode, preds] = prediction;
    return (
      <Card className='w-full p-0 bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10'>
        {/* Accent Elements */}
        <div className='absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl' />
        <CardHeader>
          <h1 className='text-3xl font-black uppercase tracking-wider'>Prediction History</h1>
          <div className='flex flex-wrap justify-center items-center gap-4 text-sm font-medium mt-2 relative z-10'>
            <div className='flex justify-center items-center gap-4'>
              <p className='text-muted-foreground'>Accuracy:{' '}
                <span className='text-foreground font-bold'>
                  {stats.count.correct}/{stats.count.total}
                </span>
              </p>
              <p className='text-muted-foreground'>Points:{' '}
                <span className='text-foreground font-bold'>
                  {stats.points.earned}/{stats.points.possible}
                </span>
              </p>
            </div>
            <Select
              value={`${selectedMemberId}`}
              onValueChange={value => {
                setSelectedMemberId(+value);
                setResetCarousel(true);
              }}>
              <SelectTrigger className='w-min'>
                <SelectValue placeholder='Select Member' />
              </SelectTrigger>
              <SelectContent>
                {leagueMembers?.members
                  .sort((a, b) => {
                    if (a.loggedIn) return -1;
                    if (b.loggedIn) return 1;
                    return a.displayName.localeCompare(b.displayName);
                  })
                  .map(member => (
                    <SelectItem key={member.memberId} value={`${member.memberId}`}>
                      <ColorRow color={member.color} className='w-full'>
                        {member.displayName}
                      </ColorRow>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col px-0 my-4 text-center overflow-hidden bg-accent/50 rounded-lg border-2 border-primary/20 overflow-x-clip p-0 mb-4 origin-top h-fit overflow-y-clip w-[90%] relative z-10 mx-auto'>
          <h2 className='text-2xl font-bold uppercase tracking-wider bg-primary/10 py-2'>
            Episode{' '}{episode}
          </h2>
          <PredctionTable predictions={preds} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full p-0 bg-card rounded-lg border-2 border-primary/20'>
      {/* Accent Elements */}
      <div className='absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl' />

      <CardHeader className='relative mb-4'>
        <h1 className='text-3xl font-black uppercase tracking-wider'>Prediction History</h1>
        <div className='flex flex-wrap justify-center items-center gap-4 text-sm font-medium mt-2 relative z-10'>
          <div className='flex justify-center items-center gap-4'>
            <p className='text-muted-foreground'>Accuracy:{' '}
              <span className='text-foreground font-bold'>
                {stats.count.correct}/{stats.count.total}
              </span>
            </p>
            <p className='text-muted-foreground'>Points:{' '}
              <span className='text-foreground font-bold'>
                {stats.points.earned}/{stats.points.possible}
              </span>
            </p>
          </div>
          <Select
            value={`${selectedMemberId}`}
            onValueChange={value => {
              setSelectedMemberId(+value);
              setResetCarousel(true);
            }}>
            <SelectTrigger className='w-min'>
              <SelectValue placeholder='Select Member' />
            </SelectTrigger>
            <SelectContent>
              {leagueMembers?.members
                .sort((a, b) => {
                  if (a.loggedIn) return -1;
                  if (b.loggedIn) return 1;
                  return a.displayName.localeCompare(b.displayName);
                })
                .map(member => (
                  <SelectItem key={member.memberId} value={`${member.memberId}`}>
                    <ColorRow color={member.color} className='w-full'>
                      {member.displayName}
                    </ColorRow>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='px-0'>
        <CoverCarousel
          items={Object.entries(predictionsWithEvents).toReversed().map(([episode, preds]) => ({
            header: (
              <h2 className='text-2xl leading-loose font-bold uppercase tracking-wider'>
                Episode{' '}{episode}
              </h2>
            ),
            content: (
              <PredctionTable predictions={preds} />
            )
          }))}
          reset={resetCarousel}
          setReset={setResetCarousel} />
      </CardContent>
    </Card>
  );
}
