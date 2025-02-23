'use client';

import Link from 'next/link';
import { useLeague } from '~/hooks/useLeague';
import { Skeleton } from '../ui/skeleton';

export default function LeagueHeader() {
  const {
    league: {
      leagueName,
      season
    }
  } = useLeague();

  return (
    <span className='flex gap-4 w-full px-8 mt-1 items-baseline'>
      {!leagueName ? (
        <Skeleton className='h-8 w-full rounded-md' />
      ) : (<span className='flex gap-8 items-baseline'>
        <h1 className='text-2xl font-bold'>{leagueName}</h1>
        <Link href={`https://survivor.fandom.com/wiki/${season}`} target='_blank'>
          <h3 className='hidden sm:inline text-lg font-semibold text-secondary-foreground hover:underline'>
            {season}
          </h3>
        </Link>
      </span>)}
    </span>
  );
}
