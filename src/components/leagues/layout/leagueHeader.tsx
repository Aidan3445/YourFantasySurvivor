'use client';

import Link from 'next/link';
import { Skeleton } from '~/components/common/skeleton';
import { useLeague } from '~/hooks/leagues/useLeague';

export default function LeagueHeader() {
  const { data: league } = useLeague();

  return (
    <span className='sticky md:static top-0 z-50 flex gap-4 w-full px-8 py-1 md:py-0 items-baseline bg-b3 md:bg-transparent'>
      {!league?.name ? (
        <Skeleton className='h-8 w-full rounded-md' />
      ) : (<span className='flex gap-2 items-baseline'>
        <h1 className='text-2xl font-bold'>{league.name}</h1>
        <Link href={`https://survivor.fandom.com/wiki/${league.season}`} target='_blank'>
          <h3 className='text-lg italic font-medium text-muted-foreground hover:underline'>
            {league.season}
          </h3>
        </Link>
      </span>)}
    </span>
  );
}
