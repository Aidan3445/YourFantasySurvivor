import {
  TableCell,
} from '~/components/common/table';

import { Circle, FlameKindling } from 'lucide-react';
import { type CastawayDetails } from '~/types/castaways';
import { ColorRow } from '~/components/leagues/predraft/draftOrder';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';

interface CastawayRowProps {
  place: number;
  castaway?: CastawayDetails;
  points: number;
  color: string;
}

export function CastawayEntry({ place, castaway, points, color }: CastawayRowProps) {
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
          color={castaway?.eliminatedEpisode ? '#AAAAAA' : castaway?.startingTribe.tribeColor ?? color}>
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
            {castaway && castaway.tribes.length > 1 && castaway.tribes.map((tribe) => (
              <Popover key={`${tribe.tribeName}-${tribe.episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {tribe.episode}
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </ColorRow>
      </TableCell>
    </>
  );
}

