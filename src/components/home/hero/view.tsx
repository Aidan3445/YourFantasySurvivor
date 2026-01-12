import { SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import { Card, CardContent } from '~/components/common/card';

export function HeroSection() {
  return (
    <Card className='bg-card border-border/50 shadow-sm'>
      <CardContent className='relative'>
        {/* Logo - Top Right Corner */}
        <div className='absolute top-0 right-4 opacity-40 hover:opacity-60 transition-opacity'>
          <Image src='/Logo.png' alt='YFS Logo' width={80} height={80} className='w-16 h-16 md:w-auto md:h-auto' />
        </div>

        <div className='space-y-4'>
          {/* Hero Headline */}
          <div>
            <h1 className='text-primary text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95]'>
              Your Fantasy
              <br />
              <span className='text-primary font-semibold'>Survivor</span>
            </h1>
            <div className='w-20 h-0.5 bg-primary/80 mt-6' />
          </div>



          {/* Subtext */}
          <div className='max-w-lg space-y-4'>
            <p className='text-lg md:text-xl leading-relaxed text-muted-primary font-light'>
              Draft castaways. Track their journey.
              Compete with friends in the ultimate
              Survivor fantasy league.
            </p>

            {/* CTA */}
            <SignInButton mode='modal'>
              <button className='group inline-flex items-center gap-2 text-base font-medium border-b-2 border-primary transition-all hover:border-muted-primary'>
                <span className='group-hover:opacity-70 transition-opacity'>
                  Get Started
                </span>
                <span className='text-sm group-hover:translate-x-1 transition-transform'>→</span>
              </button>
            </SignInButton>
          </div>

          {/* Features - Minimal List */}
          <div className='pt-4 border-t border-border/40'>
            <dl className='grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8'>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-primary'>
                  Make it yours
                </dt>
                <dd className='text-muted-primary leading-relaxed font-light'>
                  Completely customize your league, add custom scoring events and predictions,
                  or just use our reasonable defaults
                </dd>
              </div>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-primary'>
                  Draft & Score
                </dt>
                <dd className='text-muted-primary leading-relaxed font-light'>
                  Select your castaway and earn points for their performance and strategic moves
                </dd>
              </div>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-primary'>
                  Predictions
                </dt>
                <dd className='text-muted-primary leading-relaxed font-light'>
                  Predict key game events and raise the stakes by betting points on your choices
                </dd>
              </div>
              <div>
                <dt className='font-medium mb-2 text-sm uppercase tracking-wider text-muted-primary'>
                  Live Tracking
                </dt>
                <dd className='text-muted-primary leading-relaxed font-light'>
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
