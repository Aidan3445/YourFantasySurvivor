'use client';

import Link from 'next/link';
import { FlameKindling, ListPlus } from 'lucide-react';
import { CreateLeagueModal } from '~/components/leagues/createLeague';
import { useYfsUser } from '~/hooks/useYfsUser';
import { type LeagueInfo } from '~/context/yfsUserContext';
import { SignIn, useUser } from '@clerk/nextjs';
import { Separator } from '~/components/ui/separator';
import { Fragment } from 'react';

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
        <section className='grid grid-cols-4 gap-5 w-5/6 mx-5'>
          {currentLeagues.map(league => (
            <Link
              key={league.leagueHash}
              href={`/leagues/${league.leagueHash}`}>
              <section className='px-2 py-1 rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all'>
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
      {inactiveLeagues.length > 0 && (
        <section className='grid grid-cols-4 gap-x-5 w-5/6 mx-5'>
          {inactiveLeagues
            .toSorted((a, b) => b.season.localeCompare(a.season))
            .map((league, index) => (
              <Fragment key={index}>
                {/* Display season header only once for each season */}
                {inactiveLeagues.findIndex(l => l.season === league.season) === index && (
                  <h3
                    key={league.season}
                    className='col-span-4 mt-3 mb-2 text-center text-lg text-primary-foreground font-semibold bg-primary rounded-full'>
                    {league.season}
                  </h3>
                )}
                <Link
                  key={league.leagueHash}
                  href={`/leagues/${league.leagueHash}`}>
                  <section className='px-2 py-1 rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all'>
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
              </Fragment>
            ))
          }
        </section >
      )}
    </main >
  );
}


