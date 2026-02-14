import { type ReactNode } from 'react';
import BottomNav from '~/components/nav/bottom/view';
import SideNav from '~/components/nav/side/view';
import { systemAdminAuth } from '~/lib/auth';
import { type createIcon } from '~/components/common/customIcon';

export interface NavLinkProps {
  href: string;
  icon?: ReturnType<typeof createIcon>
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
