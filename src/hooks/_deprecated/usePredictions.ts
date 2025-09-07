import { useParams } from 'next/navigation';
import { useState } from 'react';
import { type leaguesService as QUERIES } from '~/services/deprecated/leagues';
import { defaultShauhinModeSettings, type ShauhinModeSettings } from '~/types/events';
import useSWR, { type Fetcher } from 'swr';
import { type SWRKey } from '~/lib/utils';

type Response = {
  predictions: Awaited<ReturnType<typeof QUERIES.getThisWeeksPredictions>>;
  history: Awaited<ReturnType<typeof QUERIES.getMyPredictions>>;
  betRules: ShauhinModeSettings;
};

const predictionsFetcher: Fetcher<Response, SWRKey> = async ({ leagueHash }) =>
  fetch(`/api/leagues/${leagueHash}/predictions`)
    .then((res) => res.json());

export function usePredictions() {
  const { leagueHash } = useParams();
  const [error, setError] = useState<string | null>(null);

  const { data, mutate } = useSWR<Response>({ leagueHash, key: 'predictions' }, predictionsFetcher, {
    refreshInterval: 60000,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    onError: (err) => {
      console.error('Error fetching predictions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching predictions');
    },
  });

  const predictions = data?.predictions;
  const history = data?.history;
  const betRules = data?.betRules ?? defaultShauhinModeSettings;


  return {
    predictions,
    history,
    betRules,
    error,
    fetchAllData: mutate,
  };
}



