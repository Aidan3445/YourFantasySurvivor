import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { type NavLinkProps } from './navSelector';
import Link from 'next/link';
import { BookUser, Home, Flame, Trophy } from 'lucide-react';

export default function BottomNav() {

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-white shadow-md'>
      <span className='flex justify-evenly py-2'>
        <BottomNavLink href='/' icon={<Home />} />
        <BottomNavLink href='/leagues' icon={<Trophy />} />
        <BottomNavLink href='/seasons' icon={<BookUser />} />
        <BottomNavLink href='/playground' icon={<Flame />} />
        <BottomNavUser />
      </span>
    </div>
  );
}

function BottomNavUser() {
  return (
    <div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
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

