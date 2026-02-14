import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import BottomNav from '~/components/nav/bottom/view';
import SideNav from '~/components/nav/side/view';
import { systemAdminAuth } from '~/lib/auth';

export interface NavLinkProps {
  href: string;
  icon?: LucideIcon
  label?: string;
  pathnameMatch?: string;
  className?: string;
  children?: ReactNode;
}

export default async function Nav() {
  const { userId, noRedirects } = await systemAdminAuth();
  return (
    <>
      <SideNav userId={userId} noRedirects={noRedirects} />
      <BottomNav />
    </>
  );
}
