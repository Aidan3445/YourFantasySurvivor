import { redirect, useParams } from 'next/navigation';
import { type NonUndefined } from 'react-hook-form';
import useSWR, { type Fetcher } from 'swr';
import { type QUERIES } from '~/app/api/leagues/query';
import { type SWRKey } from '~/lib/utils';
import { defaultBaseRules } from '~/server/db/defs/events';

export type League = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeague>>>;
export type LeagueData = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeagueLiveData>>>;

type Response = {
  league: League,
  leagueData: LeagueData
};

const leagueFetcher: Fetcher<Response, SWRKey> = ({ leagueHash }) =>
  fetch(`/api/leagues/${leagueHash}`)
    .then((res) => res.json());

export function useLeague() {
  const { leagueHash } = useParams();
  const { data, mutate } = useSWR<Response>({ leagueHash, key: 'league' }, leagueFetcher,
    {
      refreshInterval: 60000,
      refreshWhenHidden: false
    });

  const league = data?.league;
  const leagueData = data?.leagueData;

  try {
    return {
      league: league ? {
        ...league,
        settings: {
          ...league.settings,
          draftDate: league.settings.draftDate ? new Date(league.settings.draftDate) : null
        },
      } : nonLeague,
      leagueData: leagueData ? {
        ...leagueData,
        episodes: leagueData.episodes.map(episode => ({
          ...episode,
          episodeAirDate: new Date(episode.episodeAirDate)
        }))
      } : emptyData,
      refresh: mutate
    };
  } catch {
    redirect('/leagues');
  }
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
    survivalCap: 5,
    preserveStreak: true
  },
};

const emptyData: LeagueData = {
  scores: {
    Castaway: {},
    Tribe: {},
    Member: {}
  },
  baseEvents: {},
  castaways: [],
  leagueEvents: {
    directEvents: [],
    predictionEvents: []
  },
  selectionTimeline: {
    memberCastaways: {},
    castawayMembers: {}
  },
  episodes: [],
  baseEventRules: defaultBaseRules
};

