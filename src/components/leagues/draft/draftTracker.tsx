'use client';

import { getContrastingColor } from '@uiw/color-convert';
import ChooseCastaway from '~/components/leagues/draft/chooseCastaway';
import ColorRow from '~/components/shared/colorRow';
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '~/components/common/alertDialog';
import MakePredictions from '~/components/leagues/actions/events/predictions/view';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useLeagueActionDetails';
import { useEffect, useMemo } from 'react';
import SkipMember from '~/components/leagues/draft/skipMember';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { Card, CardContent, CardHeader } from '~/components/common/card';
import { useRouter } from 'next/navigation';

interface DraftTrackerProps {
  hash: string;
}

export default function DraftTracker({ hash }: DraftTrackerProps) {
  const router = useRouter();
  const {
    league,
    onTheClockIndex,
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

  useEffect(() => {
    if (league && onTheClockIndex !== null && (onTheClockIndex === -1 || league.status !== 'Draft')) {
      router.push(`/leagues/${league.hash}`);
    }
  }, [onTheClockIndex, league?.status, league?.hash, router, league]);

  return (
    <section className='w-full space-y-4'>
      <Card className='flex flex-col border-2 border-primary/20 relative'>
        {/* Accent Elements */}
        <div className='absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl' />

        <CardHeader className='flex items-center gap-3 mb-2'>
          <div className='h-6 w-1 bg-primary rounded-full' />
          <h2 className='text-2xl font-black uppercase tracking-wider text-card-foreground relative z-10'>
            Draft Order
          </h2>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-2 relative z-10'>
          {leagueMembers?.members.map((pick, index) => (
            <ColorRow
              key={pick.memberId}
              className={onTheClock?.memberId === pick.memberId ?
                'animate-pulse border-2 border-primary/10' : 'border-2 border-transparent'}
              color={pick.color}
              loggedIn={leagueMembers.loggedIn?.displayName === pick.displayName}>
              <h3
                className='text-lg w-6 font-bold'
                style={{ color: getContrastingColor(pick.color) }}>
                {index + 1}
              </h3>
              <h2
                className='text-3xl font-black text-nowrap'
                style={{ color: getContrastingColor(pick.color) }}>
                {pick.displayName}
              </h2>
              {onTheClock?.memberId === pick.memberId && (
                <>
                  {!isMobile && (
                    <h3
                      className='ml-auto inline-flex text-lg self-end animate-bounce font-bold uppercase tracking-wider'
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
                  className='ml-auto text-lg text-wrap font-medium'
                  style={{ color: getContrastingColor(pick.color) }}>
                  {membersWithPicks.find(m => m.member.memberId === pick.memberId)?.castawayFullName}
                </h3>
              )}
            </ColorRow>
          ))}
        </CardContent>
      </Card>
      {(!!onDeck?.loggedIn || !!onTheClock?.loggedIn) &&
        <ChooseCastaway draftDetails={actionDetails} onDeck={!!onDeck?.loggedIn} />}
      <MakePredictions
        rules={rules}
        predictionRuleCount={predictionRuleCount}
        predictionsMade={predictionsMade}
        castaways={castaways}
        tribes={tribes} />
      <AlertDialog open={dialogOpen ?? false} onOpenChange={setDialogOpen}>
        <AlertDialogContent className='border-2 border-primary/30'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-wider'>
              {`It's ${onDeck?.loggedIn ? 'almost ' : ' '}your turn to pick!`}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-left font-medium'>
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
            <AlertDialogAction className='w-full font-bold uppercase tracking-wider'>
              {'I\'m ready!'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section >
  );
}
