'use client';

import PredictionHistory from '~/components/leagues/hub/activity/predictionHistory/view';
import MakePredictions from '~/components/leagues/hub/picks/predictions/makePredictions';

export default function Predictions() {
  return (
    <div className='space-y-4 w-[calc(100svw-2rem)] md:w-[calc(100svw-3.25rem-var(--sidebar-width))]'>
      <MakePredictions />
      <PredictionHistory />
    </div>
  );
}
