'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { useDraft } from '~/hooks/useDraft';
import { useIsMobile } from '~/hooks/useMobile';
import { cn } from '~/lib/utils';
import { type CastawayDraftInfo } from '~/server/db/defs/castaways';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { type TribeName } from '~/server/db/defs/tribes';
import { ColorRow } from '~/components/leagues/draftOrder';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';

interface CastawayCardsProps {
  leagueHash: LeagueHash;
}

export default function DraftCastaways({ leagueHash }: CastawayCardsProps) {
  const { draft } = useDraft(leagueHash);
  const isMobile = useIsMobile();

  const castaways = draft?.castaways ?? [];


  const castawaysByTribe = castaways?.reduce((acc, castaway) => {
    acc[castaway.tribe.tribeName] ??= [];
    acc[castaway.tribe.tribeName]!.push(castaway);
    return acc;
  }, {} as Record<TribeName, CastawayDraftInfo[]>);

  return (
    <section className='w-full bg-card rounded-lg overflow-x-hidden'>
      <span className='flex flex-col items-center justify-around text-center'>
        <h1 className='text-2xl font-semibold'>Do Your Research!</h1>
        <p>{isMobile ? 'Tap' : 'Click'} the castaways below to learn more about them</p>
      </span>
      <ScrollArea className='overflow-auto w-[calc(100vw-2rem)] md:w-full'>
        <article className='flex gap-4 p-4 justify-start'>
          {Object.entries(castawaysByTribe ?? {}).map(([tribeName, castaways]) => (
            <div
              key={tribeName}
              className='flex grow flex-col gap-1 bg-b2 rounded-lg p-2 min-w-56'
              style={{ border: `5px solid ${castaways[0]?.tribe.tribeColor}` }}>
              <h2 className='text-lg font-semibold'>{tribeName}</h2>
              {castaways.map((castaway) => (
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
                        (!!castaway.pickedBy || !!castaway.eliminatedEpisode) && 'grayscale')} />
                    <p>{castaway.fullName}</p>
                    {castaway.pickedBy && (
                      <ColorRow
                        className='absolute -right-1 top-1 rotate-30 text-xs leading-tight p-0 px-1 z-50'
                        color={draft?.picks.find(pick => pick.displayName === castaway.pickedBy)?.color}>
                        {castaway.pickedBy}
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

