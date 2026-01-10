'use client';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Skeleton } from '~/components/common/skeleton';
import { useLeague } from '~/hooks/leagues/useLeague';
import Marquee from 'react-fast-marquee';

export default function LeagueHeader() {
  const { data: league } = useLeague();
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setNeedsMarquee(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [league?.name]);

  const title = (
    <h1 ref={textRef} className='text-2xl font-bold leading-tight whitespace-nowrap'>
      {league?.name}
    </h1>
  );

  return (
    <div className='flex flex-col w-full h-14 bg-card px-2 items-center justify-around'>
      {!league?.name ? (
        <>
          <Skeleton className='h-6 w-40 rounded-md' />
          <Skeleton className='h-5 w-60 rounded-md' />
        </>
      ) : (
        <>
          <div ref={containerRef} className='max-w-full overflow-hidden'>
            {needsMarquee ? (
              <Marquee pauseOnHover gradient={false} speed={30}>
                <span className='pr-8'>{title}</span>
              </Marquee>
            ) : (
              title
            )}
          </div>
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
