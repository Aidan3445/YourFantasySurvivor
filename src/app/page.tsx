import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs';
import SignInCard, { SignInCardBase } from './_components/signInCard';
import CardContainer from './_components/cardContainer';
import LeaguesCard from './_components/leaguesCard';
import SeasonStats from './_components/stats/seasonStats';
import Image from 'next/image';

export default async function HomePage() {
  return (
    <main>
      <CardContainer>
        <Image src='https://i.imgur.com/b6cHcaG.png' priority width={2100} height={2100} alt='Header Image' />
      </CardContainer>
      <section className='grid grid-cols-1 gap-4 w-full sm:grid-cols-2 md:gap-8'>
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
        <SeasonStats />
      </section>
    </main >
  );
}
