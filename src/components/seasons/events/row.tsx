'use client';

import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import { type EventWithReferences } from '~/types/events';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';

interface EventRowProps {
  event: EventWithReferences;
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
}

export default function EventRow({ event, castaways, tribes }: EventRowProps) {
  // Get referenced castaways and tribes
  const referencedCastaways = event.references
    .filter(ref => ref.type === 'Castaway')
    .map(ref => castaways.find(c => c.castawayId === ref.id))
    .filter(Boolean) as EnrichedCastaway[];

  const referencedTribes = event.references
    .filter(ref => ref.type === 'Tribe')
    .map(ref => tribes.find(t => t.tribeId === ref.id))
    .filter(Boolean) as Tribe[];

  return (
    <TableRow>
      <TableCell className='text-center'>{event.episodeNumber}</TableCell>
      <TableCell>{event.label ?? event.eventName}</TableCell>

      <TableCell>
        <div className='flex flex-wrap gap-1'>
          {referencedTribes.map(tribe => (
            <ColorRow
              key={tribe.tribeId}
              className='text-xs px-2 py-0.5'
              color={tribe.tribeColor}>
              {tribe.tribeName}
            </ColorRow>
          ))}
        </div>
      </TableCell>

      <TableCell>
        <div className='flex flex-wrap gap-1'>
          {referencedCastaways.map(castaway => (
            <ColorRow
              key={castaway.castawayId}
              className='text-xs px-2 py-0.5'
              color={castaway.tribe?.color ?? '#AAAAAA'}>
              {castaway.fullName}
            </ColorRow>
          ))}
        </div>
      </TableCell>

      <TableCell className='text-sm text-muted-foreground'>
        {event.notes?.join(', ')}
      </TableCell>
    </TableRow>
  );
}
