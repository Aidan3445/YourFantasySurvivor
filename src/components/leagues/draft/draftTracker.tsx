'use client';

import { useMemo } from 'react';
import { useDraft } from '~/hooks/useDraft';
import { useLeague } from '~/hooks/useLeague';
import { type LeagueHash } from '~/server/db/defs/leagues';

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
    <section className='w-full col-span-2 bg-secondary rounded-3xl border overflow-x-hidden'>
      {loggedIn?.displayName === nextUp?.displayName ? (
        <span className='flex flex-col items-center justify-around text-center'>
          <h1 className='text-2xl font-semibold'>{'You\'re on the clock!'}</h1>
          <p>Make your pick below!</p>
        </span>
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
