'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { cn } from '~/lib/utils';
import ColorRow from '~/components/shared/colorRow';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { useLeagueDraft } from '~/hooks/leagues/useDraft';

interface CastawayCardsProps {
  hash: string;
}

export default function DraftCastaways({ hash }: CastawayCardsProps) {
  const { draftDetails } = useLeagueDraft(hash);
  const isMobile = useIsMobile();

  return (
    <section className='w-full bg-card rounded-lg overflow-x-hidden'>
      <span className='flex flex-col items-center justify-around text-center'>
        <h1 className='text-2xl font-semibold'>Do Your Research!</h1>
        <p>{isMobile ? 'Tap' : 'Click'} the castaways below to learn more about them</p>
      </span>
      <ScrollArea className='overflow-auto w-[calc(100vw-2rem)] md:w-full'>
        <article className='flex gap-4 p-4 justify-start'>
          {Object.values(draftDetails ?? {}).map(({ tribe, castaways }) => (
            <div
              key={tribe.tribeId}
              className='flex grow flex-col gap-1 bg-b2 rounded-lg p-2 min-w-56'
              style={{ border: `5px solid ${tribe.tribeColor}` }}>
              <h2 className='text-lg font-semibold'>{tribe.tribeName}</h2>
              {castaways.map(({ castaway, member }) => (
                <Popover key={castaway.fullName}>
                  <PopoverTrigger className={cn(
                    'relative flex gap-4 items-center bg-accent p-1 rounded-md text-left',
                    !!castaway.eliminatedEpisode && 'bg-red-300'
                  )}>
                    <Image
                      src={castaway.imageUrl}
                      alt={castaway.fullName}
                      width={50}
                      height={50}
                      className={cn('rounded-full',
                        (!!member || !!castaway.eliminatedEpisode) && 'grayscale')} />
                    <p>{castaway.fullName}</p>
                    {member && (
                      <ColorRow
                        className='absolute -right-1 top-1 rotate-30 text-xs leading-tight p-0 px-1 z-50'
                        color={member.color}>
                        {member.displayName}
                      </ColorRow>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className='flex flex-col w-fit gap-2 p-2 text-nowrap' side='top'>
                    <h3 className='text-lg font-semibold'>{castaway.fullName}</h3>
                    <p><b>Age:</b> {castaway.age}</p>
                    <p><b>Current Residence:</b> {castaway.residence}</p>
                    <p><b>Occupation:</b> {castaway.occupation}</p>
                    <Link
                      className='text-blue-500 hover:underline w-min'
                      href={`https://survivor.fandom.com/wiki/${castaway.fullName}`}
                      target='_blank'>
                      Learn more
                    </Link>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          ))}
        </article>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </section >
  );
}

