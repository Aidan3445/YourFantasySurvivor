import {
  TableCell,
} from '~/components/common/table';

import { Circle, FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import ColorRow from '~/components/shared/colorRow';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';

interface CastawayRowProps {
  place: number;
  castaway?: EnrichedCastaway;
  points?: number;
  color?: string;
  tribeTimeline?: { episode: number; tribe: Tribe; }[];
}

export default function CastawayEntry({ place, castaway, points, color, tribeTimeline }: CastawayRowProps) {
  return (
    <>
      <TableCell className='px-1'>
        <ColorRow color={color} className='justify-center p-0'>
          {place}
        </ColorRow>
      </TableCell>
      <TableCell className='px-1'>
        <ColorRow color={color} className='justify-center p-0'>
          {points}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow
          className='justify-center gap-0'
          color={castaway?.eliminatedEpisode ? '#AAAAAA' : castaway?.tribe?.color ?? color}>
          {castaway?.fullName ?? 'Jeff Probst'}
          {castaway?.eliminatedEpisode && (
            <Popover>
              <PopoverTrigger>
                <span className='ml-1 text-muted-foreground cursor-help'>
                  <FlameKindling className='align-text-bottom inline w-4 h-4' />
                  ({castaway.eliminatedEpisode})
                </span>
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1' align='end'>
                <PopoverArrow />
                Eliminated Episode {castaway.eliminatedEpisode}
              </PopoverContent>
            </Popover>
          )}
          <div className='ml-auto flex gap-0.5'>
            {tribeTimeline?.map(({ episode, tribe }) => (
              <Popover key={`${tribe.tribeName}-${episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {episode}
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </ColorRow>
      </TableCell>
    </>
  );
}

