import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import CreateLeagueForm from '~/components/leagues/createLeague';

export default function HomePage() {
  return (
    <main>
      <div>
        <Image src='https://i.imgur.com/b6cHcaG.png' priority width={1200} height={1200} alt='Header Image' />
      </div>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <CreateLeagueForm />
      </SignedIn>
    </main>
  );
}
