'use client';

import { ListPlus, Users } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import JoinLeagueModal from '~/components/leagues/actions/league/join/modal';
import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { Separator } from '~/components/common/separator';
import LeagueGrid from '~/components/leagues/grid/leagueGrid';
import { useLeagues } from '~/hooks/user/useLeagues';
import { useMemo } from 'react';
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
      <div className='sticky z-50 flex flex-col w-full justify-center bg-card shadow-lg shadow-primary/20 px-4 py-4 items-center border-b-2 border-primary/20'>
        <div className='text-center'>
          <span className='flex items-center justify-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight'>My Leagues</h1>
            <span className='h-6 w-1 bg-primary rounded-full' />
          </span>
          <p className='text-muted-foreground text-pretty text-sm md:text-base font-medium'>
            {currentLeagues.length + inactiveLeagues.length > 0 ?
              'View and manage your leagues below.' :
              'Create and join leagues to compete with others!'}
          </p>
        </div>

        <SignedIn>
          <div className='flex gap-3 mt-3'>
            <CreateLeagueModal>
              <section className='flex gap-2 items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all cursor-pointer'>
                <ListPlus size={20} className='stroke-primary-foreground shrink-0' />
                <h3 className='text-sm font-bold uppercase tracking-wider text-primary-foreground'>Create League</h3>
              </section>
            </CreateLeagueModal>
            <JoinLeagueModal>
              <section className='flex gap-2 items-center px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all cursor-pointer'>
                <Users size={20} className='stroke-white shrink-0' />
                <h3 className='text-sm font-bold uppercase tracking-wider text-white'>Join League</h3>
              </section>
            </JoinLeagueModal>
          </div>
        </SignedIn>
      </div>

      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-10.5rem)] h-[calc(100svh-9.5rem-var(--navbar-height))]'>
        <div className='mt-2 mb-4'>
          <div className='flex flex-col gap-4'>
            {currentLeagues.length + inactiveLeagues.length > 0
              ? (
                <LeagueGrid leagues={currentLeagues} />
              ) : (
                <>
                  <SignedIn>
                    <div className='text-center py-8'>
                      <h1 className='text-2xl font-black uppercase tracking-tight text-muted-foreground'>No Leagues Yet...</h1>
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className='text-center py-8'>
                      <h1 className='text-2xl font-black uppercase tracking-tight text-muted-foreground'>Sign in or sign up to view and create leagues</h1>
                    </div>
                  </SignedOut>
                </>
              )}
          </div>
          <SignedOut>
            <SignIn forceRedirectUrl='/leagues' />
          </SignedOut>
          {inactiveLeagues.length > 0 && <Separator className='my-6 bg-primary' />}
          <LeagueGrid leagues={inactiveLeagues} isInactive />
        </div>
        <ScrollBar className='pt-2 pb-4' />
      </ScrollArea>
    </div>
  );
}


