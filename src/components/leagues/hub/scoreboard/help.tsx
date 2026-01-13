'use client';

import ColorRow from '~/components/shared/colorRow';
import { MoveRight, Circle, History, CircleHelp, Skull } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { Separator } from '~/components/common/separator';


interface ScoreboardHelpProps {
  hasSurvivalCap?: boolean;
}

export default function ScoreboardHelp({ hasSurvivalCap }: ScoreboardHelpProps) {
  return (
    <Popover>
      <PopoverTrigger className='absolute top-3 right-3 z-50 pointer-events-auto'>
        <CircleHelp className='w-4 h-4 stroke-muted-foreground hover:stroke-primary transition-colors' />
      </PopoverTrigger>
      <PopoverContent className='w-max max-w-md p-3 border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card' side='left'>
        <div className='text-sm font-bold uppercase tracking-wider mb-2 text-center'>Scoreboard Guide</div>
        <Separator className='mb-3 bg-primary/20' />

        <div className='space-y-3 text-sm'>
          {/* Survivor Column */}
          <div>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
              Survivor Column
            </div>
            <div className='flex items-center gap-2 mb-2'>
              <span className='font-medium'>John Smith</span>
              <span className='text-muted-foreground text-xs'>Your current survivor pick</span>
            </div>
          </div>

          {/* Tribe History */}
          <div>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
              Tribe History
            </div>
            <div className='flex items-center gap-2 mb-1'>
              <Circle size={16} fill='#FF90CC' className='shrink-0' />
              <span className='text-xs'>Original tribe</span>
            </div>
            <div className='flex items-center gap-2 mb-1'>
              <Circle size={16} fill='#3ADA00' className='shrink-0' />
              <span className='text-xs'>After tribe swap</span>
            </div>
            <div className='flex items-center gap-2'>
              <Circle size={16} fill='#FEF340' className='shrink-0' />
              <span className='text-xs'>Merge tribe</span>
            </div>
          </div>

          {/* Icons */}
          <div>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
              Icons
            </div>
            <div className='flex items-center gap-2 mb-1'>
              <History size={16} className='shrink-0 stroke-muted-foreground' />
              <span className='text-xs'>View selection history</span>
            </div>
            {hasSurvivalCap && (
              <>
                <div className='flex items-center gap-2 mb-1'>
                  <div className='w-4 text-center text-xs font-bold'>2</div>
                  <span className='text-xs'>Survival streak points available</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Skull size={16} className='shrink-0 stroke-muted-foreground' />
                  <span className='text-xs'>Survivor eliminated</span>
                </div>
              </>
            )}
          </div>

          {/* Example */}
          <div>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
              Example Timeline
            </div>
            <div className='grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs'>
              <ColorRow
                className='px-2 justify-center font-medium text-xs'
                color='#3ADA00'>
                First Pick
              </ColorRow>
              <div className='flex gap-1 items-center text-nowrap font-medium'>
                Draft
                <MoveRight className='w-3 h-3 shrink-0' />
                Episode 4
              </div>
              <ColorRow
                className='px-2 justify-center font-medium text-xs'
                color='#FF90CC'>
                Current Pick
              </ColorRow>
              <div className='flex gap-1 items-center text-nowrap font-medium'>
                5
                <MoveRight className='w-3 h-3 shrink-0' />
                Present
              </div>
            </div>
          </div>

          {hasSurvivalCap && (
            <div>
              <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
                Survival Cap
              </div>
              <div className='text-xs'>
                Points earned per episode are capped based on your league settings.
                The number shows how many streak points you can still earn.
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
