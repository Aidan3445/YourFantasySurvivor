import { SignedIn } from '@clerk/nextjs';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/common/sidebar';

import Image from 'next/image';
import SideNavFooter from '~/components/nav/side/footer';
import SideNavLink from '~/components/nav/side/link';
import SideNavLeagues from '~/components/nav/side/leagues';
import { Flame, BookUser } from 'lucide-react';
import { systemAdminAuth } from '~/lib/auth';
import SysAdminNav from '~/components/nav/side/sys';

export default async function SideNav() {
  const { userId, noRedirects } = await systemAdminAuth();

  return (
    <Sidebar className='hidden md:block' variant='sidebar' collapsible='none'>
      <SidebarContent className='overflow-y-auto sticky top-0'>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink
              href='/' icon={
                <Image src='/Icon.ico' alt='Your Fantasy Survivor Logo' width={24} height={24} />
              }
              label='Your Fantasy Survivor' />
            <SideNavLink
              href='/playground'
              icon={<Flame className='stroke-primary' />}
              label='Playground' />
            <SideNavLink
              href='/seasons'
              icon={<BookUser className='stroke-primary' />}
              label='Seasons' />
            <SignedIn>
              <SideNavLeagues />
            </SignedIn>
          </SidebarMenu>
          <SideNavFooter />
          <SysAdminNav userId={userId} noRedirects={noRedirects} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
