'use client';

import { type ReactNode } from 'react';
import { useIsMobile } from '~/hooks/useMobile';
import BottomNav, { navHeight } from './bottomNav';
import SideNav from './sideNav';
import { cn } from '~/lib/utils';

export interface NavLinkProps {
  href: string;
  icon?: ReactNode;
  label?: string;
  className?: string;
}

export default function Nav() {
  return (
    <>
      <SideNav />
      <BottomNav />
    </>
  );
}

export function BottomNavSpacer() {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return <div className={cn('mt-2', navHeight)} />;
}
