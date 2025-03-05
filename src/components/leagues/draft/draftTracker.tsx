'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDraft } from '~/hooks/useDraft';
import { useLeague } from '~/hooks/useLeague';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { getContrastingColor } from '@uiw/color-convert';
import ChooseCastaway from './chooseCastaway';
import { ColorRow } from '~/components/leagues/draftOrder';
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '~/components/ui/alertDialog';
import MakePredictions from './makePredictions';
import { useRouter } from 'next/navigation';

interface DraftTrackerProps {
  leagueHash: LeagueHash;
}

export default function DraftTracker({ leagueHash }: DraftTrackerProps) {
  const { draft } = useDraft(leagueHash);
  const {
    league: {
      leagueStatus,
      members: {
        loggedIn
      },
      settings: {
        survivalCap
      }
    }
  } = useLeague();
  const router = useRouter();

  const { onTheClock, onDeck, onTheClockIndex } = useMemo(() => {
    const onTheClockIndex = draft?.picks.findIndex((pick) => !pick?.draftPick);

    const onTheClockDisplayName = draft.picks[onTheClockIndex]?.displayName;
    const onDeckDisplayName = draft.picks[onTheClockIndex + 1]?.displayName;

    return {
      onTheClock: {
        ...draft.picks[onTheClockIndex],
        loggedIn: !!onTheClockDisplayName && onTheClockDisplayName === loggedIn?.displayName,
      },
      onDeck: {
        ...draft.picks[onTheClockIndex + 1],
        loggedIn: !!onDeckDisplayName && onDeckDisplayName === loggedIn?.displayName,
      },
      onTheClockIndex
    };
  }, [draft, loggedIn]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [closedDialog, setClosedDialog] = useState(false);

  useEffect(() => {
    if (onTheClock?.loggedIn) {
      setDialogOpen(true);
    }
  }, [onTheClock, setDialogOpen]);


  useEffect(() => {
    if (onTheClockIndex === -1 || leagueStatus !== 'Draft') {
      router.push(`/leagues/${leagueHash}`);
    }
  }, [onTheClockIndex, leagueStatus, router, leagueHash]);

  return (
    <section className='w-full space-y-4 md:bg-secondary md:rounded-3xl md:border overflow-x-hidden p-4'>
      <article className='flex flex-col w-full p-2 bg-card rounded-xl'>
        <h2 className='text-lg font-bold text-card-foreground'>Draft Order</h2>
        <div className='flex flex-col gap-2'>
          {draft?.picks.map((pick, index) => (
            <ColorRow
              key={pick.memberId}
              className={onTheClock.memberId === pick.memberId ?
                'animate-pulse items-center' : 'items-center'}
              color={pick.color}
              loggedIn={loggedIn?.displayName === pick.displayName}>
              <h3
                className='text-lg'
                style={{ color: getContrastingColor(pick.color) }}>
                {index + 1}
              </h3>
              <h2
                className='text-3xl font-semibold text-nowrap'
                style={{ color: getContrastingColor(pick.color) }}>
                {pick.displayName}
              </h2>
              {onTheClock.memberId === pick.memberId && (
                <h3
                  className='ml-auto inline-flex text-lg self-end animate-bounce'
                  style={{ color: getContrastingColor(pick.color) }}>
                  Picking...
                </h3>
              )}
              {pick.draftPick && (
                <h3
                  className='text-base md:text-lg md:self-end'
                  style={{ color: getContrastingColor(pick.color) }}>
                  {pick.draftPick}
                </h3>
              )}
            </ColorRow>
          ))}
        </div>
      </article>
      {(onDeck.loggedIn || onTheClock.loggedIn) &&
        <ChooseCastaway castaways={draft.castaways} onDeck={onDeck.loggedIn} />}
      <MakePredictions
        predictions={draft.predictions}
        castaways={draft.castaways}
        tribes={draft.tribes} />
      <AlertDialog open={dialogOpen && !closedDialog} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {'It\'s your turn to pick!'}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-left'>
              This castaway will earn you points based on their performance in the game.
              <br />
              Additionally you will earn points for each successive episode they
              survive (i.e one point for the first episode, two for the second, etc.)
              {survivalCap ? ` up to a maximum of ${survivalCap} points.` : '.'}
              <br />
              When they are voted out you will select from the remaining castaways.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className='w-full' onClick={() => setClosedDialog(true)}>
              {'I\'m ready!'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section >
  );
}
