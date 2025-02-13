'use client';

import { createContext, useState, type ReactNode } from 'react';
import { type NonUndefined } from 'react-hook-form';
import { type QUERIES } from '~/app/api/leagues/query';

export type League = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeague>>>;

type LeagueContextProps = {
  selectedLeague: League;
  setSelectedLeague: (league: League) => void;
};

export const LeagueContext = createContext<LeagueContextProps | undefined>(undefined);

interface LeagueProviderProps {
  league: League;
  children: ReactNode;
}

export default function LeagueProvider({ league, children }: LeagueProviderProps) {
  const [selectedLeague, setSelectedLeague] = useState<League>(league);

  const props: LeagueContextProps = {
    selectedLeague,
    setSelectedLeague,
  };

  return (
    <LeagueContext.Provider value={props}>
      {children}
    </LeagueContext.Provider>
  );
}
