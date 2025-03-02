'use client';

import Link from 'next/link';
import { FlameKindling, ListPlus } from 'lucide-react';
import { CreateLeagueModal } from '~/components/leagues/createLeague';
import { useYfsUser } from '~/hooks/useYfsUser';
import { type LeagueInfo } from '~/context/yfsUserContext';
import { SignIn, useUser } from '@clerk/nextjs';

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
      {leagues.length > 0 ?
        <h1 className='text-3xl'>My Leagues</h1> :
        user.isSignedIn ?
          <h1 className='text-3xl'>No Leagues Yet...</h1> :
          <h1 className='text-3xl'>Sign in or sign up to view and create leagues</h1>}
      {currentLeagues.map(league => (
        <Link
          key={league.leagueHash}
          className='w-5/6 mx-5'
          href={`/leagues/${league.leagueHash}`}>
          <section className='px-2 py-1 rounded-lg bg-card'>
            <h3 className='text-xl font-semibold'>{league.leagueName}</h3>
            <p className='text-sm'>{league.season}</p>
            {league.castaway ? (
              <p>
                <i>{league.castaway}</i>
                {league.out && <FlameKindling className='inline' size={16} />}
              </p>
            ) : (
              <p><i>Yet to draft</i></p>
            )}
          </section>
        </Link>
      ))}
      {user.isSignedIn ?
        <CreateLeagueModal>
          <section className='flex gap-2 items-center px-2 py-1 rounded-lg bg-card'>
            <h3 className='text-xl'>Create New League</h3>
            <ListPlus size={24} />
          </section>
        </CreateLeagueModal> :
        <SignIn forceRedirectUrl='/leagues' />}
      {inactiveLeagues.length > 0 && (
        <section className='flex flex-col gap-5 w-5/6 mx-5'>
          <h2 className='text-center text-2xl'>Past Seasons</h2>
          {inactiveLeagues.map(league => (
            <Link
              key={league.leagueHash}
              href={`/leagues/${league.leagueHash}`}>
              <section className='px-2 py-1 rounded-lg bg-card'>
                <h3 className='text-xl font-semibold'>{league.leagueName}</h3>
                <p className='text-sm'>{league.season}</p>
                {league.castaway ? (
                  <p>
                    <i>{league.castaway}</i>
                    {league.out && <FlameKindling className='inline' size={16} />}
                  </p>
                ) : (
                  <p><i>Yet to draft</i></p>
                )}
              </section>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}


