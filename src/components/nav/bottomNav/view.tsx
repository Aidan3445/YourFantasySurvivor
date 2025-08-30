
import { Trophy } from 'lucide-react';
import { cn } from '~/lib/utils';
import Image from 'next/image';
import { BottomNavUser } from '~/components/nav/bottomNav/user';
import { BottomNavLink } from '~/components/nav/bottomNav/link';

export const navHeight = 'h-10';

export default function BottomNav() {
  return (
    <div className={cn('fixed bottom-0 left-0 right-0 bg-sidebar shadow-md z-50 md:hidden', navHeight)}>
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
        {/*<BottomNavLink href='/playground' icon={<Flame size={26} />} />*/}
        <BottomNavLink
          href='/leagues'
          icon={<Trophy className='active:stroke-green-800 transition-colors' size={28} />} />
        <BottomNavUser />
      </span>
    </div>
  );
}
