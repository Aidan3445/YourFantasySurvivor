import { useParams } from 'next/navigation';
import { type NonUndefined } from 'react-hook-form';
import useSWR, { type Fetcher } from 'swr';
import { type QUERIES } from '~/app/api/leagues/query';
import { type SWRKey } from '~/lib/utils';
import { defaultBaseRules } from '~/server/db/defs/events';

export type League = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeague>>>;

const leagueFetcher: Fetcher<League, SWRKey> = ({ leagueHash }) =>
  fetch(`/api/leagues/${leagueHash}`)
    .then((res) => res.json());

export function useLeague() {
  const { leagueHash } = useParams();

  const { data: league, mutate } = useSWR<League>({ leagueHash, key: 'league' }, leagueFetcher, { refreshInterval: 10000, revalidateOnMount: true }
  );

  return {
    league: league ? {
      ...league,
      settings: {
        ...league.settings,
        draftDate: league.settings.draftDate ? new Date(league.settings.draftDate) : null
      }
    } : nonLeague,
    refresh: mutate
  };
}

const nonLeague: League = {
  leagueHash: '',
  leagueName: '',
  leagueStatus: 'Inactive',
  customEventRules: [],
  baseEventRules: { ...defaultBaseRules, leagueId: 0 },
  members: {
    list: [],
    loggedIn: undefined
  },
  season: '',
  settings: {
    leagueId: 0,
    draftDate: null,
    draftOrder: [],
    survivalCap: 5
  }
};


