'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { useDraft } from '~/hooks/useDraft';
import { cn } from '~/lib/utils';
import { type CastawayDraftInfo } from '~/server/db/defs/castaways';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { type TribeName } from '~/server/db/defs/tribes';

interface CastawayCardsProps {
  leagueHash: LeagueHash;
}

export default function DraftCastaways({ leagueHash }: CastawayCardsProps) {
  const { draft } = useDraft(leagueHash);

  const castaways = draft?.castaways ?? [];


  const castawaysByTribe = castaways?.reduce((acc, castaway) => {
    acc[castaway.tribe.tribeName] ??= [];
    acc[castaway.tribe.tribeName]!.push(castaway);
    return acc;
  }, {} as Record<TribeName, CastawayDraftInfo[]>);


  return (
    <section className='w-full col-span-2 bg-secondary rounded-3xl border overflow-x-hidden'>
      <span className='flex flex-col items-center justify-around text-center'>
        <h1 className='text-2xl font-semibold'>Castaways</h1>
        <span className='flex'>
          <p className='max-md:hidden mr-1'>Click</p>
          <p className='md:hidden mr-1'>Tap</p>
          <p>the castaways below to learn more about them!</p>
        </span>
      </span>
      <ScrollArea>
        <article className='flex gap-4 p-4 justify-evenly'>
          {Object.entries(castawaysByTribe ?? {}).map(([tribeName, castaways]) => (
            <div
              key={tribeName}
              className='flex flex-grow flex-col gap-1 bg-card rounded-lg p-2 min-w-56'
              style={{ border: `5px solid ${castaways[0]?.tribe.tribeColor}` }}>
              <h2 className='text-lg font-semibold'>{tribeName}</h2>
              {castaways.map((castaway) => (
                <Popover key={castaway.fullName}>
                  <PopoverTrigger className='flex gap-4 items-center bg-accent p-1 rounded-md text-left'>
                    <Image
                      src={castaway.imageUrl}
                      alt={castaway.fullName}
                      width={50}
                      height={50}
                      className={cn('rounded-full', !!castaway.pickedBy && 'grayscale')}
                    />
                    <p>{castaway.fullName}</p>
                  </PopoverTrigger>
                  <PopoverContent className='flex flex-col w-fit gap-2 p-2 text-nowrap' side='top'>
                    <span className='flex gap-4 justify-between items-baseline'>
                      <h3 className='text-lg font-semibold'>{castaway.fullName}</h3>
                      <i>{castaway.pickedBy ? `Picked by ${castaway.pickedBy}` : 'Available'}</i>
                    </span>
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

