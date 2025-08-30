'use client';

import { type ReactNode } from 'react';
import BottomNav from '~/components/nav/bottomNav';
import SideNav from '~/components/nav/sideNav';

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
