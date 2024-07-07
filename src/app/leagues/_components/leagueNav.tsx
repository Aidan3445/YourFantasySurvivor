import { Button } from '~/app/_components/commonUI/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CreateLeagueForm from './createLeagueForm';

export default function LeagueNav() {
  return (
    <nav className='grid grid-cols-2 gap-2 px-5 py-2 text-black rounded-full bg-b1 border-black border-2'>
      <Popover>
        <PopoverTrigger className='w-32 hs-in rounded-md font-medium text-sm'>
          Create League
        </PopoverTrigger>
        <PopoverContent>
          <CreateLeagueForm className='p-4 bg-b3' />
        </PopoverContent>
      </Popover>
      <Button className='w-full'>Join League</Button>
    </nav>
  );
}

