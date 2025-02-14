import { useContext } from 'react';
import { LeagueContext } from '~/context/leagueContext';
import { type LeagueStatus } from '~/server/db/defs/leagues';

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }

  const { selectedLeague: league, setSelectedLeague } = context;

  const draftDate = league?.settings?.draftDate ?
    new Date(league?.settings?.draftDate) : null;

  const updateLeagueStatus = (newStatus: LeagueStatus) => {
    setSelectedLeague({
      ...league,
      leagueStatus: newStatus,
    });
  };

  return {
    league: {
      ...league,
      settings: {
        ...league?.settings,
        draftDate,
      }
    },
    updateLeagueStatus,
  };
}
