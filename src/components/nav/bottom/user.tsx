import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { LoaderCircle, LogIn } from 'lucide-react';

export default function BottomNavUser() {
  return (<>
    <ClerkLoading>
      <LoaderCircle className='animate-spin stroke-primary' size={28} />
    </ClerkLoading>
    <ClerkLoaded>
      <SignedIn>
        <div className='mt-2 w-7'>
          <UserButton />
        </div>
      </SignedIn >
      <SignedOut>
        <SignInButton mode='modal'>
          <LogIn size={28} className='cursor-pointer stroke-primary hover:stroke-secondary/75 active:stroke-primary/50 transition-colors' />
        </SignInButton>
      </SignedOut>
    </ClerkLoaded>
  </>
  );
}
