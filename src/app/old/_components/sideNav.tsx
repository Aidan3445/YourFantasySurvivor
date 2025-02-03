import { Sidebar, SidebarContent, SidebarMenu } from './commonUI/sideBar';
import { Trophy, BookUser, LineChart, Home } from 'lucide-react';
import { SideNavFooter, SideNavHeader, SideNavLink } from './sideNavHelpers';
import SideNavLeagues from '../leagues/_components/sideNavLeagues';
import { Suspense } from 'react';

export default function SideNav() {

  return (
    <Sidebar className='h-min' collapsible='icon' variant='floating'>
      <SidebarContent>
        <SidebarMenu>
          <SideNavHeader />
          <SideNavLink
            href='/'
            icon={<Home />}
            label='Home' />
          <SideNavLink
            href='/leagues'
            icon={<Trophy />}
            label='Leagues' />
          <Suspense fallback={<div>Loading...</div>}>
            <SideNavLeagues />
          </Suspense>
          <SideNavLink
            href='/seasons'
            icon={<BookUser />}
            label='Seasons'>
          </SideNavLink>
          <SideNavLink
            href='/playground'
            icon={<LineChart />}
            label='Playground'>
          </SideNavLink>
          <SideNavFooter />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar >
  );
}

