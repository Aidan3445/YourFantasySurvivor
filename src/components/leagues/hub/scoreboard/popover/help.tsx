'use client';

import ColorRow from '~/components/shared/colorRow';
import { MoveRight, Circle, History, CircleHelp, Skull, ShieldCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { Separator } from '~/components/common/separator';
import { PopoverArrow } from '@radix-ui/react-popover';


interface ScoreboardHelpProps {
  survivalCap?: boolean;
  secondaryPicks?: boolean;
  shotInTheDark?: boolean;
}

export default function ScoreboardHelp({ survivalCap, secondaryPicks, shotInTheDark }: ScoreboardHelpProps) {
  return (
    <Popover>
      <PopoverTrigger className='absolute top-3 right-3 z-50 pointer-events-auto'>
        <CircleHelp className='w-4 h-4 stroke-muted-foreground hover:stroke-primary transition-colors' />
      </PopoverTrigger>
      <PopoverContent
        className=' w-max max-w-md p-3 border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card'
        side='left'>
        <PopoverArrow className='fill-primary' />
        <div className='text-sm font-bold uppercase tracking-wider mb-2 text-center'>Scoreboard Guide</div>
        <Separator className='mb-3 bg-primary/20' />

        <div className='space-y-3 text-sm'>
          {/* Survivor Column */}
          <div>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
              Survivor Column
            </div>
            <div className='flex items-center gap-2 mb-2'>
              <span className='font-medium'>Parvati Shallow</span>
              <span className='text-muted-foreground text-xs'>Your current survivor pick</span>
            </div>
          </div>
          {secondaryPicks && (
            <div>
              <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
                Secondary Column
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Rob Cesternino</span>
                <span className='text-muted-foreground text-xs'>Your current secondary pick</span>
              </div>
              <span className='text-muted-foreground text-xs'>
                Other member&apos;s secondaries may be hidden between episodes based on league settings
              </span>
            </div>
          )}

          {/* Tribe History */}
          <div className='space-y-1'>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
              Tribe History
            </div>
            <div className='flex items-center gap-2'>
              <Circle size={16} fill='#FF90CC' className='shrink-0' />
              <span className='text-xs'>Original tribe</span>
            </div>
            <div className='flex items-center gap-2'>
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
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <History size={16} className='shrink-0 stroke-muted-foreground' />
                <span className='text-xs'>View selection history</span>
              </div>
              {survivalCap && (
                <>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 text-center text-xs font-bold'>2</div>
                    <span className='text-xs'>Survival streak points available</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skull size={16} className='shrink-0 stroke-muted-foreground' />
                    <span className='text-xs'>Survivor eliminated</span>
                  </div>
                  {shotInTheDark && (
                    <div className='flex items-center gap-2'>
                      <ShieldCheck size={16} className='shrink-0 stroke-muted-foreground' />
                      <span className='text-xs'>Shot in the Dark used successfully</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Example */}
          <div className='w-min'>
            <div className='font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1'>
              Example Selection History
            </div>
            <div className='grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs'>
              <ColorRow color='#FF90CC'>
                First Pick
              </ColorRow>
              <div className='flex gap-1 items-center text-nowrap font-medium'>
                Draft
                <MoveRight className='w-3 h-3 shrink-0' />
                Episode 4
              </div>
              <ColorRow color='#3ADA00'>
                Current Pick
              </ColorRow>
              <div className='flex gap-1 items-center text-nowrap font-medium'>
                5
                <MoveRight className='w-3 h-3 shrink-0' />
                Present
              </div>
            </div>
            {secondaryPicks && (
              <>
                <Separator className='bg-primary/20 my-1' />
                <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground text-center mb-1'>
                  Secondaries
                </div>
                <div className='grid grid-cols-[max-content_1fr] gap-x-1 gap-y-1 text-xs'>
                  <span className='grid col-span-2 grid-cols-subgrid'>
                    <ColorRow color={'#FEF340'}>
                      John Cochran
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap font-medium tabular-nums'>
                      <MoveRight className='w-3 h-3 shrink-0' />
                      1 <i className='text-nowrap ml-4'>(Secondary pick for episode 1)</i>
                    </div>
                  </span>
                  <span className='grid col-span-2 grid-cols-subgrid items-center'>
                    <ColorRow color={'#AAAAAA'}>
                      No Pick
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap font-medium tabular-nums'>
                      <MoveRight className='w-3 h-3 shrink-0' />
                      2 <i className='text-nowrap ml-4'>(No secondary pick for episode 2,
                        <br /> how could you forget!?)</i>
                    </div>
                  </span>
                  <span className='grid col-span-2 grid-cols-subgrid'>
                    <ColorRow color={'#FF90CC'}>
                      Genevieve Mushaluk
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap font-medium tabular-nums'>
                      <MoveRight className='w-3 h-3 shrink-0' />
                      3 <i className='text-nowrap ml-4'>(Secondary pick for episode 3)</i>
                    </div>
                  </span>
                </div>
              </>
            )}
          </div>

          {survivalCap && (
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
