import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { LoaderCircle, LogIn } from 'lucide-react';

export default function BottomNavUser() {
  return (<>
    <ClerkLoading>
      <LoaderCircle className='animate-spin' color='#7f633f' size={28} />
    </ClerkLoading>
    <ClerkLoaded>
      <SignedIn>
        <div className='mt-2 w-7'>
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <LogIn size={28} />
        </SignInButton>
      </SignedOut>
    </ClerkLoaded>
  </>
  );
}
