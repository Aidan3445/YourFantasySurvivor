'use client';

import { useMemo } from 'react';
import { useDraft } from '~/hooks/useDraft';
import { useLeague } from '~/hooks/useLeague';
import { type LeagueHash } from '~/server/db/defs/leagues';
import DraftOrder from '../draftOrder';
import ChooseCastaway from './chooseCastaway';

interface DraftTrackerProps {
  leagueHash: LeagueHash;
}

export default function DraftTracker({ leagueHash }: DraftTrackerProps) {
  const { draft } = useDraft(leagueHash);
  const {
    league: {
      members: {
        loggedIn
      }
    }
  } = useLeague();
  const { nextUp, onDeck } = useMemo(() => {
    const nextUpIndex = draft?.picks.findIndex((pick) => !pick?.draftPick);

    if (nextUpIndex === undefined || nextUpIndex === -1) return { nextUp: null, onDeck: null };

    return { nextUp: draft!.picks[nextUpIndex], onDeck: draft!.picks[nextUpIndex + 1] };

  }, [draft]);


  return (
    <section className='w-full space-y-4 bg-secondary rounded-3xl border overflow-x-hidden p-4'>
      <DraftOrder />
      {loggedIn?.displayName === nextUp?.displayName ? (
        <ChooseCastaway castaways={draft!.castaways} />
      ) : (
        <span className='flex flex-col items-center justify-around text-center'>
          <h2 className='text-2xl'> Next up: {nextUp?.displayName}</h2>
          {loggedIn?.displayName === onDeck?.displayName ? (
            <h4 className='text-lg'>{'You\'re on deck!'}</h4>
          ) : (
            <h4 className='text-lg'> On deck: {onDeck?.displayName}</h4>
          )}
        </span>
      )}
    </section>
  );
}
