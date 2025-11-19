
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
      <PopoverTrigger>
        <Clock size={12} className='inline-block' />
      </PopoverTrigger>
      <PopoverContent className='w-80 md:w-full'>
        <PopoverArrow />
        <span className='text-xs italic'>
          {timing.join(', ')}
        </span>
      </PopoverContent>
    </Popover>
  );
}

