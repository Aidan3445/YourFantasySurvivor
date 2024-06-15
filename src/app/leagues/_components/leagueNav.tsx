import { Button } from '~/app/_components/commonUI/button';

export default function LeagueNav() {
  return (
    <nav className='grid grid-cols-2 gap-2 px-5 py-2 text-black rounded-full bg-b1 border-black border-2'>
      <a href='/leagues/create'>
        <Button className='w-32'>Create League</Button>
      </a>
      <Button className='w-full'>Join League</Button>
    </nav>
  );
}

