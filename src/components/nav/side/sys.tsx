'use client';

import { useRouter } from 'next/navigation';
import { SidebarMenuItem, SidebarSeparator } from '~/components/common/sidebar';
import { Switch } from '~/components/common/switch';
import SideNavLink from '~/components/nav/side/link';

interface SysAdminNavProps {
  userId: string | null;
  noRedirects?: boolean;
}

export default function SysAdminNav({ userId, noRedirects }: SysAdminNavProps) {
  const router = useRouter();
  if (!userId) return null;

  const toggleRedirects = async (value: boolean) => {
    await fetch('/api/sys/redirects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noRedirects: value }),
    });

    alert('SysAdmin redirects setting updated.');
    router.refresh();
  };

  return (
    <>
      <SidebarSeparator />
      <SideNavLink href='/sys' label='Data Import Page' />
      <SidebarMenuItem className='peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-6 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
        <p className='text-primary'>Prevent Redirects</p>
        <Switch defaultChecked={noRedirects} onCheckedChange={toggleRedirects} className='ml-auto' />
      </SidebarMenuItem>
    </>
  );
}

