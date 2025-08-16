'use client';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Badge } from '~/components/ui/badge';
import { Flame, Crown, Skull } from 'lucide-react';

interface Castaway {
  name: string;
  tribe: string;
  tribeColor: string;
  isEliminated: boolean;
  status: 'active' | 'eliminated' | 'winner';
  episodes: number;
}

const mockCastaways: Castaway[] = [
  { name: 'Player 1', tribe: 'Red Tribe', tribeColor: '#DC2626', isEliminated: false, status: 'active', episodes: 8 },
  { name: 'Player 2', tribe: 'Blue Tribe', tribeColor: '#2563EB', isEliminated: false, status: 'active', episodes: 8 },
  { name: 'Player 3', tribe: 'Green Tribe', tribeColor: '#16A34A', isEliminated: false, status: 'active', episodes: 8 },
  { name: 'Player 4', tribe: 'Yellow Tribe', tribeColor: '#EAB308', isEliminated: true, status: 'eliminated', episodes: 7 },
  { name: 'Player 5', tribe: 'Purple Tribe', tribeColor: '#9333EA', isEliminated: true, status: 'eliminated', episodes: 6 },
  { name: 'Player 6', tribe: 'Orange Tribe', tribeColor: '#EA580C', isEliminated: true, status: 'eliminated', episodes: 5 },
];

export function GlobalCastawayScoreboard() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Flame className='w-5 h-5 text-orange-500' />
          Current Season Castaways
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {mockCastaways.map((castaway, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 border-2 transition-all ${castaway.isEliminated
                ? 'opacity-60 border-gray-300'
                : 'border-primary/20 hover:border-primary/40'
                }`}
              style={{ backgroundColor: `${castaway.tribeColor}15` }}
            >
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-semibold text-sm'>{castaway.name}</h4>
                {castaway.status === 'winner' && <Crown className='w-4 h-4 text-yellow-500' />}
                {castaway.status === 'eliminated' && <Skull className='w-4 h-4 text-gray-500' />}
                {castaway.status === 'active' && <Flame className='w-4 h-4 text-orange-500' />}
              </div>
              <Badge
                variant='secondary'
                className='text-xs mb-1'
                style={{ backgroundColor: castaway.tribeColor, color: 'white' }}
              >
                {castaway.tribe}
              </Badge>
              <p className='text-xs text-muted-foreground'>
                {castaway.episodes} episode{castaway.episodes !== 1 ? 's' : ''}
                {castaway.isEliminated ? ' (eliminated)' : ' (active)'}
              </p>
            </div>
          ))}
        </div>
        <div className='mt-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            * This is placeholder data. In production, this would show real castaway data from the current season.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function GlobalCastawayScoreboardSkeleton() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Skeleton className='w-5 h-5' />
          <Skeleton className='w-48 h-6' />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='rounded-lg p-3 border-2 border-gray-200'>
              <div className='flex items-center justify-between mb-2'>
                <Skeleton className='w-16 h-4' />
                <Skeleton className='w-4 h-4' />
              </div>
              <Skeleton className='w-20 h-5 mb-1' />
              <Skeleton className='w-28 h-3' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
