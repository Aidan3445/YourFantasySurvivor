import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs';
import SignInCard, { SignInCardBase } from './_components/signInCard';
import CardContainer from './_components/cardContainer';
import LeaguesCard from './_components/leaguesCard';
import SeasonStats from './_components/stats/seasonStats';
import Image from 'next/image';
import { Suspense } from 'react';

export default async function HomePage() {
  return (
    <main>
      <CardContainer>
        <Image src='https://i.imgur.com/b6cHcaG.png' priority width={2100} height={2100} alt='Header Image' />
      </CardContainer>
      <section className='grid grid-cols-1 gap-6 w-full sm:grid-cols-2'>
        <ClerkLoading>
          <SignInCardBase />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedOut>
            <SignInCard />
          </SignedOut>
          <SignedIn>
            <LeaguesCard />
          </SignedIn>
        </ClerkLoaded>
        <Suspense fallback={<div>Loading...</div>}>
          <SeasonStats />
        </Suspense>
      </section>
    </main >
  );
}
