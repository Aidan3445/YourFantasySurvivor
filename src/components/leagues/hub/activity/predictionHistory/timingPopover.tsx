
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { type PredictionTiming } from '~/types/events';

interface TimingPopoverProps {
  timing: PredictionTiming[];
}

export default function TimingPopover({ timing }: TimingPopoverProps) {
  return (
    <Popover modal hover>
      <PopoverTrigger className='bg-primary/30 rounded-md hover:bg-primary/40 transition-colors w-5 h-5 flex items-center justify-center'>
        <Clock className='stroke-primary w-4 h-4' />
      </PopoverTrigger>
      <PopoverContent className='w-min mx-1 border-2 border-primary/30 bg-card shadow-lg shadow-primary/20'>
        <PopoverArrow />
        <span className='text-xs font-medium text-nowrap'>
          {timing.join(', ')}
        </span>
      </PopoverContent>
    </Popover>
  );
}

