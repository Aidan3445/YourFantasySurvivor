'use client';

import { SidebarMenuButton } from '~/components/common/sidebar';
import Link from 'next/link';
import { type NavLinkProps } from '~/components/nav/navSelector';
import { cn } from '~/lib/utils';
import { usePathname } from 'next/navigation';

export default function SideNavLink({ href, icon, label, pathnameMatch, className }: NavLinkProps) {
  const pathname = usePathname();

  const active = pathnameMatch
    ? pathname.includes(pathnameMatch)
    : pathname === href;

  return (
    <SidebarMenuButton className='h-10!' asChild size='lg'>
      <Link
        className={cn(
          'w-full flex gap-5 items-center transition-all h-min text-primary text-nowrap hover:text-primary!',
          active && 'font-semibold',
          className)}
        href={href}>
        {icon}
        {label}
      </Link>
    </SidebarMenuButton>
  );
}
