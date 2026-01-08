import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { type EnrichedCastaway } from '~/types/castaways';
import { type ReactNode } from 'react';

interface CastawayPopoverProps {
  castaway?: EnrichedCastaway;
  children: ReactNode;
}

export default function CastawayPopover({ castaway, children }: CastawayPopoverProps) {
  if (!castaway) {
    return <>{children}</>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild className='select-none'>
        {children}
      </PopoverTrigger>
      <PopoverContent className='flex flex-col w-fit gap-2 p-2 text-nowrap' side='top'>
        <h3 className='text-lg font-semibold'>{castaway.fullName}</h3>
        <p><b>Age:</b> {castaway.age}</p>
        <p><b>Current Residence:</b> {castaway.residence}</p>
        <p><b>Occupation:</b> {castaway.occupation}</p>
        {castaway.previouslyOn && castaway.previouslyOn.length > 0 && (
          <p className='text-pretty max-w-xs'>
            <b>Previously On:</b> {castaway.previouslyOn.join(', ')}
          </p>
        )}
        <Link
          className='text-blue-500 hover:underline w-min text-nowrap'
          href={`https://survivor.fandom.com/wiki/${castaway.fullName}`}
          target='_blank'>
          Learn more
        </Link>
      </PopoverContent>
    </Popover>
  );
}
