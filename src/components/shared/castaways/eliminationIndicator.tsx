import { FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';

interface EliminationIndicatorProps {
  episode: number;
}

export default function EliminationIndicator({ episode }: EliminationIndicatorProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <div className='text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-help text-nowrap flex items-center gap-1'>
          <FlameKindling className='w-4 h-4 shrink-0' />
          <span>EP {episode}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-min text-nowrap p-2 border-2 border-primary/20 shadow-lg shadow-primary/20' align='end'>
        <PopoverArrow className='fill-border' />
        <span className='font-medium'>Eliminated Episode {episode}</span>
      </PopoverContent>
    </Popover>
  );
}
