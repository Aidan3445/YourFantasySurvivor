import { Card, CardContent } from '~/components/common/card';
import { Trophy, Users, Gamepad2, BarChart } from 'lucide-react';
import FeatureCard from '~/components/home/hero/featureCard';

export function HeroSection() {
  return (
    <Card className='shadow-2xl w-full'>
      <CardContent className='p-6 space-y-4'>
        <h1 className='text-4xl font-bold text-center'>Welcome to Your Fantasy Survivor!</h1>
        <div className='space-y-3 mb-0'>
          <p className='text-center'>
            Compete with friends in <i>Your Fantasy Survivor</i>, the ultimate Survivor fantasy league.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FeatureCard
              icon={<Users className='w-6 h-6' />}
              title='Create Leagues'
              description='Draft a Survivor and rack up points as they navigate the game'
            />
            <FeatureCard
              icon={<Trophy className='w-6 h-6' />}
              title='Score Points'
              description='Earn points for victories, bold moves, and strategic plays'
            />
            <FeatureCard
              icon={<Gamepad2 className='w-6 h-6' />}
              title='Strategic Swaps'
              description='Change your pick anytime or swap for strategic advantage'
            />
            <FeatureCard
              icon={<BarChart className='w-6 h-6' />}
              title='Custom Scoring'
              description='Customize league scoring and create unique events'
            />
          </div>
          <div className='text-center pt-4'>
            <p className='font-bold text-lg'>
              Outdraft your rivals. Outpredict the game. Outwatch every moment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
