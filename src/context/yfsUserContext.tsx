'use client';

import { type ReactNode, createContext, useState } from 'react';
import { type NonUndefined } from 'react-hook-form';
import { type leaguesService as QUERIES } from '~/services/deprecated/leagues';
import { type LeagueHash } from '~/types/deprecated/leagues';

export type LeaguesList = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeagues>>>;
export type LeagueInfo = LeaguesList[number];

type YfsUserContextProps = {
  leagues: LeaguesList;
  addLeague: (newLeague: LeagueInfo) => void;
  removeLeague: (leagueHash: LeagueHash) => void;
};

export const YfsUserContext = createContext<YfsUserContextProps | undefined>(undefined);

interface YfsUserProviderProps {
  leagues: LeaguesList;
  children: ReactNode;
}

export default function YfsUserProvider({ leagues, children }: YfsUserProviderProps) {
  const [leaguesList, setLeaguesList] = useState<LeaguesList>(leagues);

  const addLeague = (newLeague: LeagueInfo) => {
    setLeaguesList([...leaguesList, newLeague]);
  };

  const removeLeague = (leagueHash: LeagueHash) => {
    setLeaguesList(leaguesList.filter((league) => league.leagueHash !== leagueHash));
  };

  const props: YfsUserContextProps = {
    leagues: leaguesList,
    addLeague,
    removeLeague
  };

  return (
    <YfsUserContext.Provider value={props}>
      {children}
    </YfsUserContext.Provider>
  );
}
