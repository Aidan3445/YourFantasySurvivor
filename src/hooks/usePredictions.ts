import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QUERIES } from '~/app/api/leagues/query';
import { defaultShauhinModeSettings, ShauhinModeSettings } from '~/server/db/defs/events';
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
      setError(err.message);
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



