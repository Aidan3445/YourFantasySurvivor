'use client';
import { Flame } from 'lucide-react';
import { cn } from '~/lib/utils';
import { type LeagueMember } from '~/types/leagueMembers';

interface TierProps {
  member?: LeagueMember;
  points?: number;
  place: 'Gold' | 'Silver' | 'Bronze';
  position: 'left' | 'center' | 'right';
  className?: string;
}

export default function Tier({ member, points, place, className }: TierProps) {
  if (!member || !points) return null;


  const hasNoSpaces = !member.displayName.includes(' ');

  return (
    <div className='flex flex-col gap-1 items-center justify-end max-w-80 w-full h-[90%]'>
      {/* Absolutely positioned name that can overflow */}
      <h3 className={cn(
        'h-fit bg-secondary/80 rounded bottom-full text-pretty z-10 px-2 shadow-md',
        'text-sm sm:text-base md:text-xl font-black uppercase tracking-tight text-pretty',
        hasNoSpaces && 'break-all'
      )}>
        {member.displayName}
      </h3>

      <div className={cn(
        'rounded-lg flex items-end justify-center border-2 shadow-xl w-3/4',
        {
          'bg-linear-to-br from-amber-600 to-amber-700 h-1/3 border-amber-700/50 shadow-amber-700/50': place === 'Bronze',
          'bg-linear-to-br from-zinc-300 to-zinc-400 h-3/5 border-zinc-400/50 shadow-zinc-400/50': place === 'Silver',
          'bg-linear-to-br from-amber-300 to-amber-500 h-full border-amber-500/50 shadow-amber-500/50': place === 'Gold',
        },
        className
      )}>
        <p className='text-lg font-bold text-black flex items-center gap-1 pb-4'>
          <Flame className='w-6 h-6 shrink-0 stroke-black' />
          {points}
        </p>
      </div>
    </div>
  );
}
