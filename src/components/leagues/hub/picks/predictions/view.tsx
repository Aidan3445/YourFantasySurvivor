'use client';

import PredictionHistory from '~/components/leagues/hub/activity/predictionHistory/view';
import MakePredictions from '~/components/leagues/hub/picks/predictions/makePredictions';

export default function Predictions() {
  return (
    <>
      <MakePredictions />
      <PredictionHistory />
    </>
  );
}
