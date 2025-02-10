'use client';

import { createContext, useState, type ReactNode } from 'react';
import { type NonUndefined } from 'react-hook-form';
import { type QUERIES } from '~/app/api/leagues/query';

export type CurrentLeagueType = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeague>>>;

type LeagueContextProps = {
  league: CurrentLeagueType;
  updateLeague: (league: CurrentLeagueType) => void;
};

export const LeagueContext = createContext<LeagueContextProps | undefined>(undefined);

interface LeagueProviderProps {
  league: CurrentLeagueType;
  children: ReactNode;
}

export default function LeagueProvider({ league, children }: LeagueProviderProps) {
  const [currentLeague, setCurrentLeague] = useState<CurrentLeagueType>(league);

  return (
    <LeagueContext.Provider value={{ league: currentLeague, updateLeague: setCurrentLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}
