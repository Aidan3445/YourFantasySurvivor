'use client';

import BottomNavUser from '~/components/nav/bottom/user';
import BottomNavLink from '~/components/nav/bottom/link';
import { LeaguesIcon, PlaygroundIcon, SeasonsIcon, TorchIcon } from '~/components/icons/generated';

export default function BottomNav() {

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-sidebar shadow-md z-50 md:hidden h-(--navbar-height)'>
      <span className='flex items-center justify-evenly h-full'>
        <BottomNavLink href='/' icon={TorchIcon} />
        <BottomNavLink href='/seasons' icon={SeasonsIcon} />
        <BottomNavLink href='/playground' icon={PlaygroundIcon} />
        <BottomNavLink href='/leagues' icon={LeaguesIcon} pathnameMatch='/leagues' />
        <BottomNavUser />
      </span>
    </div>
  );
}
