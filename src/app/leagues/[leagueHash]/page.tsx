import LeagueHeader from '~/components/leagues/leagueHeader';

export interface LeaguePageProps {
  params: Promise<{
    leagueHash: string;
  }>;
}

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 text-center w-full' >
      <LeagueHeader />
    </main>
  );
}
