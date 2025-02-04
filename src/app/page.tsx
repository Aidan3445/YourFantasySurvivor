import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import CreateLeagueForm from '~/components/leagues/createLeague';

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
        <CreateLeagueForm />
      </SignedIn>
    </main>
  );
}
