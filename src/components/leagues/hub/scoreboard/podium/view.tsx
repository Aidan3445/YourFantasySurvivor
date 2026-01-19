'use client';

import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { cn } from '~/lib/utils';
import Tier from '~/components/leagues/hub/scoreboard/podium/tier';

interface PodiumProps {
  overrideHash?: string;
  className?: string;
}

export default function Podium({ overrideHash, className }: PodiumProps) {
  const { sortedMemberScores } = useLeagueData(overrideHash);

  // Handle ties:
  // 1st and 2nd place tie -> both gold, no silver, next is bronze
  // 2nd and 3rd place tie -> both silver, no bronze
  // 1st, 2nd, and 3rd place tie -> all gold, no silver or bronze
  const firstPlaceScore = sortedMemberScores[0]?.scores.slice().pop() ?? 0;
  const secondPlaceScore = sortedMemberScores[1]?.scores.slice().pop() ?? 0;
  const thirdPlaceScore = sortedMemberScores[2]?.scores.slice().pop() ?? 0;

  const tieBetweenFirstAndSecond = secondPlaceScore === firstPlaceScore;
  const tieBetweenSecondAndThird = thirdPlaceScore === secondPlaceScore;

  return (
    <div className={cn(
      'w-full h-full text-center bg-card rounded-lg flex flex-col place-items-center px-1',
      className
    )}>
      <div className='flex items-end justify-center w-full h-full grow'>
        <Tier
          member={sortedMemberScores[1]?.member}
          points={sortedMemberScores[1]?.scores.slice().pop() ?? 0}
          place={tieBetweenFirstAndSecond ? 'Gold' : 'Silver'}
          position='left'
          className='shimmer-1' />
        <Tier
          member={sortedMemberScores[0]?.member}
          points={sortedMemberScores[0]?.scores.slice().pop() ?? 0}
          place='Gold'
          position='center'
          className='shimmer-2' />
        <Tier
          member={sortedMemberScores[2]?.member}
          points={sortedMemberScores[2]?.scores.slice().pop() ?? 0}
          place={tieBetweenSecondAndThird
            ? (tieBetweenFirstAndSecond ? 'Gold' : 'Silver')
            : 'Bronze'}
          position='right'
          className='shimmer-3' />
      </div>
    </div>
  );
}
