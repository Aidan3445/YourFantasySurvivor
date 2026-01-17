import { type LucideProps } from 'lucide-react';
import { type ReactNode, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import BottomNav from '~/components/nav/bottom/view';
import SideNav from '~/components/nav/side/view';
import { systemAdminAuth } from '~/lib/auth';

export interface NavLinkProps {
  href: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
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
