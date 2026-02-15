'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogHeader, AlertDialogTitle
} from '~/components/common/alertDialog';
import { Button } from '~/components/common/button';
import { TorchIcon } from '~/components/icons/generated';
import TutorialCarousel from '~/components/shared/tutorial/carousel';
import { cn } from '~/lib/utils';

interface TutorialPromptProps {
  /** Whether to show the initial "Want a walkthrough?" prompt */
  open: boolean;
  /** Called when the user dismisses (skip or completes tutorial) */
  onDismiss: () => void;
  /** Show customization callouts — true for creators, false for joiners */
  showCustomization?: boolean;
}

export default function TutorialPrompt({ open, onDismiss, showCustomization = true }: TutorialPromptProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleSkip = () => {
    setShowTutorial(false);
    onDismiss();
  };

  const handleComplete = () => {
    setShowTutorial(false);
    onDismiss();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleSkip(); }}>
      <AlertDialogContent className={cn(
        'flex flex-col animate-scale-in-fast border-primary/30 shadow-lg shadow-primary/20',
        showTutorial ? 'sm:w-160 w-96' : 'sm:w-96 w-80'
      )}>
        {!showTutorial ? (
          <>
            <AlertDialogHeader>
              <div className='flex flex-col items-center gap-4 py-4'>
                <div className='flex items-center justify-center w-16 h-16 rounded-2xl border-2 bg-primary/10 border-primary/20'>
                  <TorchIcon size={36} className='text-primary' />
                </div>
                <AlertDialogTitle className='text-xl font-black uppercase tracking-tight text-center'>
                  Want a quick walkthrough?
                </AlertDialogTitle>
                <AlertDialogDescription className='text-base text-muted-foreground text-center max-w-xs'>
                  Learn how scoring, predictions, and drafting work
                  {showCustomization ? ' — plus how to customize your league.' : '.'}
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='flex-1 border-2 border-primary/20 font-bold'
                onClick={handleSkip}>
                Skip
              </Button>
              <Button
                className='flex-2 font-bold uppercase text-sm tracking-wider'
                onClick={() => setShowTutorial(true)}>
                Show Me
              </Button>
            </div>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <span className='flex items-center gap-3 mb-2'>
                <span className='h-6 w-1 bg-primary rounded-full' />
                <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
                  How to Play
                </AlertDialogTitle>
              </span>
              <AlertDialogDescription className='sr-only'>
                Learn how Trial by Fire fantasy scoring works.
              </AlertDialogDescription>
              <TutorialCarousel
                onComplete={handleComplete}
                showCustomization={showCustomization} />
            </AlertDialogHeader>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
