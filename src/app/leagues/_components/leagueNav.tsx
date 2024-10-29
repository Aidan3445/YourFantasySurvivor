'use client';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CreateLeagueForm from './createLeagueForm';
import JoinLeagueForm from './joinLeagueForm';
import { useState } from 'react';

export default function LeagueNav() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <nav className='grid absolute top-16 grid-cols-2 gap-2 p-2 text-black rounded-2xl border-2 border-black md:top-2 md:left-96 bg-b1 sm:left-[72px] lg:left-[504px] xl:left-[584px]'>
      <Popover open={createOpen} onOpenChange={setCreateOpen} defaultOpen={false}>
        <PopoverTrigger className='w-32 h-10 text-sm font-medium rounded-md hs-in'>
          Create League
        </PopoverTrigger>
        <PopoverContent>
          <CreateLeagueForm className='p-4' closePopup={() => setCreateOpen(false)} />
        </PopoverContent>
      </Popover>
      <Popover open={joinOpen} onOpenChange={setJoinOpen}>
        <PopoverTrigger className='w-32 text-sm font-medium rounded-md hs-in'>
          Join League
        </PopoverTrigger>
        <PopoverContent>
          <JoinLeagueForm className='p-4 w-60 h-[21rem]' closePopup={() => setJoinOpen(false)} />
        </PopoverContent>
      </Popover>
    </nav>
  );
}

