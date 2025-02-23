import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import CreateLeagueForm from '~/components/leagues/createLeague';

export default function HomePage() {
  return (
    <main className='flex flex-col gap-4 w-full px-4 items-center'>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <CreateLeagueForm />
      </SignedIn>
    </main>
  );
}
