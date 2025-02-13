import { redirect } from 'next/navigation';
import { QUERIES } from '../api/leagues/query';
import Link from 'next/link';
import CreateLeagueForm from '~/components/leagues/createLeague';

export default async function LeaguesPage() {
  try {
    const myLeagues = await QUERIES.getLeagues();
    return (
      <main className='w-full flex flex-col gap-5'>
        <h1 className='text-3xl'>My Leagues</h1>
        {myLeagues.map(league => (
          <Link
            key={league.leagueHash}
            className='w-5/6 mx-5'
            href={`/leagues/${league.leagueHash}`}>
            <section className='px-2 py-1 rounded-lg bg-card'>
              <h3 className='text-xl'>{league.leagueName}</h3>
              <p className='text-sm'>{league.season}</p>
              <p>{league.castaway}</p>
            </section>
          </Link>
        ))}
        <h2 className='text-2xl'>Create a new League</h2>
        <CreateLeagueForm />
      </main>
    );
  } catch {
    redirect('/leagues/new');
  }
}


