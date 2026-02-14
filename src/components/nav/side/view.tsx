'use client';

import { SignedIn } from '@clerk/nextjs';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/common/sidebar';
import Image from 'next/image';
import SideNavFooter from '~/components/nav/side/footer';
import SideNavLink from '~/components/nav/side/link';
import SideNavLeagues from '~/components/nav/side/leagues';
import SysAdminNav from '~/components/nav/side/sys';
import { PlaygroundIcon, SeasonsIcon } from '~/components/icons/generated';

interface SideNavProps {
  userId: string | null;
  noRedirects?: boolean;
}

export default function SideNav({ userId, noRedirects }: SideNavProps) {
  return (
    <Sidebar className='hidden md:block' variant='sidebar' collapsible='none'>
      <SidebarContent className='overflow-y-auto sticky top-0'>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink href='/' label='Your Fantasy Survivor'>
              <Image src='/Icon.ico' alt='Your Fantasy Survivor Logo' width={24} height={24} />
            </SideNavLink>
            <SideNavLink href='/seasons' icon={SeasonsIcon} label='Seasons' />
            <SideNavLink href='/playground' icon={PlaygroundIcon} label='Playground' />
            <SignedIn>
              <SideNavLeagues />
            </SignedIn>
          </SidebarMenu>
          <SideNavFooter />
          <SysAdminNav userId={userId} noRedirects={noRedirects} />
        </SidebarGroup>
        <div className='pointer-events-none absolute bottom-0 left-0 w-full text-center text-xs text-muted-foreground'>
          &copy; {new Date().getFullYear()} Your Fantasy Survivor.
          <br />
          All rights reserved.
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
