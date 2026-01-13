import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { type EnrichedCastaway } from '~/types/castaways';
import { type ReactNode } from 'react';
import { PopoverArrow } from '@radix-ui/react-popover';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

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
      <PopoverContent className='flex flex-col w-fit gap-3 p-3 text-nowrap border-2 border-primary/20 shadow-lg shadow-primary/20' side='top'>
        <PopoverArrow className='fill-border' />
        <div className='flex justify-between gap-3 items-start'>
          <div>
            <h3 className='text-lg font-black uppercase tracking-tight'>{castaway.fullName}</h3>
            <p className='text-sm'><span className='font-bold text-muted-foreground'>Age:</span> {castaway.age}</p>
          </div>
          <Image
            src={castaway.imageUrl}
            preload
            alt={castaway.fullName}
            width={80}
            height={80}
            className='rounded-md border-2 border-primary/20' />
        </div>

        <div className='space-y-1 text-sm'>
          <p><span className='font-bold text-muted-foreground'>Residence:</span> {castaway.residence}</p>
          <p><span className='font-bold text-muted-foreground'>Occupation:</span> {castaway.occupation}</p>
          {castaway.previouslyOn && castaway.previouslyOn.length > 0 && (
            <p className='text-pretty max-w-xs'>
              <span className='font-bold text-muted-foreground'>Previously On:</span> {castaway.previouslyOn.join(', ')}
            </p>
          )}
        </div>

        <Link
          className='flex items-center gap-1 text-primary hover:text-primary/80 font-bold uppercase text-xs tracking-wider w-fit transition-colors'
          href={`https://survivor.fandom.com/wiki/${castaway.fullName}`}
          target='_blank'>
          Learn more
          <ExternalLink className='w-3 h-3 shrink-0' />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
