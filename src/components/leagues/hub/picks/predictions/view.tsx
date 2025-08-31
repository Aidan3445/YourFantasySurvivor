'use client';

import { usePredictions } from '~/hooks/usePredictions';
import { useLeague } from '~/hooks/useLeague';
import PredictionHistory from '../../activity/predictionHistory/view';
import MakePredictions from './makePredictions';

export default function Predictions() {
  const { leagueData, league } = useLeague();
  const { predictions, history, betRules } = usePredictions();

  const displayName = league?.members?.loggedIn?.displayName;

  if (!displayName) return null;

  const myScore = [...leagueData.scores.Member[displayName]!].pop();

  return (
    <>
      <MakePredictions predictions={predictions} betRules={betRules} myScore={myScore} />
      <PredictionHistory history={history} />
    </>
  );
}