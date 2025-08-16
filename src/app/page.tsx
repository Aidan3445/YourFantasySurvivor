import { ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs';
import { Skeleton } from '~/components/ui/skeleton';
import { HeroSection } from '~/components/home/heroSection';
import { TopLeaguesCard } from '~/components/home/topLeaguesCard';
import { QuickActions } from '~/components/home/quickActions';
import { GlobalCastawayScoreboard } from '~/components/home/globalCastawayScoreboard';

export default async function HomePage() {
  return (
    <main className='flex flex-col gap-6 w-full p-4 max-w-7xl mx-auto'>
      {/* Loading State */}
      <ClerkLoading>
        <div className='flex flex-col gap-6 items-center'>
          <Skeleton className='w-full h-96 rounded-lg' />
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 w-full'>
            <Skeleton className='h-48 rounded-lg' />
            <Skeleton className='h-48 rounded-lg' />
            <Skeleton className='h-48 rounded-lg' />
          </div>
        </div>
      </ClerkLoading>

      {/* Non-logged in users */}
      <SignedOut>
        <div className='flex flex-col gap-8'>
          <HeroSection />

          {/* Global Castaway Scoreboard for non-logged in users */}
          <div className='w-full'>
            <GlobalCastawayScoreboard />
          </div>

          {/* Call to action section */}
          <div className='text-center py-8'>
            <h2 className='text-2xl font-bold mb-4'>Ready to Start Playing?</h2>
            <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
              Join thousands of Survivor fans in the ultimate fantasy experience.
              Create leagues, draft castaways, and compete with friends!
            </p>
          </div>
        </div>
      </SignedOut>

      {/* Logged in users */}
      <SignedIn>
        <div className='space-y-6'>
          {/* Welcome back section */}
          <div className='text-center py-6'>
            <h1 className='text-4xl font-bold mb-2'>Welcome back!</h1>
            <p className='text-muted-foreground text-lg'>
              Ready to dominate your fantasy leagues?
            </p>
          </div>

          {/* Main dashboard grid */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left column - Top leagues */}
            <div className='lg:col-span-2'>
              <TopLeaguesCard />
            </div>

            {/* Right column - Quick actions */}
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Global Castaway Scoreboard */}
          <GlobalCastawayScoreboard />

          {/* Additional feature placeholders */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='bg-card rounded-lg p-6 border-2 border-dashed border-muted-foreground/20'>
              <h3 className='font-semibold mb-2'>Recent Activity</h3>
              <p className='text-sm text-muted-foreground'>
                See recent moves, eliminations, and league updates across all your leagues.
              </p>
            </div>

            <div className='bg-card rounded-lg p-6 border-2 border-dashed border-muted-foreground/20'>
              <h3 className='font-semibold mb-2'>Performance Stats</h3>
              <p className='text-sm text-muted-foreground'>
                Track your win rate, average points, and seasonal performance across leagues.
              </p>
            </div>

            <div className='bg-card rounded-lg p-6 border-2 border-dashed border-muted-foreground/20'>
              <h3 className='font-semibold mb-2'>Upcoming Episodes</h3>
              <p className='text-sm text-muted-foreground'>
                Never miss an episode with episode schedules and reminders.
              </p>
            </div>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
