import { useContext } from 'react';
import { LeagueContext } from '~/context/leagueContext';

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }

  const { currentLeague, updateLeague } = context;

  const draftDate = currentLeague.league_settings.draftDate ? new Date(currentLeague.league_settings.draftDate) : null;

  return {
    currentLeague: {
      ...currentLeague,
      settings: {
        ...currentLeague?.league_settings,
        draftDate,
      }
    },
    updateLeague,
  };
}
