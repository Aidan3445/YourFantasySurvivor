import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HeroSection } from '~/components/home/hero/view';
import { ActiveLeagues } from '~/components/home/activeLeagues/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { FloatingActionsWidget } from '~/components/shared/floatingActions/widget';
import { CastawayScoreboard } from '~/components/home/scoreboard/view';

export default async function HomePage() {
  return (
    <div className='relative'>
      <ScrollArea className='overflow-y-visible md:h-[calc(100svh-1rem)] h-[calc(100svh-var(--navbar-height))]'>
        <div className=' p-4'>
          <SignedOut>
            <HeroSection />
          </SignedOut>

          <SignedIn>
            <div className='space-y-4'>
              <ActiveLeagues />
              <CastawayScoreboard />
            </div>
          </SignedIn>

          <SignedOut>
            <CastawayScoreboard />
          </SignedOut>

          <FloatingActionsWidget />
        </div>
        <ScrollBar className='pt-2 pb-4' />
      </ScrollArea>
    </div>
  );
}
