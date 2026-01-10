'use client';

import Link from 'next/link';
import { Skeleton } from '~/components/common/skeleton';
import { useLeague } from '~/hooks/leagues/useLeague';

export default function LeagueHeader() {
  const { data: league } = useLeague();

  return (
    <div className='flex flex-col w-full h-14 bg-card px-2 items-center justify-around'>
      {!league?.name ? (
        <>
          <Skeleton className='h-6 w-40 rounded-md' />
          <Skeleton className='h-5 w-60 rounded-md' />
        </>
      ) : (
        <>
          <h1 className='text-2xl font-bold leading-tight truncate max-w-full'>
            {league.name}
          </h1>
          <Link href={`https://survivor.fandom.com/wiki/${league.season}`} target='_blank'>
            <h3 className='text-nowrap leading-none text-lg italic font-medium text-muted-foreground hover:underline'>
              {league.season}
            </h3>
          </Link>
        </>
      )}
    </div >
  );
}
