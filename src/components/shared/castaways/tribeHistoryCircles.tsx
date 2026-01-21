import { Circle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { type Tribe } from '~/types/tribes';

interface TribeHistoryCirclesProps {
  tribeTimeline: Array<{ episode: number; tribe: Tribe | null }>;
}

export default function TribeHistoryCircles({ tribeTimeline }: TribeHistoryCirclesProps) {
  return (
    <div className='ml-auto flex gap-0.5'>
      {tribeTimeline.map(({ episode, tribe }) => (
        tribe && (
          <Popover key={`${tribe.tribeName}-${episode}`}>
            <PopoverTrigger>
              <Circle
                size={16}
                fill={tribe.tribeColor}
                className='cursor-pointer opacity-80 hover:opacity-100 active:opacity-60 transition-all hover:scale-110 drop-shadow-sm' />
            </PopoverTrigger>
            <PopoverContent className='w-min p-2 bg-card border-primary/30' align='end'>
              <PopoverArrow />
              <div className='font-bold text-xs text-nowrap'>
                {tribe.tribeName} <span className='text-nowrap text-muted-foreground'>• Ep {episode}</span>
              </div>
            </PopoverContent>
          </Popover>
        )))}
    </div>
  );
}
