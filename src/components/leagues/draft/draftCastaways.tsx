'use client';

import Image from 'next/image';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { cn } from '~/lib/utils';
import ColorRow from '~/components/shared/colorRow';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useActionDetails';
import CastawayPopover from '~/components/seasons/shared/castawayPopover';

interface CastawayCardsProps {
  hash: string;
}

export default function DraftCastaways({ hash }: CastawayCardsProps) {
  const { actionDetails } = useLeagueActionDetails(hash);
  const isMobile = useIsMobile();

  return (
    <section className='w-full bg-card rounded-lg overflow-x-hidden'>
      <div className='flex flex-col items-center justify-around text-center'>
        <h1 className='text-2xl font-semibold'>Do Your Research!</h1>
        <p>{isMobile ? 'Tap' : 'Click'} the castaways below to learn more about them</p>
      </div>
      <article className={cn(
        'grid auto-cols-fr gap-2 p-2', {
        'grid-cols-3': actionDetails && Object.keys(actionDetails).length >= 3,
        'grid-cols-2': actionDetails && Object.keys(actionDetails).length === 2,
        'grid-cols-1': actionDetails && Object.keys(actionDetails).length === 1,
      })}>
        {Object.values(actionDetails ?? {}).map(({ tribe, castaways }) => (
          <div
            key={tribe.tribeId}
            className='flex flex-col gap-1 bg-accent rounded-lg p-2 '
            style={{ border: `5px solid ${tribe.tribeColor}` }}>
            <h2 className='text-lg font-semibold'>{tribe.tribeName}</h2>
            {castaways.map(({ castaway, member }) => (
              <CastawayPopover key={castaway.castawayId} castaway={castaway}>
                <div className='relative w-full rounded flex items-center bg-card hover:bg-card/75 gap-1 p-1'>
                  <Image
                    src={castaway.imageUrl}
                    alt={castaway.fullName}
                    width={50}
                    height={50}
                    className={cn(
                      'rounded-full',
                      (!!member || !!castaway.eliminatedEpisode) && 'grayscale')} />
                  <p>{castaway.fullName}</p>
                  {member && (
                    <ColorRow
                      className='absolute -right-1 top-1 rotate-30 text-xs leading-tight p-0 px-1 z-50'
                      color={member.color}>
                      {member.displayName}
                    </ColorRow>
                  )}
                </div>
              </CastawayPopover>
            ))}
          </div>
        ))}
      </article>
    </section >
  );
}

