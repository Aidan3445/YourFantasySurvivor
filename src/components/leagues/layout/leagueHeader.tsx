'use client';

import Link from 'next/link';
import { Skeleton } from '~/components/common/skeleton';
import { useLeague } from '~/hooks/leagues/useLeague';
import Marquee from 'react-fast-marquee';
import { useEffect, useRef, useState } from 'react';
import { useHorizontalResize } from '~/hooks/ui/useHorizontalResize';

export default function LeagueHeader() {
  const { data: league } = useLeague();
  const measureRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useHorizontalResize(containerRef, () => {
    if (!measureRef.current || !containerRef.current) return;

    setNeedsMarquee(
      measureRef.current.scrollWidth > containerRef.current.clientWidth
    );
  });
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [animating, setAnimating] = useState(true);

  // Detect overflow
  useEffect(() => {
    if (!measureRef.current) return;

    const el = measureRef.current;
    setNeedsMarquee(el.scrollWidth > el.clientWidth);
  }, [league?.name]);

  // Pause between cycles
  useEffect(() => {
    if (!animating) {
      const timeout = setTimeout(() => setAnimating(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [animating]);

  return (
    <div
      className='relative flex flex-col w-full h-14 bg-card items-center justify-around overflow-hidden'
      ref={containerRef}>
      {!league?.name ? (
        <>
          <Skeleton className='h-6 w-40 rounded-md' />
          <Skeleton className='h-5 w-60 rounded-md' />
        </>
      ) : (
        <>
          <h1
            ref={measureRef}
            className='absolute invisible whitespace-nowrap text-2xl font-bold w-full'>
            {league.name}
          </h1>

          {needsMarquee ? (
            <Marquee
              className=''
              pauseOnHover
              speed={200}
              play={needsMarquee && animating}
              gradient={false}
              onCycleComplete={() => setAnimating(false)}>
              <h1 className='text-2xl font-bold leading-tight whitespace-nowrap ml-4'>
                {league.name}
              </h1>
            </Marquee>
          ) : (
            <h1 className='text-2xl font-bold leading-tight whitespace-nowrap'>
              {league.name}
            </h1>
          )}

          <Link href={`https://survivor.fandom.com/wiki/${league.season}`} target='_blank'>
            <h3 className='text-nowrap leading-none text-lg italic font-medium text-muted-foreground hover:underline'>
              {league.season}
            </h3>
          </Link>
        </>
      )}
    </div>
  );
}
