import { Button } from '~/app/_components/commonUI/button';

export default function LeagueNav() {
  return (
    <nav className='flex justify-between items-center pt-4 font-semibold min-h-14' >
      <ul className='grid grid-cols-2 gap-2 p-5 text-black rounded-full bg-b1'>
        <li>
          <a href='/leagues/create'>
            <Button className='w-32'>Create League</Button>
          </a>
        </li>
        <li>
          <a href='/leagues/join'>
            <Button className='w-full'> Join League</Button>
          </a>
        </li>
      </ul>
    </nav>
  );
}

