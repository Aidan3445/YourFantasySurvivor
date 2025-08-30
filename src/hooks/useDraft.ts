import { type NonUndefined } from 'react-hook-form';
import useSWR, { type Fetcher } from 'swr';
import { type QUERIES } from '~/app/api/leagues/query';
import { type SWRKey } from '~/lib/utils';
import { type LeagueHash } from '~/types/leagues';

export type Draft = NonUndefined<Awaited<ReturnType<typeof QUERIES.getDraft>>>;

const draftFetcher: Fetcher<Draft, SWRKey> = ({ leagueHash }) =>
  fetch(`/api/leagues/${leagueHash}/draft`)
    .then((res) => res.json());

export function useDraft(leagueHash: LeagueHash) {
  const { data: draft, mutate } = useSWR<Draft, Error>(
    { leagueHash, key: 'draft' }, draftFetcher, { refreshInterval: 1000 }
  );

  return {
    draft: draft ?? nonDraft,
    refresh: mutate
  };
}

const nonDraft: Draft = {
  picks: [],
  castaways: [],
  tribes: [],
  predictions: [],
};
