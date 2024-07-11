'use client';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CreateLeagueForm from './createLeagueForm';
import JoinLeagueForm from './joinLeagueForm';
import { useState } from 'react';

export default function LeagueNav() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <nav className='grid grid-cols-2 gap-2 px-5 py-2 text-black rounded-full bg-b1 border-black border-2'>
      <Popover open={createOpen} onOpenChange={setCreateOpen} defaultOpen={false}>
        <PopoverTrigger className='w-32 h-10 hs-in rounded-md font-medium text-sm'>
          Create League
        </PopoverTrigger>
        <PopoverContent>
          <CreateLeagueForm className='p-4 bg-b3' closePopup={() => setCreateOpen(false)} />
        </PopoverContent>
      </Popover>
      <Popover open={joinOpen} onOpenChange={setJoinOpen}>
        <PopoverTrigger className='w-32 hs-in rounded-md font-medium text-sm'>
          Join League
        </PopoverTrigger>
        <PopoverContent>
          <JoinLeagueForm className='w-60 h-[21rem] p-4 bg-b3' closePopup={() => setJoinOpen(false)} />
        </PopoverContent>
      </Popover>
    </nav>
  );
}

