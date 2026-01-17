import LeagueHeaderClient from '~/components/leagues/layout/leagueHeaderClient';
import { type PublicLeague } from '~/types/leagues';

interface LeagueHeaderProps {
  league: PublicLeague | null;
  joinMode?: {
    isProtected: boolean;
  };
}

export default function LeagueHeader({ league, joinMode }: LeagueHeaderProps) {
  if (!league) {
    return null;
  }

  return (
    <LeagueHeaderClient
      name={league.name}
      season={league.season}
      status={league.status}
      joinMode={joinMode} />
  );
}
