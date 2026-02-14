'use client';

import BottomNavUser from '~/components/nav/bottom/user';
import BottomNavLink from '~/components/nav/bottom/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '~/lib/utils';
import { LeaguesIcon, PlaygroundIcon, SeasonsIcon } from '~/components/icons/generated';

export default function BottomNav() {
  const pathname = usePathname();
  const isHome = useMemo(() => pathname === '/', [pathname]);

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-sidebar shadow-md z-50 md:hidden h-(--navbar-height)'>
      <span className='flex items-center justify-evenly h-full'>
        <BottomNavLink href='/'>
          <div
            className={cn(
              'size-7 transition-colors bg-primary hover:bg-secondary/75 active:bg-primary/50',
              isHome && 'bg-secondary',
            )}
            style={{
              maskImage: 'url(\'/Icon.ico\')',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: 'url(\'/Icon.ico\')',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
            }} />
        </BottomNavLink>
        <BottomNavLink href='/seasons' icon={SeasonsIcon} />
        <BottomNavLink href='/playground' icon={PlaygroundIcon} />
        <BottomNavLink href='/leagues' icon={LeaguesIcon} pathnameMatch='/leagues' />
        <BottomNavUser />
      </span>
    </div>
  );
}
