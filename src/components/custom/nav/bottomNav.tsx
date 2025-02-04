import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { type NavLinkProps } from './navSelector';
import Link from 'next/link';
import { BookUser, Home, Flame, Trophy } from 'lucide-react';

export default function BottomNav() {

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-sidebar shadow-md'>
      <span className='flex items-center justify-evenly'>
        <BottomNavLink href='/' icon={<Home size={26} />} />
        <BottomNavLink href='/leagues' icon={<Trophy size={26} />} />
        <BottomNavLink href='/seasons' icon={<BookUser size={26} />} />
        <BottomNavLink href='/playground' icon={<Flame size={26} />} />
        <BottomNavUser />
      </span>
    </div>
  );
}

function BottomNavUser() {
  return (
    <div className='mt-2'>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

function BottomNavLink({ href, icon }: NavLinkProps) {
  return (
    <Link href={href}>
      {icon}
    </Link>
  );
}

