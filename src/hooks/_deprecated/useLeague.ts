'use client';

import { redirect, useParams } from 'next/navigation';
import { type NonUndefined } from 'react-hook-form';
import useSWR, { type Fetcher } from 'swr';
import { type leaguesService as QUERIES } from '~/services/deprecated/leagues';
import { type SWRKey } from '~/lib/utils';
import { defaultBaseRules, defaultPredictionRules, defaultShauhinModeSettings } from '~/types/events';
import { type LeagueHash } from '~/types/deprecated/leagues';

export type League = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeague>>>;
export type LeagueData = NonUndefined<Awaited<ReturnType<typeof QUERIES.getLeagueLiveData>>>;

type Response = {
  league: League,
  leagueData: LeagueData,
  episodeAiring: boolean
};

const leagueFetcher: Fetcher<Response, SWRKey> = ({ leagueHash }) =>
  fetch(`/api/leagues/${leagueHash}`)
    .then((res) => res.json());

interface UseLeagueProps {
  overrideLeagueHash?: LeagueHash;
}

export function useLeague({ overrideLeagueHash }: UseLeagueProps = {}) {
  const { leagueHash: paramHash } = useParams();
  const leagueHash = overrideLeagueHash ?? paramHash;

  const { data, mutate } = useSWR<Response>({ leagueHash, key: 'league' }, leagueFetcher,
    {
      refreshInterval: (data) => {
        // no refresh if league is inactive or no data
        if (!data?.league || data.league.leagueStatus === 'Inactive') return 0;
        // if an episode is airing, refresh every 10 seconds
        if (data.episodeAiring) return 10000;
        // otherwise, refresh every minute
        return 60000;
      },
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    });

  const league = data?.league;
  const leagueData = data?.leagueData;

  try {
    return {
      league: league ? {
        ...league,
        baseEventRules: league.baseEventRules ?? defaultBaseRules,
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
        })),
        baseEventRules: leagueData.baseEventRules ?? defaultBaseRules
      } : emptyData,
      refresh: mutate
    };
  } catch {
    redirect('/leagues');
  }
}

export const nonLeague: League = {
  leagueHash: '',
  leagueName: '',
  leagueStatus: 'Inactive',
  leagueEventRules: [],
  baseEventRules: { ...defaultBaseRules, leagueId: 0 },
  basePredictionRules: { ...defaultPredictionRules },
  shauhinModeSettings: { ...defaultShauhinModeSettings, leagueId: 0 },
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

export const emptyData: LeagueData = {
  episodes: [],
  castaways: [],
  tribes: [],
  leagueEvents: {
    directEvents: [],
    predictionEvents: []
  },
  baseEvents: {},
  baseEventRules: defaultBaseRules,
  basePredictions: [],
  basePredictionRules: defaultPredictionRules,
  selectionTimeline: {
    memberCastaways: {},
    castawayMembers: {}
  },
  scores: {
    Castaway: {},
    Tribe: {},
    Member: {}
  },
  currentStreaks: {},
};

