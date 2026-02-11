import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HeroSection } from '~/components/home/hero/view';
import { ActiveLeagues } from '~/components/home/activeLeagues/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { CastawayScoreboard } from '~/components/home/scoreboard/view';
import Spacer from '~/components/shared/floatingActions/spacer';
import TestPushButton from '~/components/sys/testPushButton';

export default async function HomePage() {
  return (
    <div className='relative'>
      <ScrollArea className='overflow-y-visible md:h-[calc(100svh-1rem)] h-[calc(100svh-var(--navbar-height))]'>
        <div className='p-4 space-y-4'>
          <SignedOut>
            <HeroSection />
          </SignedOut>

          <SignedIn>
            <ActiveLeagues />
          </SignedIn>

          <TestPushButton />

          <CastawayScoreboard />
        </div>
        <Spacer />
        <ScrollBar className='py-4' />
      </ScrollArea>
    </div>
  );
}
