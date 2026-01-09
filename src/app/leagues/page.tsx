'use client';

import { ListPlus, Users } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { Separator } from '~/components/common/separator';
import LeagueGrid from '~/components/leagues/grid/leagueGrid';
import { useLeagues } from '~/hooks/user/useLeagues';
import { useMemo } from 'react';
import JoinLeagueDialog from '~/components/home/quickActions/joinDialogue';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';

export default function LeaguesPage() {
  const { data: leagues } = useLeagues();

  const { currentLeagues, inactiveLeagues } = useMemo(() => leagues?.reduce((acc, league) => {
    if (league.league.status === 'Inactive') {
      acc.inactiveLeagues.push(league);
    } else {
      acc.currentLeagues.push(league);
    }
    return acc;
  }, { currentLeagues: [] as typeof leagues, inactiveLeagues: [] as typeof leagues }) ?? {
    currentLeagues: [],
    inactiveLeagues: []
  }, [leagues]);

  return (
    <div>
      <div className='sticky z-50 flex flex-col w-full h-32 justify-center bg-card shadow-md shadow-primary px-2 items-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold'>My Leagues</h1>
          <p className='text-muted-foreground text-pretty text-sm md:text-base'>
            {currentLeagues.length + inactiveLeagues.length > 0 ?
              'View and manage your leagues below.' :
              'Create and join leagues to compete with others!'}
          </p>
        </div>

        <SignedIn>
          <div className='flex gap-4'>
            <CreateLeagueModal>
              <section className='flex gap-2 items-center px-2 py-1 rounded-lg bg-primary hover:bg-primary/80 hover:shadow-lg transition-all'>
                <h3 className='text-xl text-primary-foreground'>Create League</h3>
                <ListPlus size={24} color='white' />
              </section>
            </CreateLeagueModal>
            <JoinLeagueDialog>
              <section className='flex gap-2 items-center px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 hover:shadow-lg transition-all'>
                <h3 className='text-xl text-white'>Join League</h3>
                <Users size={22} color='white' />
              </section>
            </JoinLeagueDialog>
          </div>
        </SignedIn>
      </div>

      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-9rem)] h-[calc(100svh-8rem-var(--navbar-height))]'>
        <div className='mt-2 mb-4'>
          <div className='flex flex-col gap-4'>
            {currentLeagues.length + inactiveLeagues.length > 0
              ? (
                <LeagueGrid leagues={currentLeagues} />
              ) : (
                <>
                  <SignedIn>
                    <h1 className='text-3xl'>No Leagues Yet...</h1>
                  </SignedIn>
                  <SignedOut>
                    <h1 className='text-3xl'>Sign in or sign up to view and create leagues</h1>
                  </SignedOut>
                </>
              )}
          </div>
          <SignedOut>
            <SignIn forceRedirectUrl='/leagues' />
          </SignedOut>
          {inactiveLeagues.length > 0 && <Separator className='my-4' />}
          <LeagueGrid leagues={inactiveLeagues} isInactive />
        </div>
        <ScrollBar className='pt-2 pb-4' />
      </ScrollArea>
    </div>
  );
}


