import { type ReactNode } from 'react';
import BottomNav from '~/components/nav/bottomNav/view';
import SideNav from '~/components/nav/sideNav/view';

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
