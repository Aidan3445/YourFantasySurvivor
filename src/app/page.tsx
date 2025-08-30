import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HeroSection } from '~/components/home/heroSection';
import { TopLeaguesCard } from '~/components/home/topLeaguesCard';
import { QuickActions } from '~/components/home/quickActions';
import { GlobalCastawayScoreboard } from '~/components/home/globalCastawayScoreboard';
import { Trophy, Users, BarChart } from 'lucide-react';

export default async function HomePage() {
  return (
    <main className='flex flex-col gap-2 w-full p-4 max-w-7xl mx-auto pb-12 lg:pb-0'>
      {/* Non-logged in users */}
      <SignedOut>
        <div>
          <HeroSection />

          {/* Features Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 text-center'>
              <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Trophy className='w-6 h-6 text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Compete & Win</h3>
              <p className='text-sm text-muted-foreground'>
                Battle friends in fantasy leagues and climb the leaderboards with strategic picks.
              </p>
            </div>

            <div className='bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 text-center'>
              <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='w-6 h-6 text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Social Gaming</h3>
              <p className='text-sm text-muted-foreground'>
                Create private leagues with friends or join public competitions with fans worldwide.
              </p>
            </div>

            <div className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 text-center'>
              <div className='w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <BarChart className='w-6 h-6 text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Live Scoring</h3>
              <p className='text-sm text-muted-foreground'>
                Watch your points update in real-time as your castaways make moves in the game.
              </p>
            </div>
          </div>

          {/* Global Castaway Scoreboard */}
          <div className='w-full'>
            <GlobalCastawayScoreboard />
          </div>

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

          {/* Final Call to action */}
          <div className='bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 text-center'>
            <h2 className='text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
              Join the Ultimate Survivor Experience
            </h2>
            <p className='text-lg text-muted-foreground mb-8 max-w-3xl mx-auto'>
              Over 10,000 fans are already playing. Create your league, draft your castaways,
              and prove you have what it takes to outwit, outplay, and outlast the competition!
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-center'>
              <div>
                <div className='text-2xl font-bold text-primary'>10K+</div>
                <div className='text-sm text-muted-foreground'>Active Players</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-primary'>500+</div>
                <div className='text-sm text-muted-foreground'>Active Leagues</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-primary'>24/7</div>
                <div className='text-sm text-muted-foreground'>Live Updates</div>
              </div>
            </div>
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
              <TopLeaguesCard />
            </div>
            <div className='lg:col-span-2 lg:row-start-2'>
              <GlobalCastawayScoreboard />
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
