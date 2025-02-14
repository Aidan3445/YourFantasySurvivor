import { type NonUndefined } from 'react-hook-form';
import useSWR, { type Fetcher } from 'swr';
import { type QUERIES } from '~/app/api/leagues/query';
import { type LeagueHash } from '~/server/db/defs/leagues';

export type Draft = NonUndefined<Awaited<ReturnType<typeof QUERIES.getDraft>>>;

const draftFetcher: Fetcher<Draft, string> = (leagueHash: LeagueHash) =>
  fetch(`/api/leagues/${leagueHash}/draft`)
    .then((res) => res.json());

export function useDraft(leagueHash: LeagueHash) {
  const { data: draft, error, isLoading } = useSWR<Draft, Error>(
    leagueHash, draftFetcher, { refreshInterval: 0 }
  );

  return {
    draft,
    error,
    isLoading,
  };
}
