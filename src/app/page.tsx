import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs';
import SignInCard from './_components/signInCard';
import CardContainer from './_components/cardContainer';
import LeaguesCard from './_components/leaguesCard';
import SeasonStats from './_components/stats/seasonStats';
import Image from 'next/image';
import { getSeasons } from './api/seasons/query';

export default async function HomePage() {

  const seasons = await getSeasons();

  return (
    <main>
      <CardContainer>
        <Image src='https://i.imgur.com/b6cHcaG.png' priority width={2100} height={2100} alt='Header Image' />
      </CardContainer>
      <section className='grid grid-cols-1 gap-4 w-full sm:grid-cols-2 md:gap-8'>
        <ClerkLoading>
          <SignInCard />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedOut>
            <SignInCard />
          </SignedOut>
          <SignedIn>
            <LeaguesCard />
          </SignedIn>
        </ClerkLoaded>
        <SeasonStats seasons={seasons} />
      </section>
    </main >
  );
}
