'use client';

import Image from 'next/image';
import { Card, CardContent } from '~/components/ui/card';
//import { Button } from "~/components/ui/button";
import { SignIn } from '@clerk/nextjs';
import { Trophy, Users, Gamepad2, BarChart } from 'lucide-react';
import { type ReactNode } from 'react';

export function HeroSection() {
  return (
    <div className='flex flex-col lg:flex-row items-center lg:items-start gap-8'>
      <div className='flex flex-col items-center gap-4'>
        <Image
          src='https://i.imgur.com/xS6JQdr.png'
          priority
          width={256}
          height={256}
          alt='Your Fantasy Survivor Logo'
        />
        <Card className='shadow-2xl'>
          <CardContent className='p-6 space-y-4 max-w-lg'>
            <h1 className='text-4xl font-bold text-center'>Welcome to Your Fantasy Survivor!</h1>
            <div className='space-y-3'>
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
      </div>

      <div className='flex-shrink-0'>
        <SignIn
          routing='hash'
          appearance={{
            layout: { logoPlacement: 'none' },
            elements: {
              card: 'shadow-2xl'
            }
          }}
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className='flex flex-col items-center text-center p-3 rounded-lg bg-accent/50'>
      <div className='text-primary mb-2'>
        {icon}
      </div>
      <h3 className='font-semibold text-sm mb-1'>{title}</h3>
      <p className='text-xs text-muted-foreground'>{description}</p>
    </div>
  );
}
