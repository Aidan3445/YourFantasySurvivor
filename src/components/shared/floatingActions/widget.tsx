'use client';

import { useState } from 'react';
import { Trophy, ListPlus, Users } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import JoinLeagueModal from '~/components/home/quickActions/joinDialogue';
import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';

export function FloatingActionsWidget() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className='fixed bottom-6 right-6 z-50'
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}>
      <div className='relative'>

        {/* Expanded action buttons */}
        <div
          className={cn(
            'absolute transition-all duration-300 ease-out left-1/2 -translate-x-1/2',
            isExpanded
              ? 'opacity-100 pointer-events-auto -top-12 -translate-x-10'
              : 'opacity-0 pointer-events-none top-0'
          )}>
          {/* Create League Button */}
          <CreateLeagueModal>
            <button className='w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center hover:bg-accent hover:scale-110 transition-all shadow-lg'>
              <ListPlus className='w-6 h-6 stroke-primary' />
            </button>
          </CreateLeagueModal>
        </div>

        <div
          className={cn(
            'absolute transition-all duration-300 ease-out top-1/2 -translate-y-1/2',
            isExpanded
              ? 'opacity-100 pointer-events-auto -left-12 -translate-y-10'
              : 'opacity-0 pointer-events-none left-0'
          )}>
          {/* Join League Button */}
          <JoinLeagueModal>
            <Button className='w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center hover:bg-accent hover:scale-110 transition-all shadow-lg'>
              <Users className='w-6 h-6 stroke-primary' />
            </Button>
          </JoinLeagueModal>
        </div>


        {/* Main toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-14 h-14 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-xl transition-all hover:scale-110',
            isExpanded && 'rotate-360 scale-110'
          )}>
          <Trophy className='w-7 h-7 stroke-primary' />
        </button>
      </div>
    </div>
  );
}
