import Rules from './_components/rules';
import { Leaderboard } from './_components/leaderboard';
import CreateLeagueForm from '../leagues/_components/createLeagueForm';

export default function PlaygroundPage() {

  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Welcome to the Fantasy Playground!</h1>
      <Rules />
      <Leaderboard />
      <CreateLeagueForm className='p-4 w-full' subtitle='w/ above rules (can be changed)' />
    </main>
  );
}

