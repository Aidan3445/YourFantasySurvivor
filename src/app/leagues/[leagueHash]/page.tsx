import LeagueRouter from '~/components/leagues/leagueRouter';

export interface LeaguePageProps {
  params: Promise<{
    leagueHash: string;
  }>;
}

export default async function LeaguePage() {
  return (
    <main>
      <LeagueRouter currentRoute='main' />
      MAIN PAGE
    </main>
  );
}
