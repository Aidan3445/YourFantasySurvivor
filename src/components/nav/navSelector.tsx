import { type ReactNode } from 'react';
import BottomNav from '~/components/nav/bottom/view';
import SideNav from '~/components/nav/side/view';

export interface NavLinkProps {
  href: string;
  icon?: ReactNode;
  label?: string;
  pathnameMatch?: string;
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
