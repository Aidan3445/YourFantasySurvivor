import { SignedIn, UserButton } from '@clerk/nextjs';
import { type NavLinkProps } from './navSelector';
import Link from 'next/link';
import { BookUser, Home, Flame, Trophy } from 'lucide-react';
import { cn } from '~/lib/utils';

export const navHeight = 'h-10';

export default function BottomNav() {
  return (
    <div className={cn('fixed bottom-0 left-0 right-0 bg-sidebar shadow-md z-50', navHeight)}>
      <span className='flex items-center justify-evenly h-full'>
        <BottomNavLink href='/' icon={<Home size={26} />} />
        <BottomNavLink href='/playground' icon={<Flame size={26} />} />
        <BottomNavLink href='/leagues' icon={<Trophy size={26} />} />
        <BottomNavLink href='/seasons' icon={<BookUser size={26} />} />
        <BottomNavUser />
      </span>
    </div>
  );
}

function BottomNavUser() {
  return (
    <SignedIn>
      <div className='mt-2'>
        <UserButton />
      </div>
    </SignedIn>
  );
}

function BottomNavLink({ href, icon }: NavLinkProps) {
  return (
    <Link href={href}>
      {icon}
    </Link>
  );
}
