import { Circle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { type Tribe } from '~/types/tribes';

interface TribeHistoryCirclesProps {
  tribeTimeline: Array<{ episode: number; tribe: Tribe | null }>;
  showAll?: boolean;
}

export default function TribeHistoryCircles({ tribeTimeline, showAll }: TribeHistoryCirclesProps) {
  const shouldShow = showAll || tribeTimeline.length > 1;

  if (!shouldShow) return null;

  return (
    <div className='ml-auto flex gap-0.5'>
      {tribeTimeline.map(({ episode, tribe }) => (
        tribe && (
          <Popover key={`${tribe.tribeName}-${episode}`}>
            <PopoverTrigger>
              <Circle size={16} fill={tribe.tribeColor} className='cursor-help shrink-0' />
            </PopoverTrigger>
            <PopoverContent className='w-min text-nowrap p-2 border-2 border-primary/20 shadow-lg shadow-primary/20' align='end'>
              <PopoverArrow className='fill-border' />
              <span className='font-medium'>{tribe.tribeName} - Episode {episode}</span>
            </PopoverContent>
          </Popover>
        )
      ))}
    </div>
  );
}
