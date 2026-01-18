'use client';

import { useState } from 'react';
import { Button } from '~/components/common/button';
import { Card } from '~/components/common/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '~/components/common/alertDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import playShotInTheDarkAction from '~/actions/playShotInTheDark';
import cancelShotInTheDarkAction from '~/actions/cancelShotInTheDark';
import { Dices, ShieldCheck } from 'lucide-react';

export default function ShotInTheDark() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const leagueData = useLeagueData();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!league || !leagueData.leagueSettings?.shotInTheDarkEnabled || !leagueData.leagueMembers?.loggedIn) {
    return null;
  }

  const loggedInMemberId = leagueData.leagueMembers.loggedIn.memberId;
  const shotStatus = leagueData.shotInTheDarkStatus?.[loggedInMemberId];
  const hasUsedThisSeason = leagueData.selectionTimeline?.shotInTheDark?.[loggedInMemberId];
  const isPending = shotStatus?.status === 'pending';

  // Check if we're in the activation window (episode not airing)
  const previousEpisode = leagueData.keyEpisodes?.previousEpisode;
  const nextEpisode = leagueData.keyEpisodes?.nextEpisode;
  const isActivationWindow = previousEpisode?.airStatus !== 'Airing' && !!nextEpisode;

  // If already used and not pending, show used message
  if (hasUsedThisSeason && !isPending) {
    return (
      <Card className='p-4 opacity-50 border-2'>
        <div className='flex items-center gap-2 mb-2'>
          <ShieldCheck className='w-5 h-5 stroke-muted-foreground' />
          <h3 className='font-bold text-muted-foreground'>Shot in the Dark</h3>
        </div>
        <p className='text-sm text-muted-foreground'>
          Shot in the Dark has been used this season
        </p>
      </Card>
    );
  }

  // If not in activation window and not pending, don't show
  if (!isActivationWindow && !isPending) {
    return null;
  }

  const handleActivate = async () => {
    if (!league) return;

    setShowConfirmation(false);
    setShowAnimation(true);
    setIsSubmitting(true);

    try {
      await playShotInTheDarkAction(league.hash);
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });

      // Keep animation showing for 2 seconds
      setTimeout(() => {
        setShowAnimation(false);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate';
      alert(errorMessage);
      setShowAnimation(false);
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!league) return;
    setIsSubmitting(true);

    try {
      await cancelShotInTheDarkAction(league.hash);
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });
      setIsSubmitting(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel';
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className='p-4 border-2 border-primary'>
        <div className='flex items-center gap-2 mb-2'>
          <Dices className='w-5 h-5 stroke-primary' />
          <h3 className='font-bold'>Shot in the Dark</h3>
        </div>

        {!isPending ? (
          <>
            <p className='text-sm mb-4'>
              You have <strong>1 Shot in the Dark</strong> remaining this season.
              Activate it to protect your streak if your castaway is eliminated this episode.
            </p>

            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={isSubmitting}
              className='w-full'
            >
              <Dices className='w-4 h-4 mr-2' />
              Activate Protection
            </Button>
          </>
        ) : (
          <div className='space-y-3'>
            <p className='text-sm text-green-600 font-bold'>
              ✓ Shot in the Dark is active for the next episode
            </p>
            <p className='text-xs text-muted-foreground'>
              Your streak will be protected if your castaway is eliminated.
            </p>
            <Button
              variant='outline'
              onClick={handleCancel}
              disabled={isSubmitting}
              className='w-full'
            >
              Cancel Protection
            </Button>
          </div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Shot in the Dark?</AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              <p>
                This will protect your survival streak if your castaway is eliminated in the next episode.
              </p>
              <p className='text-destructive font-semibold'>
                This is a one-time use and cannot be undone once the episode starts airing!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} disabled={isSubmitting}>
              Confirm Activation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activation Animation */}
      {showAnimation && (
        <div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center'>
          <div className='text-center space-y-4 animate-in fade-in zoom-in duration-500'>
            <ShieldCheck className='w-24 h-24 stroke-green-500 mx-auto animate-pulse' />
            <div className='text-white text-4xl font-bold animate-pulse'>
              PROTECTED
            </div>
            <div className='text-white/80 text-lg'>
              Your streak is safe
            </div>
          </div>
        </div>
      )}
    </>
  );
}
