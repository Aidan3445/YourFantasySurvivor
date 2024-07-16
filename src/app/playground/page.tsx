import Rules from './_components/rules';
import { Leaderboard } from './_components/leaderboard';
import CreateLeagueForm from '../leagues/_components/createLeagueForm';

export default function PlaygroundPage() {

  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Welcome to the fantasy playground!</h1>
      <section className='grid grid-cols-3 auto-rows-min gap-2'>
        <Rules className='col-span-3' />
        <Leaderboard className='col-span-2' />
        <CreateLeagueForm className='col-span-1 p-4' subtitle='w/ above rules (can be changed)' />
      </section>
    </main>
  );
}

