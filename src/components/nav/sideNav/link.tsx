import { SidebarMenuButton } from '~/components/common/sidebar';
import Link from 'next/link';
import { type NavLinkProps } from '~/components/nav/navSelector';
import { cn } from '~/lib/utils';

export function SideNavLink({ href, icon, label, className }: NavLinkProps) {
  return (
    <SidebarMenuButton className='' asChild size='lg'>
      <Link className={cn('w-full flex gap-5 items-center transition-all', className)} href={href}>
        {icon}
        {label}
      </Link>
    </SidebarMenuButton>
  );
}
