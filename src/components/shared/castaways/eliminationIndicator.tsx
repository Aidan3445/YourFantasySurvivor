import { FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';

interface EliminationIndicatorProps {
  episode?: number | null;
  redemption?: {
    reentryEpisode: number;
    secondEliminationEpisode: number | null;
  }[];
}

export default function EliminationIndicator({ episode, redemption }: EliminationIndicatorProps) {
  if (!episode) {
    return (<div className='w-5' />);
  }

  const hasRedemption = redemption && redemption.length > 0;

  return (
    <Popover>
      <PopoverTrigger>
        <div className='w-5 h-5 flex justify-center items-center bg-destructive/20 rounded hover:bg-destructive/30 transition-colors cursor-pointer'>
          <FlameKindling className='w-3.5 h-3.5 text-destructive' />
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-min p-2 bg-card border-destructive/30' align='end'>
        <PopoverArrow />
        <div className='flex flex-col gap-1 text-xs'>
          <span className='font-bold text-destructive text-nowrap'>
            Eliminated • Ep {episode}
          </span>
          {hasRedemption && redemption.map((r, i) => (
            <div key={i} className='flex flex-col gap-1 border-t border-border pt-1'>
              <span className='font-bold text-positive text-nowrap'>
                Re-entered • Ep {r.reentryEpisode}
              </span>
              {r.secondEliminationEpisode && (
                <span className='font-bold text-destructive text-nowrap'>
                  Eliminated • Ep {r.secondEliminationEpisode}
                </span>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
