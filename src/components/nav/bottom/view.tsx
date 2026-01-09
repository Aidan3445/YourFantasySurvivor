import { Flame, Trophy, BookUser } from 'lucide-react';
import Image from 'next/image';
import BottomNavUser from '~/components/nav/bottom/user';
import BottomNavLink from '~/components/nav/bottom/link';

export default async function BottomNav() {
  return (
    <div className='fixed bottom-0 left-0 right-0 bg-sidebar shadow-md z-50 md:hidden h-(--navbar-height)'>
      <span className='flex items-center justify-evenly h-full'>
        <BottomNavLink
          href='/'
          icon={
            <Image
              src='/Icon.ico'
              alt='Your Fantasy Survivor Logo'
              width={28}
              height={28}
              className='transition filter brightness-0 active:brightness-100 active:saturate-200 active:hue-rotate-90' />} />
        <BottomNavLink href='/playground' icon={<Flame size={26} />} />
        <BottomNavLink href='/seasons' icon={<BookUser size={26} />} />
        <BottomNavLink
          href='/leagues'
          icon={<Trophy className='active:stroke-green-800 transition-colors' size={28} />} />
        <BottomNavUser />
      </span>
    </div>
  );
}
