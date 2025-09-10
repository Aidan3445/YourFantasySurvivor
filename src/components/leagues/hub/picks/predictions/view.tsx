'use client';

import { useMemo } from 'react';
import PredictionHistory from '~/components/leagues/hub/activity/predictionHistory/view';
import MakePredictions from '~/components/leagues/hub/picks/predictions/makePredictions';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';

export default function Predictions() {
  const { scores, leagueMembers } = useLeagueData();

  const currentBalance = useMemo(() =>
    leagueMembers?.loggedIn ?
      scores.Member[leagueMembers.loggedIn.memberId]?.slice().pop() : undefined,
    [scores, leagueMembers]);

  if (!leagueMembers?.loggedIn) return null;

  return (
    <>
      <MakePredictions wallet={currentBalance} />
      <PredictionHistory />
    </>
  );
}
