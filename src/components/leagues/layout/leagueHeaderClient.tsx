'use client';

import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import { useEffect, useRef, useState } from 'react';
import { useHorizontalResize } from '~/hooks/ui/useHorizontalResize';
import { type LeagueStatus } from '~/types/leagues';

interface LeagueHeaderClientProps {
  name: string;
  season: string;
  status: LeagueStatus;
  mode?: {
    isProtected?: boolean;
    isPending?: boolean;
  };
}

export default function LeagueHeaderClient({ name, season, status, mode }: LeagueHeaderClientProps) {
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
  }, [name]);

  // Pause between cycles
  useEffect(() => {
    if (!animating) {
      const timeout = setTimeout(() => setAnimating(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [animating]);

  const getSubtext = () => {
    if (mode) {
      if (mode.isPending) {
        return 'Your request to join this league is pending approval';
      }

      return mode.isProtected
        ? 'Request to join this league by customizing your profile below'
        : 'Join this league by customizing your profile below';
    }
    return null;
  };

  const subtext = getSubtext();

  return (
    <div className='sticky z-50 flex flex-col w-full justify-center bg-card shadow-lg shadow-primary/20 px-4 py-4 items-center border-b-2 border-primary/20'>
      <div
        className='relative flex w-full items-center justify-center overflow-hidden'
        ref={containerRef}>
        <span className='h-8 w-1 bg-primary rounded-full shrink-0' />

        <h1
          ref={measureRef}
          className='absolute invisible whitespace-nowrap text-3xl md:text-4xl font-black uppercase tracking-tight mx-2'>
          {mode && !mode.isPending ? `Join ${name}` : name}
        </h1>

        {needsMarquee ? (
          <Marquee
            pauseOnHover
            speed={20}
            play={needsMarquee && animating}
            gradient={false}
            onCycleComplete={() => setAnimating(false)}>
            <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight whitespace-nowrap mr-16'>
              {mode && !mode.isPending ? `Join ${name}` : name}
            </h1>
          </Marquee>
        ) : (
          <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight text-center leading-tight whitespace-nowrap mx-2'>
            {mode && !mode.isPending ? `Join ${name}` : name}
          </h1>
        )}

        <span className='h-8 w-1 bg-primary rounded-full shrink-0' />
      </div>

      <div className='flex items-center gap-2'>
        <Link href={`https://survivor.fandom.com/wiki/${season}`} target='_blank'>
          <h3 className='text-nowrap leading-none text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors'>
            {season}
          </h3>
        </Link>
        {!mode && status && (
          <>
            <span className='text-muted-foreground'>•</span>
            <span className='text-nowrap leading-none text-sm font-bold uppercase tracking-wider text-muted-foreground'>
              {status}
            </span>
          </>
        )}
      </div>

      {subtext && (
        <p className='text-muted-foreground text-pretty text-sm md:text-base font-medium text-center'>
          {subtext}
        </p>
      )}
    </div>
  );
}
