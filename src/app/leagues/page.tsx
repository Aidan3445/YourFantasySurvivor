'use client';

import { ListPlus } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import { useYfsUser } from '~/hooks/useYfsUser';
import { type LeagueInfo } from '~/context/yfsUserContext';
import { SignIn, useUser } from '@clerk/nextjs';
import { Separator } from '~/components/common/separator';
import LeagueGrid from '~/components/leagues/grid/leagueGrid';

export default function LeaguesPage() {
  const user = useUser();
  const { leagues } = useYfsUser();

  const { currentLeagues, inactiveLeagues } = leagues.reduce((acc, league) => {
    if (league.leagueStatus === 'Inactive') {
      acc.inactiveLeagues.push(league);
    } else {
      acc.currentLeagues.push(league);
    }
    return acc;
  }, { currentLeagues: [], inactiveLeagues: [] } as {
    currentLeagues: LeagueInfo[],
    inactiveLeagues: LeagueInfo[]
  });

  return (
    <main className='w-full flex flex-col gap-5 items-center text-center'>
      <div className='w-full place-items-center space-y-2'>
        {leagues.length > 0 ?
          <h1 className='text-3xl w-5/6 bg-secondary rounded-full mt-10'>My Leagues</h1> :
          user.isSignedIn ?
            <h1 className='text-3xl'>No Leagues Yet...</h1> :
            <h1 className='text-3xl'>Sign in or sign up to view and create leagues</h1>}
        <LeagueGrid leagues={currentLeagues} />
      </div>
      {currentLeagues.length === 0 && user.isSignedIn && (
        <h2 className='text-2xl'>No leagues for this season yet... Create one to get started!</h2>
      )}
      {user.isSignedIn ?
        <CreateLeagueModal>
          <section className='flex gap-2 items-center px-2 py-1 rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all'>
            <h3 className='text-xl'>Create New League</h3>
            <ListPlus size={24} />
          </section>
        </CreateLeagueModal> :
        <SignIn forceRedirectUrl='/leagues' />}
      <Separator className='w-11/12 mt-3' />
      <LeagueGrid leagues={inactiveLeagues} isInactive />
    </main >
  );
}


