import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HeroSection } from '~/components/home/hero/view';
import { ActiveLeagues } from '~/components/home/activeLeagues/view';
import { CastawayScoreboard } from '~/components/home/scoreboard/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { FloatingActionsWidget } from '~/components/shared/floatingActions/widget';

export default async function HomePage() {
  return (
    <div>
      {/* Non-logged in users */}
      <SignedOut>
        <div className='flex flex-col w-full h-40 justify-center bg-card shadow-md shadow-primary px-2 items-center'>
          <HeroSection />
        </div>

        <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-11rem)] h-[calc(100svh-10rem-var(--navbar-height))]'>
          <div className='mt-2 mb-4'>
            <CastawayScoreboard />
          </div>
          <ScrollBar className='pt-2 pb-4' />
        </ScrollArea>
      </SignedOut>

      {/* Logged in users */}
      <SignedIn>
        <div className='sticky z-50 flex flex-col w-full h-32 justify-center bg-card shadow-md shadow-primary px-2 items-center'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold'>Welcome to YFS!</h1>
            <p className='text-muted-foreground text-pretty text-sm md:text-base'>
              Ready to dominate your fantasy leagues?
            </p>
          </div>
        </div>

        <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-9rem)] h-[calc(100svh-8rem-var(--navbar-height))]'>
          <div className='mt-2 mb-4 space-y-4'>
            <ActiveLeagues />
            <CastawayScoreboard />
          </div>
          <ScrollBar className='pt-2 pb-4' />
        </ScrollArea>

        <FloatingActionsWidget />
      </SignedIn>
    </div>
  );
}
