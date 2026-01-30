import LeagueHeaderClient from '~/components/leagues/layout/leagueHeaderClient';
import { type PublicLeague } from '~/types/leagues';

interface LeagueHeaderProps {
  league: PublicLeague | null;
  mode?: {
    isProtected?: boolean;
    isPending?: boolean;
  };
}

export default function LeagueHeader({ league, mode }: LeagueHeaderProps) {
  if (!league) {
    return null;
  }

  return (
    <LeagueHeaderClient
      name={league.name}
      season={league.season}
      status={league.status}
      mode={mode} />
  );
}
