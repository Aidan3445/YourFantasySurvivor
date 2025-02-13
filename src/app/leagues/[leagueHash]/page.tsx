import LeagueHeader from '~/components/leagues/leagueHeader';

export interface LeaguePageProps {
  params: Promise<{
    leagueHash: string;
  }>;
}

export default async function LeaguePage() {
  return (
    <main>
      <LeagueHeader />
    </main>
  );
}
