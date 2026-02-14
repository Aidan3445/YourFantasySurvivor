'use client';

import { SignedIn } from '@clerk/nextjs';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/common/sidebar';
import SideNavFooter from '~/components/nav/side/footer';
import SideNavLink from '~/components/nav/side/link';
import SideNavLeagues from '~/components/nav/side/leagues';
import SysAdminNav from '~/components/nav/side/sys';
import { PlaygroundIcon, SeasonsIcon, TorchIcon } from '~/components/icons/generated';

interface SideNavProps {
  userId: string | null;
  noRedirects?: boolean;
}

export default function SideNav({ userId, noRedirects }: SideNavProps) {
  const isLocalStorageAvailable = typeof window !== 'undefined' && (() => {
    try {
      window.localStorage.getItem('__test');
      return true;
    } catch {
      return false;
    }
  })();

  if (!isLocalStorageAvailable) {
    return null;
  }

  return (
    <Sidebar className='hidden md:block' variant='sidebar' collapsible='none'>
      <SidebarContent className='overflow-y-auto sticky top-0 h-full'>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink href='/' icon={TorchIcon} label='Trial by Fire' />
            <SideNavLink href='/seasons' icon={SeasonsIcon} label='Seasons' />
            <SideNavLink href='/playground' icon={PlaygroundIcon} label='Playground' />
            <SignedIn>
              <SideNavLeagues />
            </SignedIn>
          </SidebarMenu>
          <SideNavFooter />
          {process.env.NODE_ENV === 'development' && (
            <SysAdminNav userId={userId} noRedirects={noRedirects} />
          )}
        </SidebarGroup>
        <div className='pointer-events-none absolute bottom-2 left-0 w-full text-center text-xs text-muted-foreground'>
          &copy; {new Date().getFullYear()} Trial by Fire.
          <br />
          All rights reserved.
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
