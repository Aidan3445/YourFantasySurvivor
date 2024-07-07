import { SignedIn, SignedOut } from '@clerk/nextjs';
import SignInCard from '~/app/_components/signInCard';
import CreateLeagueForm from './_components/createLeagueForm';

export default function CreateLeague() {
  return (
    <main>
      <SignedOut>
        <SignInCard />
      </SignedOut>
      <SignedIn>
        <CreateLeagueForm className='p-5' />
      </SignedIn>
    </main>
  );
}
