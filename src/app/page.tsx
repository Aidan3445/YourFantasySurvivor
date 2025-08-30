import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HeroSection } from '~/components/home/hero/view';
import { ActiveLeagues } from '~/components/home/activeLeagues/view';
import { QuickActions } from '~/components/home/quickActions/view';
import { CastawayScoreboard } from '~/components/home/scoreboard/view';

export default async function HomePage() {
  return (
    <main className='flex flex-col gap-2 w-full p-4 max-w-7xl mx-auto pb-12 lg:pb-0'>
      {/* Non-logged in users */}
      <SignedOut>
        <div className='space-y-8 pb-12'>
          <HeroSection />

          {/* Global Castaway Scoreboard */}
          <div className='w-full'>
            <CastawayScoreboard />
          </div>
        </div>
      </SignedOut>

      {/* Logged in users */}
      <SignedIn>
        <div className='space-y-2'>
          {/* Welcome back section */}
          <div className='text-center'>
            <h1 className='text-4xl font-bold mb-2'>Welcome back!</h1>
            <p className='text-muted-foreground text-lg'>
              Ready to dominate your fantasy leagues?
            </p>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 grid-rows-[1fr]'>
            <div className='lg:col-span-2'>
              <ActiveLeagues />
            </div>
            <div className='lg:col-span-2 lg:row-start-2'>
              <CastawayScoreboard />
            </div>
            <div className='lg:row-span-2 min-w-96'>
              <QuickActions />
            </div>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
