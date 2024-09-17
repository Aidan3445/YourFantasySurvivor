'use client';
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Button } from '~/app/_components/commonUI/button';

interface PageProps {
  error: Error;
}

export default function LeagueError({ error }: PageProps) {
  const signInOutRedirect = new URL('https://heroic-moose-94.accounts.dev/sign-in');
  signInOutRedirect.searchParams.append('redirect_url', window.location.href);

  const message = error.message ?? 'An error occurred';
  const signInAgain = message === 'The signed in user is not a member of this league';
  return (
    <main className='p-2 text-center text-black rounded border border-black shadow-lg bg-error max-w-64 md:max-w-96'>
      {message}
      <div className='grid grid-cols-2 gap-4 w-full'>
        <Button className={signInAgain ? '' : 'col-span-2'}>
          <a href='/leagues'>Back to Leagues</a>
        </Button>
        {signInAgain && (
          <Button>
            <SignedIn>
              <SignOutButton redirectUrl={signInOutRedirect.toString()}>
                Sign In Again
              </SignOutButton>
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </Button>)}
      </div>
    </main >
  );
}
