import { SignedOut, SignedIn, SignInButton, UserButton, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import { LoaderCircle } from 'lucide-react';
import NavTabs from './navTabs';

export default function TopNav() {
  return (
    <nav className='flex justify-between items-center px-2 pt-4 mb-4 font-semibold min-h-14' >
      <NavTabs />
      <div className='flex justify-center items-center'>
        <ClerkLoading>
          <LoaderCircle className='self-center animate-spin' size={32} color='#7f633f' />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </ClerkLoaded>
      </div>
    </nav >
  );
}

