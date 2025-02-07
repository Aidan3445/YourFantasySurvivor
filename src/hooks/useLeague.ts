import { useContext } from 'react';
import { LeagueContext } from '~/context/leagueContext';

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }

  const { currentLeague, updateLeague } = context;

  const draftDate = currentLeague.settings.draftDate ?
    new Date(currentLeague.settings.draftDate) : null;

  return {
    currentLeague: {
      ...currentLeague,
      settings: {
        ...currentLeague?.settings,
        draftDate,
      }
    },
    updateLeague,
  };
}
