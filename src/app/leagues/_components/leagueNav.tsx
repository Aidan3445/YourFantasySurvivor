import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CreateLeagueForm from './createLeagueForm';
import JoinLeagueForm from './joinLeagueForm';

export default function LeagueNav() {
  return (
    <nav className='grid grid-cols-2 gap-2 px-5 py-2 text-black rounded-full bg-b1 border-black border-2'>
      <Popover>
        <PopoverTrigger className='w-32 h-10 hs-in rounded-md font-medium text-sm'>
          Create League
        </PopoverTrigger>
        <PopoverContent>
          <CreateLeagueForm className='p-4 bg-b3' />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger className='w-32 hs-in rounded-md font-medium text-sm'>
          Join League
        </PopoverTrigger>
        <PopoverContent>
          <JoinLeagueForm className='w-60 h-[21rem] p-4 bg-b3' />
        </PopoverContent>
      </Popover>
    </nav>
  );
}

