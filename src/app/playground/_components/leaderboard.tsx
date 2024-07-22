'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '~/app/_components/commonUI/use-toast';
import CardContainer from '~/app/_components/cardContainer';
import SelectSeason from '~/app/_components/selectSeason';
import { type Events } from '~/app/api/seasons/[name]/events/query';
import compileScores from '~/app/api/seasons/[name]/events/scores';
import { cn } from '~/lib/utils';
import { defaultRules, type BaseEventRules } from '~/server/db/schema/leagues';
import Chart from './scoreChart';
import Scores from './scoreboard';
import { Share2 } from 'lucide-react';
import { Button } from '~/app/_components/commonUI/button';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '~/app/_components/commonUI/hover';
import { HoverCardArrow, HoverCardPortal } from '@radix-ui/react-hover-card';

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const season = searchParams.get('season')!;

  useEffect(() => {
    const rules: BaseEventRules = defaultRules;
    // iterate through rules and set to searchParams if found
    for (const key in rules) {
      const value = searchParams.get(key);
      if (value) rules[key as keyof BaseEventRules] = parseInt(value);
    }

    if (season) {
      fetch(`/api/seasons/${season}/events`)
        .then((res) => res.json())
        .then((events: Events) => setScores(compileScores(events, rules)))
        .catch((err: Error) => {
          toast({
            title: 'Error fetching scores',
            description: err.message,
            variant: 'error',
          });
        });
    }
  }, [season, toast, searchParams]);

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
      url: `/seasons/castaway?season=${season}&castaway=${name}`,
      color: 'hsl(0,100%,50%)',
      score: episodeScores[episodeScores.length - 1] ?? 0,
      episodeScores
    };
  }).sort((a, b) => b.score - a.score);

  sortedScores.forEach((score, index) => {
    score.color = `hsl(${300 * index / sortedScores.length}, ${index & 1 ? '50%' : '80%'}, 30%)`;
  });


  const copyUrl = async () => {
    // get url to copy
    const url = window.location.href;
    // Copy the text inside the text field
    await navigator.clipboard.writeText(url);
    // make toast
    toast({
      title: 'Copied to clipboard',
      description: 'Share this link to these rules with your friends!',
    });
  };

  return (
    <CardContainer className={cn('justify-start items-center p-4', className)}>
      <h3 className='text-2xl font-medium'>Leaderboard</h3>
      <span className='flex justify-between w-full items-center'>
        <SelectSeason className='mx-0' />
        <HoverCard openDelay={300}>
          <HoverCardTrigger>
            <Button className='p-0.5 w-min h-min left-auto' onClick={copyUrl}>
              <Share2 className='w-5 h-5' />
            </Button>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent className='w-full rounded-md border border-black bg-b2' side='top'>
              <HoverCardArrow />
              <p>Copy url to share these scoring rules.</p>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      </span>
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

