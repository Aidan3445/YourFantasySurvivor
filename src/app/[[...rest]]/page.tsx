import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { CirclePlus } from 'lucide-react';
import Image from 'next/image';
import { CreateLeagueModal } from '~/components/leagues/createLeague';

export default function HomePage() {
  return (
    <main className='flex flex-col gap-4 w-full p-4 items-center'>
      <Image src='https://i.imgur.com/xS6JQdr.png' priority width={256} height={256} alt='Header Image' />
      <section className='bg-card rounded-lg p-4'>
        <h1 className='text-4xl font-bold'>Welcome to Your Fantasy Survivor!</h1>
        <p>
          Compete with friends in a fully customizable fantasy league for Survivor!
          <br />
          Draft a player, earn points as they outlast the competition,
          and see who can outwit, outplay, and outscore the rest.
          <br />
          Customize your league’s scoring system—create your own events, set point values, and make the game your own.
          <br />
          <br />
          Do you have what it takes to survive the season?
        </p>
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
