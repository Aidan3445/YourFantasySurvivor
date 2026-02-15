import { Skull, ShieldCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { Separator } from '~/components/common/separator';
import { PointsIcon } from '~/components/icons/generated';
import { type EnrichedCastaway } from '~/types/castaways';

interface SurvivalStreaksProps {
  survivalCap: number;
  currentStreak?: number;
  castaway?: EnrichedCastaway;
  shotInTheDarkStatus?: { episodeNumber: number, status: 'pending' | 'saved' | 'wasted' } | null;
}


export default function SurvivalStreaks({
  currentStreak,
  castaway,
  shotInTheDarkStatus,
  survivalCap
}: SurvivalStreaksProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <div className='ml-1 w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer'>
          {castaway?.eliminatedEpisode ? (
            (shotInTheDarkStatus?.status === 'saved' && shotInTheDarkStatus.episodeNumber === castaway.eliminatedEpisode
              ? (
                <ShieldCheck className='w-5 h-5 stroke-green-600 hover:stroke-green-700 transition-colors' />
              ) : (
                <Skull size={18} className='stroke-muted-foreground hover:stroke-destructive transition-colors' />
              ))
          ) : (
            Math.min(currentStreak ?? Infinity, survivalCap)
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='w-min text-nowrap p-3 border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card'
        align='end'>
        <div className='text-sm text-nowrap font-bold uppercase tracking-wider mb-2'>Survival Streak</div>
        <Separator className='mb-2 bg-primary/20' />
        <div className='text-sm space-y-1'>
          <div className='font-medium'>Current streak: {currentStreak ?? 0}</div>
          <div className='font-medium tablar-nums'>
            Point cap: {survivalCap}
            <PointsIcon className='inline w-4 h-4 stroke-muted-foreground align-text-top' />
          </div>
        </div>
        {shotInTheDarkStatus?.status === 'saved' && (
          <>
            <Separator className='my-2 bg-primary/20' />
            <div className='text-xs flex items-center gap-1'>
              <ShieldCheck className='w-3 h-3 stroke-green-600' />
              <span className='text-nowrap text-green-600 font-semibold'>
                Shot in the Dark saved their streak in episode {shotInTheDarkStatus.episodeNumber}
              </span>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

