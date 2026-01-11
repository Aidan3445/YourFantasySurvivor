import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HeroSection } from '~/components/home/hero/view';
import { ActiveLeagues } from '~/components/home/activeLeagues/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { FloatingActionsWidget } from '~/components/shared/floatingActions/widget';
import { CastawayScoreboard } from '~/components/home/scoreboard/view';

export default async function HomePage() {
  return (
    <div>
      <div className='sticky z-50 flex flex-col w-full h-32 justify-center bg-card shadow-md shadow-primary px-2 items-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold'>Welcome to YFS!</h1>
          <p className='text-muted-foreground text-pretty text-sm md:text-base'>
            <SignedIn>
              Ready to dominate your fantasy leagues?
            </SignedIn>
            <SignedOut>
              Sign in to get started with your fantasy leagues!
            </SignedOut>
          </p>
        </div>
      </div>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-9rem)] h-[calc(100svh-8rem-var(--navbar-height))]'>
        <SignedOut>
          <HeroSection />
        </SignedOut>

        <SignedIn>
          <ActiveLeagues />
        </SignedIn>

        <CastawayScoreboard />

        <FloatingActionsWidget />
        <ScrollBar className='pt-2 pb-4' />
      </ScrollArea>
    </div>
  );
}
