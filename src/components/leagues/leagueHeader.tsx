'use client';

import Link from 'next/link';
import { useLeague } from '~/hooks/useLeague';
import { Skeleton } from '../common/skeleton';

export default function LeagueHeader() {
  const {
    league: {
      leagueName,
      season
    }
  } = useLeague();

  return (
    <span className='sticky md:static top-0 z-50 flex gap-4 w-full px-8 py-1 md:py-0 items-baseline bg-b3 md:bg-transparent'>
      {!leagueName ? (
        <Skeleton className='h-8 w-full rounded-md' />
      ) : (<span className='flex gap-2 items-baseline'>
        <h1 className='text-2xl font-bold'>{leagueName}</h1>
        <Link href={`https://survivor.fandom.com/wiki/${season}`} target='_blank'>
          <h3 className='text-lg italic font-medium text-muted-foreground hover:underline'>
            {season}
          </h3>
        </Link>
      </span>)}
    </span>
  );
}
