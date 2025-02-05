import { QUERIES } from '~/app/api/leagues/query';

export interface LeaguePageProps {
  params: Promise<{
    leagueHash: string;
  }>;
}

export default async function LeaguePage(props: LeaguePageProps) {
  const { leagueHash } = await props.params;

  const leagueResponse = await QUERIES.getLeague(leagueHash);
  if (!leagueResponse) return <div>League not found</div>;

  const { league, league_settings: settings } = leagueResponse;

  return (
    <main className='flex flex-col gap-0 text-center w-full' >
      <h1 className='text-2xl font-bold'>{league.leagueName}</h1>
      {JSON.stringify(settings)}
    </main>
  );
}
