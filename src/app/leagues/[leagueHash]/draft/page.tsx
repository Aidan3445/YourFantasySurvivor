import LeagueRouter from '~/components/leagues/leagueRouter';

export default function DraftPage() {
  return (
    <div>
      <LeagueRouter currentRoute='draft' />
      <h1>draft page</h1>
    </div>
  );
}
