import { FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';

interface EliminationIndicatorProps {
  episode?: number | null;
}

export default function EliminationIndicator({ episode }: EliminationIndicatorProps) {
  if (!episode) {
    return (<div className='w-5' />);
  }

  return (
    <Popover>
      <PopoverTrigger>
        <div className='w-5 h-5 flex justify-center items-center bg-destructive/20 rounded hover:bg-destructive/30 transition-colors cursor-pointer'>
          <FlameKindling className='w-3.5 h-3.5 text-destructive' />
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-min p-2 bg-card border-destructive/30' align='end'>
        <PopoverArrow />
        <div className='font-bold text-xs text-destructive text-nowrap'>
          Eliminated • Ep {episode}
        </div>
      </PopoverContent>
    </Popover>
  );
}
