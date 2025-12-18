'use client';

import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { cn } from '~/lib/utils';
import Tier from '~/components/leagues/hub/scoreboard/podium/tier';

interface PodiumProps {
  overrideHash?: string;
  className?: string;
}

export default function Podium({ overrideHash, className }: PodiumProps) {
  const { sortedMemberScores, league } = useLeagueData(overrideHash);

  if (league?.status !== 'Inactive') return null;

  return (
    <div className={cn(
      'w-full text-center bg-card rounded-lg flex flex-col p-1 place-items-center',
      className
    )}>
      <h2 className='text-2xl font-bold text-primary'>
        Winner&apos;s Podium
      </h2>
      <div className='flex gap-4 mt-2 items-end justify-center w-full md:flex-row flex-col'>
        <Tier
          member={sortedMemberScores[1]?.member}
          points={sortedMemberScores[1]?.scores.slice().pop() ?? 0}
          place='Silver'
        />
        <Tier
          member={sortedMemberScores[0]?.member}
          points={sortedMemberScores[0]?.scores.slice().pop() ?? 0}
          place='Gold'
        />
        <Tier
          member={sortedMemberScores[2]?.member}
          points={sortedMemberScores[2]?.scores.slice().pop() ?? 0}
          place='Bronze'
        />
      </div>
    </div>
  );
}
