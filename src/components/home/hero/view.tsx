import { SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import { Card, CardContent } from '~/components/common/card';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <Card className='shadow shadow-primary relative overflow-hidden'>
      {/* Accent Glow */}
      <div className='absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl' />
      <div className='absolute -bottom-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl' />

      <CardContent className='relative z-10'>
        {/* Logo - Top Right Corner */}
        <div className='absolute top-0 right-2 opacity-50 hover:opacity-100 hover:rotate-360 transition-all'>
          <Image src='/Logo.png' alt='YFS Logo' width={125} height={125} className='hidden md:block' />
        </div>

        <div className='space-y-8'>
          {/* Hero Headline */}
          <div>
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-foreground'>
              YOUR FANTASY
              <br />
              <span className='bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent'>
                SURVIVOR
              </span>
            </h1>
            <div className='flex items-center gap-2 mt-4'>
              <div className='h-1 w-16 bg-primary rounded-full' />
              <div className='h-1 w-8 bg-primary/50 rounded-full' />
              <div className='h-1 w-4 bg-primary/25 rounded-full' />
            </div>
          </div>

          {/* Subtext */}
          <div className='max-w-2xl'>
            <p className='text-lg md:text-xl leading-relaxed text-muted-foreground font-medium text-pretty'>
              Draft castaways. Predict game events. Climb the leaderboard.
              <br />
              The ultimate Survivor fantasy experience.
            </p>
          </div>

          {/* CTA */}
          <SignInButton mode='modal'>
            <button className='group relative px-8 py-3 bg-primary font-bold rounded-lg overflow-hidden shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]'>
              <span className='relative z-10 flex items-end gap-2 text-primary-foreground'>
                START COMPETING
                <Trophy className='w-6 h-6 stroke-primary-foreground' />
              </span>
              <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
            </button>
          </SignInButton>

          {/* Features - Game Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4'>
            <div className='bg-primary/5 border border-primary/20 rounded-lg p-4 hover:bg-primary/10 hover:border-primary/30 transition-all'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-primary/20 rounded-lg'>
                  <Target className='w-5 h-5 text-primary' />
                </div>
                <h3 className='font-bold text-sm uppercase tracking-wider'>Make it yours</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Completely customize your league, add custom scoring events and predictions,
                or just use our reasonable defaults.
              </p>
            </div>

            <div className='bg-primary/5 border border-primary/20 rounded-lg p-4 hover:bg-primary/10 hover:border-primary/30 transition-all'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-primary/20 rounded-lg'>
                  <Zap className='w-5 h-5 text-primary' />
                </div>
                <h3 className='font-bold text-sm uppercase tracking-wider'>Live Tracking</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Track every move. Follow real-time scores and compete with friends.
              </p>
            </div>

            <div className='bg-primary/5 border border-primary/20 rounded-lg p-4 hover:bg-primary/10 hover:border-primary/30 transition-all'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-primary/20 rounded-lg'>
                  <TrendingUp className='w-5 h-5 text-primary' />
                </div>
                <h3 className='font-bold text-sm uppercase tracking-wider'>Predictions</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Predict key game events and raise the stakes by betting points on your choices.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
