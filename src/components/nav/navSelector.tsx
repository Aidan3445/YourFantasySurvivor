'use client';

import { type ReactNode } from 'react';
import { useIsMobile } from '~/hooks/useMobile';
import BottomNav from './bottomNav';
import SideNav from './sideNav';

export interface NavLinkProps {
  href: string;
  icon?: ReactNode;
  label?: string;
  className?: string;
}

export default function Nav() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <BottomNav />;
  } else {
    return <SideNav />;
  }
}
