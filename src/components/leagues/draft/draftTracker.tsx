'use client';

import { getContrastingColor } from '@uiw/color-convert';
import ChooseCastaway from '~/components/leagues/draft/chooseCastaway';
import ColorRow from '~/components/shared/colorRow';
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '~/components/common/alertDialog';
import MakePredictions from '~/components/leagues/actions/events/predictions/view';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useActionDetails';
import { useMemo } from 'react';
import SkipMember from '~/components/leagues/draft/skipMember';
import { useIsMobile } from '~/hooks/ui/useMobile';

interface DraftTrackerProps {
  hash: string;
}

export default function DraftTracker({ hash }: DraftTrackerProps) {
  const {
    actionDetails,
    membersWithPicks,
    onTheClock,
    onDeck,
    leagueMembers,
    rules,
    predictionRuleCount,
    settings,
    predictionsMade,
    dialogOpen,
    setDialogOpen,
  } = useLeagueActionDetails(hash);
  const isMobile = useIsMobile();

  const castaways = useMemo(() =>
    Object.values(actionDetails ?? {})
      .flatMap(({ castaways }) => castaways.map(c => c.castaway)), [actionDetails]);
  const tribes = useMemo(() =>
    Object.values(actionDetails ?? {}).map(({ tribe }) => tribe), [actionDetails]);


  return (
    <section className='w-full space-y-4 overflow-x-hidden p-4'>
      <article className='flex flex-col w-full p-2 bg-card rounded-lg'>
        <h2 className='text-lg font-bold text-card-foreground'>Draft Order</h2>
        <div className='grid grid-cols-1 gap-2'>
          {leagueMembers?.members.map((pick, index) => (
            <ColorRow
              key={pick.memberId}
              className={onTheClock?.memberId === pick.memberId ?
                'animate-pulse' : ''}
              color={pick.color}
              loggedIn={leagueMembers.loggedIn?.displayName === pick.displayName}>
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
              {onTheClock?.memberId === pick.memberId && (
                <>
                  {!isMobile && (
                    <h3
                      className='ml-auto inline-flex text-lg self-end animate-bounce'
                      style={{ color: getContrastingColor(pick.color) }}>
                      Picking...
                    </h3>
                  )}
                  {leagueMembers.loggedIn?.role !== 'Member' &&
                    pick.draftOrder < leagueMembers.members.length && (
                      <SkipMember hash={hash} member={pick} leagueMembers={leagueMembers.members} />
                    )}
                </>
              )}
              {membersWithPicks?.find(m => m.member.memberId === pick.memberId) && (
                <h3
                  className='ml-auto text-lg text-wrap'
                  style={{ color: getContrastingColor(pick.color) }}>
                  {membersWithPicks.find(m => m.member.memberId === pick.memberId)?.castawayFullName}
                </h3>
              )}
            </ColorRow>
          ))}
        </div>
      </article>
      {(!!onDeck?.loggedIn || !!onTheClock?.loggedIn) &&
        <ChooseCastaway draftDetails={actionDetails} onDeck={!!onDeck?.loggedIn} />}
      <MakePredictions
        rules={rules}
        predictionRuleCount={predictionRuleCount}
        predictionsMade={predictionsMade}
        castaways={castaways}
        tribes={tribes} />
      <AlertDialog open={dialogOpen ?? false} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {`It's ${onDeck?.loggedIn ? 'almost ' : ' '}your turn to pick!`}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-left'>
              This castaway will earn you points based on their performance in the game.
              <br />
              Additionally you will earn points for each successive episode they
              survive (i.e one point for the first episode, two for the second, etc.)
              {settings?.survivalCap ? ` up to a maximum of ${settings.survivalCap} points.` : '.'}
              <br />
              When they are voted out you will select from the remaining castaways.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className='w-full'>
              {'I\'m ready!'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section >
  );
}
