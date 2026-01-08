import {
  TableCell,
} from '~/components/common/table';

import { Circle, FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import ColorRow from '~/components/shared/colorRow';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import CastawayPopover from '~/components/seasons/shared/castawayPopover';
import { getContrastingColor } from '@uiw/color-convert';

interface CastawayRowProps {
  place: number;
  castaway?: EnrichedCastaway;
  points?: number;
  color?: string;
  tribeTimeline?: { episode: number; tribe: Tribe; }[];
  allZero?: boolean;
}

export default function CastawayEntry({ place, castaway, points, color, tribeTimeline, allZero }: CastawayRowProps) {
  return (
    <>
      {!allZero && (
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
        </>
      )}
      <TableCell className='text-nowrap px-1 w-1/2'>
        <ColorRow
          className='justify-center gap-0 px-1'
          color={castaway?.eliminatedEpisode ? '#AAAAAA' : castaway?.tribe?.color ?? '#FFFFFF'}>
          <CastawayPopover castaway={castaway}>
            <span
              className='text-nowrap'
              style={{
                color: getContrastingColor(castaway?.tribe?.color ?? '#AAAAAA')
              }}>
              {castaway?.fullName}
            </span>
          </CastawayPopover>
          {castaway?.eliminatedEpisode && (
            <Popover>
              <PopoverTrigger>
                <span className='mx-1 text-xs text-muted-foreground cursor-help text-nowrap'>
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
            {tribeTimeline && (tribeTimeline.length > 1 || castaway?.eliminatedEpisode) && tribeTimeline.map(({ episode, tribe }) => (
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

