import { Button } from '~/app/_components/commonUI/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CreateLeagueForm from './createLeagueForm';

export default function LeagueNav() {
  return (
    <nav className='grid grid-cols-2 gap-2 px-5 py-2 text-black rounded-full bg-b1 border-black border-2'>
      <Popover>
        <PopoverTrigger>
          <Button className='w-32'>Create League</Button>
        </PopoverTrigger>
        <PopoverContent>
          <CreateLeagueForm />
        </PopoverContent>
      </Popover>
      <Button className='w-full'>Join League</Button>
    </nav>
  );
}

