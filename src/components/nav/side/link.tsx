'use client';

import { SidebarMenuButton } from '~/components/common/sidebar';
import Link from 'next/link';
import { type NavLinkProps } from '~/components/nav/navSelector';
import { cn } from '~/lib/utils';
import { usePathname } from 'next/navigation';

export default function SideNavLink({
  href,
  icon,
  label,
  pathnameMatch,
  className,
  children
}: NavLinkProps) {
  const pathname = usePathname();

  const active = pathnameMatch
    ? pathname.includes(pathnameMatch)
    : pathname === href;

  const Icon = icon;
  return (
    <SidebarMenuButton className='h-10! pr-0' asChild size='lg'>
      <Link
        className={cn(
          'w-full flex gap-5 items-center transition-all h-min text-primary hover:text-primary!',
          active && 'font-semibold',
          className
        )}
        href={href}>
        {Icon ? (
          <Icon size={26} className='stroke-primary shrink-0' />
        ) : (
          children
        )}

        <span className='text-inherit'>
          {label}
        </span>
      </Link>
    </SidebarMenuButton>
  );
}
