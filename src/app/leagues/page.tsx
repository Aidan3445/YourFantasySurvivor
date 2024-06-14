import { SignedOut, SignedIn } from '@clerk/nextjs';
import SignInCard from '../_components/signInCard';

export default function LeaguePage() {
  return (
  // const yourLeagues = await getLeagues();

    <main>
      <SignedOut>
        <SignInCard />
      </SignedOut>
      <SignedIn>
        <h1 className='text-3xl font-semibold'>Your Leagues</h1>
      </SignedIn>
    </main>
  );
}
