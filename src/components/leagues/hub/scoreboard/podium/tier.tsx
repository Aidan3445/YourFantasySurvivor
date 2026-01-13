'use client';

import { Flame } from 'lucide-react';
import { cn } from '~/lib/utils';
import { type LeagueMember } from '~/types/leagueMembers';

interface TierProps {
  member?: LeagueMember;
  points?: number;
  place: 'Gold' | 'Silver' | 'Bronze';
  className?: string;
}

export default function Tier({ member, points, place, className }: TierProps) {
  if (!member || !points) return null;
  return (
    <div className={cn({
      'bg-linear-to-br from-amber-600 to-amber-700 h-1/2': place === 'Bronze',
      'bg-linear-to-br from-zinc-300 to-zinc-400 h-3/4': place === 'Silver',
      'bg-linear-to-br from-amber-300 to-amber-500 h-full': place === 'Gold',
    }, 'rounded-lg flex flex-col items-center justify-between px-4 max-w-48 w-full', className)}>
      <h3 className='text-sm sm:text-base md:text-xl font-bold text-black mt-2 text-wrap break-all'>
        {member.displayName}
      </h3>
      <p className='text-md font-medium text-black'>
        <Flame className='align-text-bottom inline w-6 h-6 stroke-black' />
        {points}
      </p>
    </div>
  );
}
