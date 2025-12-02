import { SignedIn } from '@clerk/nextjs';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/common/sidebar';

import Image from 'next/image';
import SideNavFooter from '~/components/nav/side/footer';
import SideNavLink from '~/components/nav/side/link';
import SideNavLeagues from '~/components/nav/side/leagues';
import { Flame } from 'lucide-react';

export default function SideNav() {
  return (
    <Sidebar className='hidden md:block' variant='sidebar' collapsible='none'>
      <SidebarContent className='overflow-y-auto sticky top-0'>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink
              href='/' icon={
                <Image
                  src='/Icon.ico'
                  alt='Your Fantasy Survivor Logo'
                  width={24}
                  height={24}
                />
              }
              label='Your Fantasy Survivor' />
            <SideNavLink href='/playground' icon={<Flame className='stroke-primary' />} label='Playground' />
            <SignedIn>
              <SideNavLeagues />
            </SignedIn>
            {/*<SideNavLink href='/seasons' icon={<BookUser />} label='Seasons' />
            <SidebarSeparator />*/}
          </SidebarMenu>
          <SideNavFooter />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
