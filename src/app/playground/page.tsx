import Rules from './_components/rules';
import { Leaderboard } from './_components/leaderboard';
import CreateLeagueForm from '../leagues/_components/createLeagueForm';
import { Suspense } from 'react';

export default function PlaygroundPage() {

  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Welcome to the Fantasy Playground!</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Rules />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <Leaderboard />
      </Suspense>
      <CreateLeagueForm className='p-4 w-full' subtitle='w/ above rules (can be changed)' />
    </main>
  );
}

