import { ListPlus } from 'lucide-react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { Separator } from '~/components/common/separator';
import LeagueGrid from '~/components/leagues/grid/leagueGrid';
import getUserLeagues from '~/services/users/query/userLeagues';
import { auth } from '@clerk/nextjs/server';

export default async function LeaguesPage() {
  const { userId } = await auth();
  const leagues = await getUserLeagues(userId ?? '');

  const { currentLeagues, inactiveLeagues } = leagues.reduce((acc, league) => {
    if (league.league.status === 'Inactive') {
      acc.inactiveLeagues.push(league);
    } else {
      acc.currentLeagues.push(league);
    }
    return acc;
  }, { currentLeagues: [] as typeof leagues, inactiveLeagues: [] as typeof leagues });

  return (
    <main className='w-full flex flex-col gap-5 items-center text-center'>
      <div className='w-full place-items-center space-y-2'>
        {leagues.length > 0 ?
          <h1 className='text-3xl w-5/6 bg-secondary rounded-full mt-10'>My Leagues</h1> :
          <>
            <SignedIn>
              <h1 className='text-3xl'>No Leagues Yet...</h1>
            </SignedIn>
            <SignedOut>
              <h1 className='text-3xl'>Sign in or sign up to view and create leagues</h1>
            </SignedOut>
          </>}
        <LeagueGrid leagues={currentLeagues} />
      </div>
      {currentLeagues.length === 0 &&
        <SignedIn>
          <h2 className='text-2xl'>No leagues for this season yet... Create one to get started!</h2>
        </SignedIn>
      }
      <SignedIn>
        <CreateLeagueModal>
          <section className='flex gap-2 items-center px-2 py-1 rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all'>
            <h3 className='text-xl'>Create New League</h3>
            <ListPlus size={24} />
          </section>
        </CreateLeagueModal>
      </SignedIn>
      <SignedOut>
        <SignIn forceRedirectUrl='/leagues' />
      </SignedOut>
      <Separator className='w-11/12 mt-3' />
      <LeagueGrid leagues={inactiveLeagues} isInactive />
      <pre className='text-left'>
        {JSON.stringify(leagues, null, 2)}
      </pre>
    </main>
  );
}


