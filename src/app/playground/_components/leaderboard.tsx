'use client';
import { useEffect, useState } from 'react';
import CardContainer from '~/app/_components/cardContainer';
import SelectSeason from '~/app/_components/stats/selectSeason';
import { type Events } from '~/app/api/seasons/[name]/events/query';
import compileScores from '~/app/api/seasons/[name]/events/scores';
import { cn } from '~/lib/utils';
import { type BaseEventRules } from '~/server/db/schema/leagues';
import Chart from './scoreChart';
import Scores from './scoreboard';

interface LeaderboardProps {
  rules: BaseEventRules;
  className?: string;
}

export function Leaderboard({ rules, className }: LeaderboardProps) {
  const [season, setSeason] = useState<string>('');
  const [scores, setScores] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (season) {
      fetch(`/api/seasons/${season}/events`)
        .then((res) => res.json())
        .then((events: Events) => setScores(compileScores(events, rules)))
        .catch((err) => console.error(err));
    }
  }, [season, rules]);

  const sortedScores = Object.entries(scores).map(([name, score]) => {
    const episodeScores = score.reduce((totals, score, index) => {
      // pop last score from totals
      const last = totals.pop() ?? 0;
      // repeat last until scoring index reached
      for (let i = totals.length; i < index; i++) {
        totals.push(last);
      }
      // add current score to totals
      totals.push(last + score);
      return totals;
    }, [] as number[]);

    return {
      name,
      color: 'hsl(0,100%,50%)',
      score: episodeScores[episodeScores.length - 1] ?? 0,
      episodeScores
    };
  }).sort((a, b) => b.score - a.score);

  sortedScores.forEach((score, index) => {
    score.color = `hsl(${300 * index / sortedScores.length}, ${index & 1 ? '50%' : '80%'}, 30%)`;
  });

  return (
    <CardContainer className={cn('justify-start items-center p-4', className)}>
      <h3 className='text-2xl font-medium'>Leaderboard</h3>
      <SelectSeason season={season} setSeason={setSeason} />
      <span className='grid grid-cols-4 gap-2 w-full'>
        <Scores data={sortedScores} />
        <Chart data={sortedScores} />
      </span >
    </CardContainer >
  );
}

export function mouseOverLeaderboard(name: string, sortedNames: string[]) {
  // update scoreboard name style
  const scoreEl = document.getElementById(`score-${name}`);
  if (scoreEl) scoreEl.style.color = 'black';
  // update tooltip name style
  const tooltipEl = document.getElementById(`tooltip-${name}`);
  if (tooltipEl) tooltipEl.style.color = 'black';


  // update line styles
  sortedNames.forEach((n) => {
    const lineEl = document.getElementById(`line-${n}`);
    if (!lineEl) return;

    if (n !== name) {
      lineEl.style.strokeOpacity = '0.25';
    } else {
      lineEl.style.strokeOpacity = '1';
      lineEl.style.strokeWidth = '10';
    }
  });
}

export function mouseOutLeaderboard(name: string, color: string, sortedNames: string[]) {
  try {
    // reset line style
    const lineEl = document.getElementById(`line-${name}`);
    if (lineEl) {
      lineEl.style.strokeWidth = '6';
      lineEl.style.strokeOpacity = '0.7';
      lineEl.style.stroke = color;
    }
    // reset scoreboard name style
    const scoreEl = document.getElementById(`score-${name}`);
    if (scoreEl) scoreEl.style.color = color;
    // reset tooltip name style
    const tooltipEl = document.getElementById(`tooltip-${name}`);
    if (tooltipEl) tooltipEl.style.color = color;

    // reset other lines visibility
    sortedNames.forEach((n) => {
      const otherLineEl = document.getElementById(`line-${n}`);
      if (!otherLineEl) return;

      otherLineEl.style.strokeOpacity = '0.7';
    });
  } catch (e) {
    if (!(e instanceof TypeError)) {
      throw e;
    }
  }
}
