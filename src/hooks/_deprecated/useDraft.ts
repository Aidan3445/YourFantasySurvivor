import { type NonUndefined } from 'react-hook-form';
import useSWR, { type Fetcher } from 'swr';
import { type leaguesService as QUERIES } from '~/services/deprecated/leagues';
import { type SWRKey } from '~/lib/utils';
import { type Hash } from '~/types/deprecated/leagues';

export type Draft = NonUndefined<Awaited<ReturnType<typeof QUERIES.getDraft>>>;

const draftFetcher: Fetcher<Draft, SWRKey> = ({ hash }) =>
  fetch(`/api/leagues/${hash}/draft`)
    .then((res) => res.json());

export function useDraft(hash: Hash) {
  const { data: draft, mutate } = useSWR<Draft, Error>(
    { hash, key: 'draft' }, draftFetcher, { refreshInterval: 1000 }
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
