import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { CirclePlus } from 'lucide-react';
import Image from 'next/image';
import { CreateLeagueModal } from '~/components/leagues/createLeague';

export default function HomePage() {
  return (
    <main className='flex flex-col gap-4 w-full p-4 items-center'>
      <Image src='https://i.imgur.com/xS6JQdr.png' priority width={256} height={256} alt='Header Image' />
      <section className='bg-card rounded-lg p-4 space-y-4'>
        <h1 className='text-4xl font-bold text-center'>Welcome to Your Fantasy Survivor!</h1>
        <div>
          Compete with friends in <i>Your Fantasy Survivor</i>, the ultimate Survivor fantasy league.
          <ul className='list-disc list-inside'>
            <li>Create your own league, draft a Survivor, and rack up points as they navigate the game.</li>
            <li>Score points for their victories, bold moves, and even the chaos they create.</li>
            <li>Change your pick at any time—switch to any remaining castaway if your Survivor gets eliminated, or shake things up with a strategic swap.</li>
            <li>Customize your league’s scoring system, create unique events, and make the game your own.</li>
          </ul>
          <b>Outdraft your rivals. Outpredict the game. Outwatch every moment</b>
        </div>
      </section>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <CreateLeagueModal className='w-full md:w-fit'>
          <section className='flex gap-8 items-center p-8 rounded-lg bg-card'>
            <h3 className='text-4xl w-full'>Create New League</h3>
            <CirclePlus size={40} />
          </section>
        </CreateLeagueModal>
      </SignedIn>
    </main>
  );
}
