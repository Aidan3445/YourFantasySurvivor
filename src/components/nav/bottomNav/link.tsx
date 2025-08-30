import { type NavLinkProps } from '~/components/nav/navSelector';
import Link from 'next/link';

export function BottomNavLink({ href, icon }: NavLinkProps) {
  return (
    <Link href={href}>
      {icon}
    </Link>
  );
}
