'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SidebarMenuButton, SidebarSeparator } from '~/components/common/sidebar';
import { Switch } from '~/components/common/switch';
import SideNavLink from '~/components/nav/side/link';
import DevEpisodeOverride from '~/components/nav/side/devEpisodeOverride';

interface SysAdminNavProps {
  userId: string | null;
  noRedirects?: boolean;
}

export default function SysAdminNav({ userId, noRedirects }: SysAdminNavProps) {
  const [noRedirectsState, setNoRedirectsState] = useState(noRedirects ?? false);

  const router = useRouter();
  if (!userId) return null;

  const toggleRedirects = async (value: boolean) => {
    setNoRedirectsState(value);
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
      <SidebarSeparator className='my-1' />
      <SideNavLink href='/sys' label='Data Import Page' />
      <SidebarMenuButton className='h-10!' asChild size='lg'>
        <div
          className='text-primary! select-none cursor-pointer'
          onClick={() => toggleRedirects(!noRedirectsState)}>
          Prevent Redirects
          <Switch checked={noRedirectsState} onCheckedChange={toggleRedirects} className='ml-auto' />
        </div>
      </SidebarMenuButton>
      <DevEpisodeOverride />
    </>
  );
}

