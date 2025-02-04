import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import { Home } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <div>
        <Image src='https://i.imgur.com/b6cHcaG.png' priority width={2100} height={2100} alt='Header Image' />
      </div>
      <SignedIn>
        <div>
          <p>Leagues</p>
        </div>
      </SignedIn>
    </main>
  );
}
