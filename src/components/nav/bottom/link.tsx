'use client';

import { type NavLinkProps } from '~/components/nav/navSelector';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/utils';

export default function BottomNavLink({ href, pathnameMatch, icon, children }: NavLinkProps) {
  const pathname = usePathname();

  const active = pathnameMatch
    ? pathname.includes(pathnameMatch)
    : pathname === href;
  const Icon = icon;
  return (
    <Link href={href}>
      {Icon && (
        <Icon
          size={28}
          className={cn(
            'cursor-pointer stroke-primary hover:stroke-secondary/75 active:stroke-primary/50 transition-colors',
            active && 'stroke-secondary'
          )} />
      )}
      {children}
    </Link>
  );
}
