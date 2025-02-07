import { useContext } from 'react';
import { LeagueContext } from '~/context/leagueContext';

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }

  const { league, updateLeague } = context;

  const draftDate = league?.settings?.draftDate ?
    new Date(league?.settings?.draftDate) : null;

  return {
    league: {
      ...league,
      settings: {
        ...league?.settings,
        draftDate,
      }
    },
    updateLeague,
  };
}
