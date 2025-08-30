'use client';

import ColorRow from '~/components/common/colorRow';
import { MoveRight, Circle, Flame, History, CircleHelp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useIsMobile } from '~/hooks/useMobile';
import { Separator } from '~/components/common/separator';


interface ScoreboardHelpProps {
  hasSurvivalCap?: boolean;
}

export default function ScoreboardHelp({ hasSurvivalCap }: ScoreboardHelpProps) {
  const isMobile = useIsMobile();
  return (
    <Popover>
      <PopoverTrigger className='absolute top-3 right-3 z-50 pointer-events-auto'>
        <CircleHelp className='w-4 h-4 stroke-muted-foreground' />
      </PopoverTrigger>
      <PopoverContent className='w-min text-nowrap p-0 border-none text-sm' side='left'>
        <ColorRow className='justify-center pr-0' color='#FF90CC'>
          {isMobile ? 'Castaway' : 'Current Survivor'}
          <div className='ml-auto flex gap-0.5'>
            <Popover open>
              <PopoverTrigger>
                <Circle size={16} fill='#FF90CC' />
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1 animate-scale-in-fast' side='top' align='end' alignOffset={-10}>
                <PopoverArrow />
                Current Survivor Tribe History
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger>
                <Circle size={16} fill='#3ADA00' />
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1 animate-scale-in-fast' align='end'>
                <PopoverArrow />
                Tribe Swap - Episode 4
              </PopoverContent>
            </Popover>
            <Popover open={isMobile ? undefined : true}>
              <PopoverTrigger>
                <Circle size={16} fill='#FEF340' />
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1 animate-scale-in-fast' side='top' align='start'>
                <PopoverArrow />
                Merge Tribe - Episode 8
              </PopoverContent>
            </Popover>
            <Popover open>
              <PopoverTrigger className='ml-2'>
                <History size={16} />
              </PopoverTrigger>
              <PopoverContent
                className='p-1 space-y-1 pt-0 grid grid-cols-[max-content_1fr] gap-x-2 w-full animate-scale-in-fast'
                align='end'
                side='bottom'>
                <PopoverArrow />
                <div className='text-center'>Selection History</div>
                <div className='text-center'>Timeline</div>
                <Separator className='col-span-2' />
                <span className='grid col-span-2 grid-cols-subgrid'>
                  <ColorRow
                    className='px-1 justify-center'
                    color='#3ADA00'>
                    First Castaway
                  </ColorRow>
                  <div className='flex gap-1 items-center text-nowrap'>
                    Draft
                    <MoveRight className='w-4 h-4' />
                    Eliminated Episode
                  </div>
                </span>
                <span className='grid col-span-2 grid-cols-subgrid'>
                  <ColorRow
                    className='px-1 justify-center'
                    color='#FF90CC'>
                    Current Survivor
                  </ColorRow>
                  <div className='flex gap-1 items-center text-nowrap'>
                    5
                    <MoveRight className='w-4 h-4' />
                    Present
                  </div>
                </span>
              </PopoverContent>
            </Popover>
            {hasSurvivalCap && (
              <Popover open={isMobile ? undefined : true}>
                <PopoverTrigger>
                  <div className='mx-1 flex justify-center'>
                    2
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1 animate-scale-in-fast' align='start' side='bottom'>
                  <PopoverArrow />
                  Survival streak points available
                  <br />
                  <br />
                  Current streak: 2
                  <Separator className='my-1' />
                  Point cap from league settings: 5
                  <Flame className='align-baseline inline w-4 h-4' />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </ColorRow>
      </PopoverContent>
    </Popover>
  );
}
