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
      'bg-linear-to-br from-amber-600 to-amber-700 h-1/2 border-amber-700/50': place === 'Bronze',
      'bg-linear-to-br from-zinc-300 to-zinc-400 h-3/4 border-zinc-400/50': place === 'Silver',
      'bg-linear-to-br from-amber-300 to-amber-500 h-full border-amber-500/50': place === 'Gold',
    }, 'rounded-lg flex flex-col items-center justify-between px-4 max-w-60 w-full border-2 shadow-xl', className)}>
      <h3 className='text-sm sm:text-base md:text-xl font-black uppercase tracking-tight text-black mt-3 text-wrap break-all'>
        {member.displayName}
      </h3>
      <p className='text-lg font-bold text-black mb-2 flex items-center gap-1'>
        <Flame className='w-6 h-6 shrink-0 stroke-black' />
        {points}
      </p>
    </div>
  );
}
