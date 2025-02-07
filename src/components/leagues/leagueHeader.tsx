'use client';
import { useLeague } from '~/hooks/useLeague';

export default function LeagueHeader() {
  const {
    league: {
      leagueName
    }
  } = useLeague();

  return (
    <h1 className='text-2xl font-bold'>{leagueName}</h1>
  );
}
