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
          size={32}
          className={cn(
            'cursor-pointer fill-primary hover:fill-secondary/75 active:fill-primary/50 transition-colors',
            active && 'fill-secondary'
          )} />
      )}
      {children}
    </Link>
  );
}
