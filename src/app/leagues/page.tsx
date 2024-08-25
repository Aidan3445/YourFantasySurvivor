import { SignedOut, SignedIn } from '@clerk/nextjs';
import SignInCard from '../_components/signInCard';
import YourLeagues from './_components/yourLeagues';

export default function LeagueHome() {
  return (
    <main>
      <SignedOut>
        <SignInCard />
      </SignedOut>
      <SignedIn>
        <YourLeagues />
      </SignedIn>
    </main>
  );
}
