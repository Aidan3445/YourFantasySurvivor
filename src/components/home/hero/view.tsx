import { SignInButton } from '@clerk/nextjs';
import { Card, CardContent } from '~/components/common/card';

export function HeroSection() {
  return (
    <Card className='bg-card border-border/50 shadow-sm'>
      <CardContent className='p-8 md:p-12 lg:p-16'>
        <div className='max-w-4xl space-y-12 md:space-y-16'>
          {/* Hero Headline */}
          <div className='space-y-6'>
            <h1 className='text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95]'>
              Your Fantasy
              <br />
              <span className='font-semibold'>Survivor</span>
            </h1>
            <div className='w-20 h-0.5 bg-foreground/80' />
          </div>

          {/* Subtext */}
          <div className='max-w-lg space-y-8'>
            <p className='text-lg md:text-xl leading-relaxed text-muted-foreground font-light'>
              Draft castaways. Track their journey.
              Compete with friends in the ultimate
              Survivor fantasy league.
            </p>

            {/* CTA */}
            <SignInButton mode='modal'>
              <button className='group inline-flex items-center gap-2 text-base font-medium border-b-2 border-foreground pb-1 transition-all hover:border-muted-foreground'>
                <span className='group-hover:opacity-70 transition-opacity'>
                  Get Started
                </span>
                <span className='text-sm group-hover:translate-x-1 transition-transform'>→</span>
              </button>
            </SignInButton>
          </div>

          {/* Features - Minimal List */}
          <div className='pt-12 border-t border-border/40'>
            <dl className='grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10'>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground'>Draft & Score</dt>
                <dd className='text-muted-foreground leading-relaxed font-light'>
                  Select your castaway and earn points for their victories and strategic moves
                </dd>
              </div>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground'>Strategic Swaps</dt>
                <dd className='text-muted-foreground leading-relaxed font-light'>
                  Adapt your strategy by swapping picks throughout the season
                </dd>
              </div>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground'>Custom Leagues</dt>
                <dd className='text-muted-foreground leading-relaxed font-light'>
                  Create private leagues with custom scoring rules and events
                </dd>
              </div>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground'>Live Tracking</dt>
                <dd className='text-muted-foreground leading-relaxed font-light'>
                  Follow real-time scores and compete with friends
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
